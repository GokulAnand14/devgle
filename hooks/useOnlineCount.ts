/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";

const APP_ID = "devgle-omegle-for-devs";
const PRESENCE_ROOM = "devgle-presence-v1";

/**
 * Hook that joins a shared Trystero/Nostr presence room and tracks
 * how many peers are currently online (including self).
 */
export function useOnlineCount() {
    const [onlineCount, setOnlineCount] = useState(1); // self
    const roomRef = useRef<any>(null);
    const peersRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        let mounted = true;

        const setup = async () => {
            try {
                const { joinRoom } = await import("trystero/nostr");

                if (!mounted) return;

                const room = joinRoom({ appId: APP_ID }, PRESENCE_ROOM);
                roomRef.current = room;

                room.onPeerJoin((peerId: string) => {
                    if (!mounted) return;
                    peersRef.current.add(peerId);
                    setOnlineCount(peersRef.current.size + 1); // +1 for self
                });

                room.onPeerLeave((peerId: string) => {
                    if (!mounted) return;
                    peersRef.current.delete(peerId);
                    setOnlineCount(peersRef.current.size + 1);
                });
            } catch (err) {
                console.error("[Devgle] Presence room error:", err);
            }
        };

        setup();

        return () => {
            mounted = false;
            if (roomRef.current) {
                roomRef.current.leave();
                roomRef.current = null;
            }
            peersRef.current.clear();
        };
    }, []);

    return { onlineCount };
}
