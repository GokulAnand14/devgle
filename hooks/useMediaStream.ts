"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface MediaStreamState {
    stream: MediaStream | null;
    screenStream: MediaStream | null;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    error: string | null;
}

export function useMediaStream() {
    const [state, setState] = useState<MediaStreamState>({
        stream: null,
        screenStream: null,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        error: null,
    });

    const streamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const startMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;
            setState((prev) => ({ ...prev, stream, error: null }));
            return stream;
        } catch (err) {
            const error =
                err instanceof Error ? err.message : "Failed to access media devices";
            setState((prev) => ({ ...prev, error }));
            return null;
        }
    }, []);

    const stopMedia = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }
        setState({
            stream: null,
            screenStream: null,
            isAudioEnabled: true,
            isVideoEnabled: true,
            isScreenSharing: false,
            error: null,
        });
    }, []);

    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setState((prev) => ({
                ...prev,
                isAudioEnabled: !prev.isAudioEnabled,
            }));
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setState((prev) => ({
                ...prev,
                isVideoEnabled: !prev.isVideoEnabled,
            }));
        }
    }, []);

    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });

            screenStreamRef.current = screenStream;

            // Handle user stopping screen share via browser UI
            screenStream.getVideoTracks()[0].onended = () => {
                screenStreamRef.current = null;
                setState((prev) => ({
                    ...prev,
                    screenStream: null,
                    isScreenSharing: false,
                }));
            };

            setState((prev) => ({
                ...prev,
                screenStream,
                isScreenSharing: true,
            }));
            return screenStream;
        } catch (err) {
            console.error("Screen share failed:", err);
            return null;
        }
    }, []);

    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }
        setState((prev) => ({
            ...prev,
            screenStream: null,
            isScreenSharing: false,
        }));
    }, []);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return {
        ...state,
        startMedia,
        stopMedia,
        toggleAudio,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
    };
}
