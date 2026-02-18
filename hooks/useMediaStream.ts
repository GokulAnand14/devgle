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

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideoInfo, setSelectedVideoInfo] = useState<string | undefined>(undefined);
    const [selectedAudioInfo, setSelectedAudioInfo] = useState<string | undefined>(undefined);

    const streamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Enumerate devices
        const getDevices = async () => {
            try {
                // Check if we have permission first by requesting it if stream is null? 
                // devicechange event might not fire if no permission.
                // But usually we call getDevices after permission is granted in startMedia.
                // Let's call it here anyway.
                const devs = await navigator.mediaDevices.enumerateDevices();
                setDevices(devs);
            } catch (error) {
                console.error("Error enumerating devices:", error);
            }
        };

        getDevices();
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', getDevices);
        };
    }, []);

    const startMedia = useCallback(async (audioDeviceId?: string, videoDeviceId?: string) => {
        try {
            // Stop existing tracks first
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: videoDeviceId ? undefined : "user",
                },
                audio: {
                    deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // Update state and selected devices from the actual stream
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            if (videoTrack) setSelectedVideoInfo(videoTrack.getSettings().deviceId);
            if (audioTrack) setSelectedAudioInfo(audioTrack.getSettings().deviceId);

            // Refresh device list as permissions are now granted
            const devs = await navigator.mediaDevices.enumerateDevices();
            setDevices(devs);

            setState((prev) => ({
                ...prev,
                stream,
                error: null,
                isAudioEnabled: audioTrack?.enabled ?? true,
                isVideoEnabled: videoTrack?.enabled ?? true
            }));
            return stream;
        } catch (err) {
            const error =
                err instanceof Error ? err.message : "Failed to access media devices";
            setState((prev) => ({ ...prev, error }));
            return null;
        }
    }, []);

    const switchDevice = useCallback(async (kind: 'audio' | 'video', deviceId: string) => {
        if (kind === 'audio') {
            setSelectedAudioInfo(deviceId);
            return startMedia(deviceId, selectedVideoInfo);
        } else {
            setSelectedVideoInfo(deviceId);
            return startMedia(selectedAudioInfo, deviceId);
        }
    }, [startMedia, selectedAudioInfo, selectedVideoInfo]);

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
        devices,
        selectedAudioDeviceId: selectedAudioInfo,
        selectedVideoDeviceId: selectedVideoInfo,
        startMedia,
        switchDevice,
        stopMedia,
        toggleAudio,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
    };
}
