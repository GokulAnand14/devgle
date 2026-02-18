import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devgle — Omegle for Developers",
  description:
    "Connect anonymously with developers worldwide. Share your screen, get feedback, and build together. Peer-to-peer, no accounts needed.",
  keywords: [
    "developer chat",
    "anonymous video chat",
    "omegle for developers",
    "peer to peer",
    "screen sharing",
    "webrtc",
  ],
  openGraph: {
    title: "Devgle — Omegle for Developers",
    description:
      "Connect anonymously with developers worldwide. Share your screen, get feedback, and build together.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grid-bg" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
