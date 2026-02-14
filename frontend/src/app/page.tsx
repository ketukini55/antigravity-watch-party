"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createRoom = () => {
    setLoading(true);
    // Generate a random 8-character ID without needing any 'uuid' package
    const roomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Antigravity Watch Party
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto">
          Watch videos together in real-time. Perfectly synced, zero gravity.
        </p>

        <div className="pt-8">
          <button
            onClick={createRoom}
            disabled={loading}
            className="px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:bg-zinc-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create a Party Room 🚀"}
          </button>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-500">
          <div className="p-4 border border-zinc-800 rounded-2xl">
            <h3 className="text-white mb-2">Real-time Sync</h3>
            <p>AWS-powered backend ensures everyone stays on the same frame.</p>
          </div>
          <div className="p-4 border border-zinc-800 rounded-2xl">
            <h3 className="text-white mb-2">Secure</h3>
            <p>Full SSL encryption via Cloudflare and Nginx.</p>
          </div>
          <div className="p-4 border border-zinc-800 rounded-2xl">
            <h3 className="text-white mb-2">Next.js 16</h3>
            <p>Blazing fast performance hosted on Vercel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}