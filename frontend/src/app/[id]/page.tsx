"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function WatchRoom() {
    const params = useParams();
    const roomId = params.id;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white font-sans">
            <div className="w-full max-w-5xl px-6">
                <header className="flex items-center justify-between py-6">
                    <h1 className="text-xl font-bold tracking-tight">
                        Antigravity <span className="text-purple-500">Party</span>
                    </h1>
                    <div className="rounded-full bg-zinc-900 px-4 py-1 text-xs border border-zinc-800">
                        Room ID: <span className="text-zinc-400">{roomId}</span>
                    </div>
                </header>

                <main className="aspect-video w-full overflow-hidden rounded-3xl bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mx-auto"></div>
                        <p className="text-zinc-500 animate-pulse text-sm">Initializing Synced Player...</p>
                    </div>
                </main>

                <footer className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                    <h3 className="text-sm font-medium mb-2">Invite Friends</h3>
                    <p className="text-xs text-zinc-500">Share your current browser URL to let others join this synchronized session.</p>
                </footer>
            </div>
        </div>
    );
}