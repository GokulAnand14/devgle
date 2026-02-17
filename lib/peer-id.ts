"use client";

import { v4 as uuidv4 } from "uuid";

const PEER_ID_KEY = "devgle_peer_id";

export function getPeerId(): string {
    if (typeof window === "undefined") return "";

    let peerId = sessionStorage.getItem(PEER_ID_KEY);
    if (!peerId) {
        peerId = uuidv4();
        sessionStorage.setItem(PEER_ID_KEY, peerId);
    }
    return peerId;
}

export function getShortId(peerId: string): string {
    return peerId.slice(0, 6).toUpperCase();
}
