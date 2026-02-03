"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import InfernoButton from "@/components/ui/Button";
import { usePhotoStore } from "@/store/usePhotoStore";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMES } from "@/components/data/Frame";
import { QRCodeSVG } from "qrcode.react";

const FILTERS = [
  { name: "Original", class: "" },
  { name: "Warm Film", class: "sepia-[0.3] saturate-[1.2] contrast-[1.1]" },
  {
    name: "Muted Color",
    class: "saturate-[0.5] contrast-[0.9] brightness-[1.1]",
  },
  {
    name: "Retro Matte",
    class: "contrast-[0.8] brightness-[1.1] grayscale-[0.2]",
  },
  { name: "Film Noir", class: "grayscale brightness-[0.8] contrast-[1.2]" },
  { name: "Soft Grain", class: "contrast-[1.1] brightness-[1.05]" },
];

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-gold font-display tracking-widest">
          LOADING ENGINE...
        </div>
      }>
      <EditorContent />
    </Suspense>
  );
}

function EditorContent() {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const frameId = searchParams.get("frame") || "1";

  const activeFrame = useMemo(() => {
    return FRAMES.find((f) => f.id.toString() === frameId) || FRAMES[0];
  }, [frameId]);

  const photos = usePhotoStore((state) => state.capturedPhotos);

  const DESIGN_WIDTH = 1200;
  const CANVAS_WIDTH = 340;
  const scaleFactor = CANVAS_WIDTH / DESIGN_WIDTH;

  // 🔥 GENERATE + UPLOAD + QR
  const handleGenerateQR = async () => {
    if (!stripRef.current) return;

    try {
      setLoadingQR(true);

      // 1. Generate image
      const dataUrl = await toPng(stripRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // 2. Upload ke Vercel Blob
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 3. Public URL → QR
      setDownloadUrl(data.url);
      setShowQR(true);
    } catch (err) {
      console.error("Gagal generate QR:", err);
      alert("Gagal membuat QR. Coba lagi.");
    } finally {
      setLoadingQR(false);
    }
  };

  const handlePrint = () => window.print();

  if (photos.length === 0) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6 text-white"
        style={{ background: "var(--background-down)" }}>
        <h2 className="font-display text-2xl mb-4 text-gold">
          FOTONYA KOSONG!
        </h2>
        <InfernoButton
          text="BALIK KE KAMERA"
          onClick={() => router.push("/camera")}
          variant="gold"
        />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen py-10 px-6 flex flex-col items-center"
      style={{ background: "var(--background-down)" }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print font-display text-3xl text-gold mb-8 uppercase tracking-[0.3em]">
        PREVIEW & EDIT
      </motion.h2>

      {/* CANVAS */}
      <div className="relative bg-black/40 p-6 rounded-[40px] mb-10 backdrop-blur-md border border-white/5 shadow-premium">
        <div
          ref={stripRef}
          key={activeFrame.id}
          className="relative w-85 h-127.5 overflow-hidden bg-[#120000]">
          <div className="absolute inset-0 z-10">
            {activeFrame.positions.map((pos, index) => {
              const parseVal = (val: string) => parseFloat(val) * scaleFactor;
              return (
                <div
                  key={index}
                  className={`absolute overflow-hidden ${selectedFilter.class}`}
                  style={{
                    top: `${parseVal(pos.top)}px`,
                    left: `${parseVal(pos.left)}px`,
                    width: `${parseVal(pos.width)}px`,
                    height: `${parseVal(pos.height)}px`,
                    transform: `rotate(${pos.rotate}deg)`,
                  }}>
                  <Image
                    src={photos[index] || photos[0]}
                    alt={`shot-${index}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              );
            })}
          </div>

          <div className="absolute inset-0 z-20 pointer-events-none">
            <Image
              src={activeFrame.src}
              alt="frame"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col items-center gap-8">
        {showQR && downloadUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-3xl border border-gold/20 backdrop-blur-xl shadow-2xl">
            <p className="text-gold tracking-[0.2em] text-[10px] uppercase">
              Scan to Download
            </p>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={downloadUrl} size={150} level="M" />
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="text-white/40 text-[9px] hover:text-white">
              CLOSE QR
            </button>
          </motion.div>
        )}

        {!showQR && (
          <InfernoButton
            text={loadingQR ? "GENERATING..." : "GET QR CODE"}
            onClick={handleGenerateQR}
            variant="gold"
            className="px-10 py-4 shadow-premium"
          />
        )}

        <InfernoButton
          text="PRINT"
          onClick={handlePrint}
          variant="gold"
          className="px-10 py-4 shadow-premium opacity-70"
        />

        <button
          onClick={() => router.push("/")}
          className="text-white/40 hover:text-gold uppercase text-xs tracking-[0.2em]">
          BACK TO HOME
        </button>
      </div>
    </main>
  );
}
