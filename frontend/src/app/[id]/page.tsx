"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player/youtube";

// Connect to your AWS Backend
const socket = io("https://api.keee7.in");

export default function WatchRoom() {
    const params = useParams();
    const roomId = params.id;
    const playerRef = useRef<ReactPlayer>(null);

    const [playing, setPlaying] = useState(false);
    const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); // Default video
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join-room", roomId);
        });

        // Listen for Sync Events from AWS
        socket.on("sync-play", (data) => {
            setPlaying(true);
            if (playerRef.current) playerRef.current.seekTo(data.time);
        });

        socket.on("sync-pause", () => setPlaying(false));

        return () => { socket.off("connect"); socket.off("sync-play"); };
    }, [roomId]);

    const handlePlay = () => {
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        socket.emit("play-video", { roomId, time: currentTime });
    };

    const handlePause = () => {
        socket.emit("pause-video", { roomId });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-zinc-950 text-white font-sans p-6">
            <div className="w-full max-w-5xl">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Antigravity <span className="text-purple-500">Party</span></h1>
                    <div className={`px-4 py-1 rounded-full text-xs border ${connected ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                        {connected ? "● Connected to AWS" : "○ Disconnected"}
                    </div>
                </header>

                <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black border border-zinc-800 shadow-2xl">
                    <ReactPlayer
                        ref={playerRef}
                        url={url}
                        playing={playing}
                        controls={true}
                        width="100%"
                        height="100%"
                        onPlay={handlePlay}
                        onPause={handlePause}
                    />
                </div>

                <div className="mt-6 flex gap-4">
                    <input
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                        placeholder="Paste YouTube Link here..."
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}