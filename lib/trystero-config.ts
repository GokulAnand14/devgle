/**
 * Shared Trystero configuration for all rooms (lobby + call).
 *
 * Includes TURN servers so peers behind symmetric NATs
 * (mobile carriers, corporate firewalls, etc.) can still connect
 * by relaying through a TURN proxy when direct P2P fails.
 *
 * Free TURN servers provided by Open Relay (metered.ca).
 * These have generous free tiers and run on ports 80/443
 * to bypass most firewalls.
 */

export const APP_ID = "devgle-omegle-for-devs";

export const TRYSTERO_CONFIG = {
    appId: APP_ID,

    // Connect to 3 Nostr relays simultaneously for reliability
    relayRedundancy: 3,

    // TURN servers — relay traffic when direct P2P is blocked
    turnConfig: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: "e7589b3e44738e20337b1db1",
            credential: "fCLYv/JkKFPWep+r",
        },
        {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "e7589b3e44738e20337b1db1",
            credential: "fCLYv/JkKFPWep+r",
        },
        {
            urls: "turn:global.relay.metered.ca:443",
            username: "e7589b3e44738e20337b1db1",
            credential: "fCLYv/JkKFPWep+r",
        },
        {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "e7589b3e44738e20337b1db1",
            credential: "fCLYv/JkKFPWep+r",
        },
    ],
} as const;
