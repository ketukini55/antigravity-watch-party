import { create } from 'zustand';

interface MediaState {
    localStream: MediaStream | null;
    screenStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>; // peerId -> Stream
    isMicOn: boolean;
    isCameraOn: boolean;
    isScreenSharing: boolean;

    setLocalStream: (stream: MediaStream) => void;
    setScreenStream: (stream: MediaStream | null) => void;
    addRemoteStream: (peerId: string, stream: MediaStream) => void;
    removeRemoteStream: (peerId: string) => void;
    toggleMic: () => void;
    toggleCamera: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
    localStream: null,
    screenStream: null,
    remoteStreams: new Map(),
    isMicOn: true,
    isCameraOn: true,
    isScreenSharing: false,

    setLocalStream: (stream) => set({ localStream: stream }),
    setScreenStream: (stream) => set({ screenStream: stream, isScreenSharing: !!stream }),

    addRemoteStream: (peerId, stream) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.set(peerId, stream);
        return { remoteStreams: newStreams };
    }),

    removeRemoteStream: (peerId) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.delete(peerId);
        return { remoteStreams: newStreams };
    }),

    toggleMic: () => set((state) => {
        if (state.localStream) {
            state.localStream.getAudioTracks().forEach(track => {
                track.enabled = !state.isMicOn;
            });
        }
        return { isMicOn: !state.isMicOn };
    }),

    toggleCamera: () => set((state) => {
        if (state.localStream) {
            state.localStream.getVideoTracks().forEach(track => {
                track.enabled = !state.isCameraOn;
            });
        }
        return { isCameraOn: !state.isCameraOn };
    })
}));
