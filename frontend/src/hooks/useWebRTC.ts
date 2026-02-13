
import { useEffect, useRef, useCallback } from 'react';
import { useMediaStore } from '@/store/useMediaStore';

export const useWebRTC = (roomId: string, userId: string) => {
    const {
        setLocalStream,
        setScreenStream,
        addRemoteStream,
        removeRemoteStream
    } = useMediaStore();

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // Initialize User Media (Camera + Mic) - STRICT AUDIO CONSTRAINTS
    const initLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            return null;
        }
    }, [setLocalStream]);

    // Initialize Screen Share (Host Only)
    const initScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true, // Capture system audio
            });
            setScreenStream(stream);
            screenStreamRef.current = stream;

            // Handle stream stop (user clicks "Stop Sharing" in browser UI)
            stream.getVideoTracks()[0].onended = () => {
                setScreenStream(null);
                screenStreamRef.current = null;
                // Logic to notify peers to remove screen track would go here
            };

            return stream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            return null;
        }
    }, [setScreenStream]);

    // Create Peer Connection Boilerplate
    const createPeerConnection = useCallback((peerId: string, isInitiator: boolean) => {
        // STUN servers are essential for deep NAT traversal
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        peerConnections.current.set(peerId, pc);

        // Add Local Tracks to Peer Connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, screenStreamRef.current!);
            });
        }


        // Handle Remote Tracks
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            if (remoteStream) {
                addRemoteStream(peerId, remoteStream);
            }
        };

        // ICE Candidate handling (Signaling placeholder)
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate for', peerId, event.candidate);
                // signalServer.send({ type: 'ice-candidate', target: peerId, candidate: event.candidate });
            }
        };

        // Connection State Monitoring
        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                removeRemoteStream(peerId);
                peerConnections.current.delete(peerId);
            }
        };

        return pc;
    }, [addRemoteStream, removeRemoteStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, []);

    return {
        initLocalMedia,
        initScreenShare,
        createPeerConnection,
        peerConnections
    };
};
