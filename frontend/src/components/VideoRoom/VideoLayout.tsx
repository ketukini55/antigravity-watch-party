
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaStore } from '@/store/useMediaStore';
import { Maximize2, Mic, MicOff, Video, VideoOff } from 'lucide-react';

// Corner Positions Configuration
const CORNER_POSITIONS = [
    { top: 16, left: 16 },      // Top-Left
    { top: 16, right: 16 },     // Top-Right
    { bottom: 16, left: 16 },   // Bottom-Left
    { bottom: 16, right: 16 },  // Bottom-Right
];

export const VideoRoomLayout: React.FC = () => {
    const {
        localStream,
        screenStream,
        remoteStreams,
        isMicOn,
        isCameraOn,
        toggleMic,
        toggleCamera
    } = useMediaStore();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    // Effect to attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Effect to attach screen stream
    useEffect(() => {
        if (screenVideoRef.current && screenStream) {
            screenVideoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    // Convert remote streams Map to array for rendering
    const remoteStreamsArray = Array.from(remoteStreams.entries());

    // Combine local and remote streams for corner distribution
    // Typically local user is always visible, so we put them in the first corner or handle separately
    // Here we'll treat the local user as the first "corner" occupant for simplicity
    const cornerParticipants = [
        { id: 'local', stream: localStream, isLocal: true },
        ...remoteStreamsArray.map(([id, stream]) => ({ id, stream, isLocal: false }))
    ].slice(0, 4); // Limit to 4 for now as per "Handling the Corners" tip

    return (
        <div className="relative w-full h-screen bg-gray-50 flex items-center justify-center p-8 overflow-hidden">

            {/* --- Main Screen Share Container --- */}
            <div className="relative w-full max-w-6xl aspect-video bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                {screenStream ? (
                    <video
                        ref={screenVideoRef}
                        autoPlay
                        playsInline
                        muted // Always mute local screen share to avoid loop
                        className="w-full h-full object-contain bg-black"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Maximize2 className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-xl font-light">Waiting for host to share screen...</p>
                    </div>
                )}

                {/* --- Floating Action Bar (Bottom Center of Screen) --- */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMic}
                        className={`p-4 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-colors ${isMicOn ? 'bg-white/80 text-gray-800' : 'bg-red-500/80 text-white'
                            }`}
                    >
                        {isMicOn ? <Mic /> : <MicOff />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleCamera}
                        className={`p-4 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-colors ${isCameraOn ? 'bg-white/80 text-gray-800' : 'bg-red-500/80 text-white'
                            }`}
                    >
                        {isCameraOn ? <Video /> : <VideoOff />}
                    </motion.button>
                </div>
            </div>

            {/* --- Corner Camera Feeds --- */}
            <AnimatePresence>
                {cornerParticipants.map((participant, index) => {
                    const position = CORNER_POSITIONS[index];

                    return (
                        <motion.div
                            key={participant.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: index * 0.1
                            }}
                            style={{
                                position: 'absolute',
                                ...position,
                                zIndex: 50
                            }}
                            className="w-32 h-32 pointer-events-none" // Overlay container needs pointer-events-none
                        >
                            {/* Glassmorphic Container */}
                            <div
                                className="relative w-full h-full rounded-full overflow-hidden 
                           border-2 border-[#FFA500] 
                           shadow-[0_0_15px_rgba(255,165,0,0.5)] 
                           backdrop-blur-md bg-white/30 
                           pointer-events-auto" // Re-enable pointer events for interactions if needed
                            >
                                <video
                                    ref={(el) => {
                                        if (el && participant.stream) el.srcObject = participant.stream;
                                    }}
                                    autoPlay
                                    playsInline
                                    muted={participant.isLocal} // Mute local user
                                    className="w-full h-full object-cover"
                                />

                                {/* Fallback/Avatar Placeholder if video is off/missing */}
                                {!participant.stream && (
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 font-bold text-xl">
                                            {participant.id.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
