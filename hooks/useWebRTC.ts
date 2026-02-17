/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ConnectionState =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected";

interface WebRTCState {
    connectionState: ConnectionState;
    remoteStreams: MediaStream[];
}

const APP_ID = "devgle-omegle-for-devs";

export function useWebRTC(localPeerId: string) {
    const [state, setState] = useState<WebRTCState>({
        connectionState: "idle",
        remoteStreams: [],
    });

    const roomRef = useRef<any>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteIdRef = useRef<string | null>(null);

    const cleanup = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
        }
        localStreamRef.current = null;
        remoteIdRef.current = null;
        setState({
            connectionState: "idle",
            remoteStreams: [],
        });
    }, []);

    const connect = useCallback(
        async (
            roomId: string,
            _isInitiator: boolean,
            localStream: MediaStream | null
        ) => {
            cleanup();
            setState((prev) => ({ ...prev, connectionState: "connecting" }));
            localStreamRef.current = localStream;

            console.log(`[Devgle WebRTC] Joining room: ${roomId}, peerId: ${localPeerId}`);

            try {
                const { joinRoom } = await import("trystero/nostr");

                const room = joinRoom({ appId: APP_ID }, roomId);
                roomRef.current = room;

                // Send our media stream to the room
                if (localStream) {
                    room.addStream(localStream);
                    console.log("[Devgle WebRTC] Added local stream to room");
                }

                // Handle peer joining
                room.onPeerJoin((peerId: string) => {
                    console.log("[Devgle WebRTC] Γ£à Peer connected:", peerId);
                    remoteIdRef.current = peerId;
                    setState((prev) => ({ ...prev, connectionState: "connected" }));

                    // Re-send stream to the new peer
                    if (localStreamRef.current) {
                        room.addStream(localStreamRef.current, peerId);
                    }
                });

                // Handle peer leaving
                room.onPeerLeave((peerId: string) => {
                    console.log("[Devgle WebRTC] Peer disconnected:", peerId);
                    if (remoteIdRef.current === peerId) {
                        setState((prev) => ({
                            ...prev,
                            connectionState: "disconnected",
                            remoteStreams: [],
                        }));
                    }
                });

                // Handle incoming remote stream
                room.onPeerStream((stream: MediaStream, peerId: string) => {
                    console.log("[Devgle WebRTC] Received remote stream from:", peerId);
                    remoteIdRef.current = peerId;

                    setState((prev) => {
                        // Avoid duplicates if same stream is sent again
                        const exists = prev.remoteStreams.some(s => s.id === stream.id);
                        if (exists) return prev;

                        return {
                            ...prev,
                            remoteStreams: [...prev.remoteStreams, stream],
                            connectionState: "connected",
                        };
                    });
                });
            } catch (err) {
                console.error("[Devgle WebRTC] Error:", err);
                setState((prev) => ({ ...prev, connectionState: "disconnected" }));
            }
        },
        [localPeerId, cleanup]
    );

    const disconnect = useCallback(() => {
        console.log("[Devgle WebRTC] Disconnecting");
        cleanup();
        setState((prev) => ({ ...prev, connectionState: "disconnected" }));
    }, [cleanup]);

    const addLocalStream = useCallback((stream: MediaStream) => {
        if (roomRef.current) {
            roomRef.current.addStream(stream);
        }
    }, []);

    const removeLocalStream = useCallback((stream: MediaStream) => {
        if (roomRef.current) {
            roomRef.current.removeStream(stream);
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        ...state,
        connect,
        disconnect,
        addLocalStream,
        removeLocalStream,
    };
}

