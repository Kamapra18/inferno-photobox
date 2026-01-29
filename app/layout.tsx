import type { Metadata } from "next";
import { Inter, Bebas_Neue, Space_Mono } from "next/font/google"; //
import "./globals.css";

// Font untuk Body: Inter (Clean & Professional)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Font untuk Heading: Bebas Neue (Bold & Impact)
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

// Font opsional untuk Timer/Countdown: Space Mono
const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inferno Photobox — Capture Your Moment", //
  description: "Timeless moments, bold memories. Your story, framed in fire.", //
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${spaceMono.variable} antialiased`}>
        {/* Grain Overlay global agar terasa Analog Feel [cite: 1, 4] */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('/grain.png')]" />

        {children}
      </body>
    </html>
  );
}
