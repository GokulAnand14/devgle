/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatMessage {
    id: string;
    text: string;
    from: string;
    timestamp: number;
    isMine: boolean;
}

const APP_ID = "devgle-omegle-for-devs";

export function useGunChat(roomId: string | null, localPeerId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const roomRef = useRef<any>(null);
    const sendMsgRef = useRef<any>(null);

    const sendMessage = useCallback(
        (text: string) => {
            if (!text.trim() || !sendMsgRef.current) return;

            const msgId = `${localPeerId}_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2)}`;

            const message: ChatMessage = {
                id: msgId,
                text: text.trim(),
                from: localPeerId,
                timestamp: Date.now(),
                isMine: true,
            };

            // Send to peers
            sendMsgRef.current({
                id: msgId,
                text: text.trim(),
                from: localPeerId,
                timestamp: Date.now(),
            });

            // Add to local state
            setMessages((prev) => [...prev, message]);
        },
        [localPeerId]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    useEffect(() => {
        if (!roomId) return;

        let mounted = true;

        const setup = async () => {
            const { joinRoom } = await import("trystero/nostr");

            if (!mounted) return;

            console.log(`[Chat] Joining room: ${roomId}-chat as ${localPeerId}`);
            const room = joinRoom({ appId: APP_ID }, `${roomId}-chat`);
            roomRef.current = room;

            const [sendMsg, getMsg] = room.makeAction("chat");
            sendMsgRef.current = sendMsg;

            room.onPeerJoin((peerId) => {
                console.log(`[Chat] Peer joined: ${peerId}`);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `sys_${Date.now()}`,
                        text: `System: Connected to peer ${peerId.slice(0, 6)}`,
                        from: "system",
                        timestamp: Date.now(),
                        isMine: false,
                    }
                ]);
            });
            room.onPeerLeave((peerId) => console.log(`[Chat] Peer left: ${peerId}`));

            getMsg((data: any) => {
                console.log("[Chat] Received message:", data);
                if (!data || !data.id || !data.text || !mounted) return;

                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some((m) => m.id === data.id)) return prev;
                    return [
                        ...prev,
                        {
                            id: data.id,
                            text: data.text,
                            from: data.from,
                            timestamp: Number(data.timestamp) || Date.now(),
                            isMine: data.from === localPeerId,
                        },
                    ];
                });
            });
        };

        setup();

        return () => {
            mounted = false;
            if (roomRef.current) {
                roomRef.current.leave();
                roomRef.current = null;
            }
            sendMsgRef.current = null;
        };
    }, [roomId, localPeerId]);

    return {
        messages,
        sendMessage,
        clearMessages,
    };
}
