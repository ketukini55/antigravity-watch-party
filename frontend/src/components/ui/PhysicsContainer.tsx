'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { motion, useMotionValue, MotionValue } from 'framer-motion';
import clsx from 'clsx';

interface PhysicsItemData {
    id: string;
    x?: number;
    y?: number;
    className?: string;
    content: React.ReactNode;
}

interface PhysicsContainerProps {
    items: PhysicsItemData[];
    className?: string;
}

export const PhysicsContainer: React.FC<PhysicsContainerProps> = ({ items, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={clsx("relative w-full h-full overflow-hidden", className)}>
            <PhysicsContext items={items} containerRef={containerRef} />
        </div>
    );
};

// --- Sub-Component Implementation ---

const PhysicsContext = ({ items, containerRef }: { items: PhysicsItemData[], containerRef: React.RefObject<HTMLDivElement | null> }) => {
    const engineRef = useRef(Matter.Engine.create());
    const runnerRef = useRef(Matter.Runner.create());
    const requestRef = useRef<number>(0);

    // Limits
    const widthRef = useRef(0);
    const heightRef = useRef(0);

    // Registry for MotionValues
    const registry = useRef<Map<string, { x: MotionValue<number>, y: MotionValue<number>, rotate: MotionValue<number> }>>(new Map());

    // Initialize Physics
    useEffect(() => {
        const engine = engineRef.current;
        const world = engine.world;
        const runner = runnerRef.current;

        // Zero Gravity
        engine.gravity.y = 0;
        engine.gravity.x = 0;

        // Mount
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            widthRef.current = width;
            heightRef.current = height;

            // Boundaries
            const wallThickness = 1000;
            const walls = [
                Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width + 200, wallThickness, { isStatic: true }),
                Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, { isStatic: true }),
                Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + 200, { isStatic: true }),
                Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + 200, { isStatic: true }),
            ];
            Matter.World.add(world, walls);

            // Mouse Constraint
            const mouse = Matter.Mouse.create(containerRef.current);
            const mouseConstraint = Matter.MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: { visible: false }
                }
            });
            Matter.World.add(world, mouseConstraint);

            // Start Runner
            Matter.Runner.run(runner, engine);
        }

        // Loop
        const updateLoop = () => {
            const allBodies = Matter.Composite.allBodies(engine.world);

            allBodies.forEach(body => {
                if (body.label && registry.current.has(body.label)) {
                    const motionSet = registry.current.get(body.label)!;
                    motionSet.x.set(body.position.x);
                    motionSet.y.set(body.position.y);
                    motionSet.rotate.set(body.angle * (180 / Math.PI));
                }
            });

            requestRef.current = requestAnimationFrame(updateLoop);
        };

        requestRef.current = requestAnimationFrame(updateLoop);

        return () => {
            Matter.Runner.stop(runner);
            Matter.Engine.clear(engine);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Handle Items
    useEffect(() => {
        const world = engineRef.current.world;

        items.forEach(item => {
            const existingBody = Matter.Composite.allBodies(world).find(b => b.label === item.id);

            if (!existingBody && widthRef.current > 0) {
                const x = item.x || Math.random() * widthRef.current;
                const y = item.y || Math.random() * heightRef.current;

                const body = Matter.Bodies.circle(x, y, 40, {
                    label: item.id,
                    restitution: 0.9,
                    frictionAir: 0.05,
                    density: 0.01
                });

                Matter.Composite.add(world, body);

                Matter.Body.applyForce(body, body.position, {
                    x: (Math.random() - 0.5) * 0.05,
                    y: (Math.random() - 0.5) * 0.05
                });
            }
        });
    }, [items]);

    return (
        <>
            {items.map(item => (
                <PhysicsItem
                    key={item.id}
                    item={item}
                    registry={registry.current}
                />
            ))}
        </>
    );
};

// Individual Item responsible for its own MotionValues
const PhysicsItem = ({ item, registry }: { item: PhysicsItemData, registry: Map<string, { x: MotionValue<number>, y: MotionValue<number>, rotate: MotionValue<number> }> }) => {
    const x = useMotionValue(item.x || 0);
    const y = useMotionValue(item.y || 0);
    const rotate = useMotionValue(0);

    useEffect(() => {
        registry.set(item.id, { x, y, rotate });
        return () => {
            registry.delete(item.id);
        };
    }, [item.id, registry, x, y, rotate]);

    return (
        <motion.div
            style={{ x, y, rotate, position: 'absolute', top: 0, left: 0 }}
            className={clsx("w-20 h-20 -ml-10 -mt-10 cursor-grab active:cursor-grabbing", item.className)}
        >
            {item.content}
        </motion.div>
    );
};