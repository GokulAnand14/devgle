/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getPeerId } from "@/lib/peer-id";
import { TRYSTERO_CONFIG } from "@/lib/trystero-config";

export type MatchState = "idle" | "searching" | "matched" | "error";

interface MatchmakingResult {
    matchState: MatchState;
    roomId: string | null;
    remotePeerId: string | null;
    isInitiator: boolean;
    startSearching: () => void;
    stopSearching: () => void;
    skip: () => void;
}

// Shared lobby room name — all searching users join this room
const LOBBY_ROOM = "devgle-lobby-v3";

export function useMatchmaking(): MatchmakingResult {
    const [matchState, setMatchState] = useState<MatchState>("idle");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
    const [isInitiator, setIsInitiator] = useState(false);

    const roomRef = useRef<any>(null);
    const matchedRef = useRef(false);

    const stopSearching = useCallback(() => {
        console.log("[Devgle] Stopping search");
        matchedRef.current = false;
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
        }
        setMatchState("idle");
        setRoomId(null);
        setRemotePeerId(null);
    }, []);

    const startSearching = useCallback(async () => {
        const peerId = getPeerId();
        if (!peerId) return;

        console.log("[Devgle] Starting search as peer:", peerId);
        matchedRef.current = false;
        setMatchState("searching");
        setRoomId(null);
        setRemotePeerId(null);

        // Clean up any existing lobby connection
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
        }

        try {
            // Dynamically import trystero (client-side only)
            const { joinRoom, selfId } = await import("trystero/nostr");

            const room = joinRoom(TRYSTERO_CONFIG, LOBBY_ROOM);
            roomRef.current = room;

            console.log("[Devgle] Joined lobby, my trystero id:", selfId);

            // Create an action to exchange peer IDs and negotiate matches
            const [sendMatch, getMatch] = room.makeAction("match");

            // When a new peer joins the lobby
            room.onPeerJoin((trysteroId: string) => {
                if (matchedRef.current) return;

                console.log("[Devgle] Peer joined lobby:", trysteroId);

                // Deterministic: lower selfId initiates
                if (selfId < trysteroId) {
                    console.log("[Devgle] I'm initiator, proposing match to:", trysteroId);
                    const newRoomId = `devgle_${selfId.slice(0, 6)}_${trysteroId.slice(0, 6)}_${Date.now()}`;

                    sendMatch(
                        { type: "propose", roomId: newRoomId, from: selfId },
                        trysteroId
                    );
                } else {
                    console.log("[Devgle] Waiting for", trysteroId, "to propose");
                }
            });

            // Handle match messages
            getMatch((data: any, trysteroId: string) => {
                if (matchedRef.current) return;

                console.log("[Devgle] Got match message:", data, "from:", trysteroId);

                if (data.type === "propose") {
                    // Accept the proposal
                    console.log("[Devgle] Accepting match proposal, room:", data.roomId);
                    matchedRef.current = true;

                    sendMatch(
                        { type: "accept", roomId: data.roomId, from: selfId },
                        trysteroId
                    );

                    // Leave lobby and set matched state
                    setTimeout(() => {
                        if (roomRef.current) {
                            roomRef.current.leave();
                            roomRef.current = null;
                        }
                    }, 500);

                    setIsInitiator(false);
                    setRoomId(data.roomId);
                    setRemotePeerId(trysteroId);
                    setMatchState("matched");
                } else if (data.type === "accept") {
                    // Our proposal was accepted
                    console.log("[Devgle] Match accepted! room:", data.roomId);
                    matchedRef.current = true;

                    // Leave lobby
                    setTimeout(() => {
                        if (roomRef.current) {
                            roomRef.current.leave();
                            roomRef.current = null;
                        }
                    }, 500);

                    setIsInitiator(true);
                    setRoomId(data.roomId);
                    setRemotePeerId(trysteroId);
                    setMatchState("matched");
                }
            });

            room.onPeerLeave((trysteroId: string) => {
                console.log("[Devgle] Peer left lobby:", trysteroId);
            });
        } catch (err) {
            console.error("[Devgle] Matchmaking error:", err);
            setMatchState("error");
        }
    }, []);

    const skip = useCallback(() => {
        console.log("[Devgle] Skipping...");
        matchedRef.current = false;
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
        }
        setRoomId(null);
        setRemotePeerId(null);
        setMatchState("idle");

        setTimeout(() => {
            startSearching();
        }, 1000);
    }, [startSearching]);

    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.leave();
                roomRef.current = null;
            }
        };
    }, []);

    return {
        matchState,
        roomId,
        remotePeerId,
        isInitiator,
        startSearching,
        stopSearching,
        skip,
    };
}
