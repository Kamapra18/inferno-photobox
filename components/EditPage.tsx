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

// --- WRAPPER UNTUK MENGATASI ERROR BUILD VERCEL ---
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

// --- KOMPONEN UTAMA ---
function EditorContent() {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const frameId = searchParams.get("frame") || "1";

  const activeFrame = useMemo(() => {
    return FRAMES.find((f) => f.id.toString() === frameId) || FRAMES[0];
  }, [frameId]);

  const photos = usePhotoStore((state) => state.capturedPhotos);

  // --- LOGIC SCALING ---
  const DESIGN_WIDTH = 1200;
  const CANVAS_WIDTH = 340;
  const scaleFactor = CANVAS_WIDTH / DESIGN_WIDTH;

  const handleGenerateQR = async () => {
    if (!stripRef.current) return;

    try {
      const dataUrl = await toPng(stripRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Simpan sebagai Blob URL
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      setDownloadUrl(blobUrl);
      setShowQR(true);
    } catch (err) {
      console.error("Gagal generate QR:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
      {/* CSS KHUSUS PRINT */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          main {
            background: transparent !important;
            padding: 0 !important;
          }
          .print-container {
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        }
      `}</style>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print font-display text-3xl text-gold mb-8 uppercase tracking-[0.3em]">
        PREVIEW & EDIT
      </motion.h2>

      {/* CANVAS CONTAINER */}
      <div className="print-container relative bg-black/40 p-6 rounded-[40px] mb-10 backdrop-blur-md border border-white/5 shadow-premium">
        <div
          ref={stripRef}
          key={activeFrame.id}
          className="relative w-85 h-127.5 overflow-hidden bg-[#120000]">
          {/* LAYER 1: FOTO */}
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

          {/* LAYER 2: FRAME */}
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

      {/* UI CONTROLS - Sembunyikan saat print */}
      <div className="no-print w-full flex flex-col items-center">
        {/* FILTER SELECTOR */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFilter(f)}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                  selectedFilter.name === f.name
                    ? "bg-gold/20 ring-1 ring-gold"
                    : "bg-white/5"
                }`}>
                <div
                  className={`relative w-12 h-12 rounded-lg overflow-hidden ${f.class} shadow-lg`}>
                  <Image
                    src={photos[0]}
                    alt="p"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-[10px] font-display tracking-wider text-white/70">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS & QR */}
        <div className="flex flex-col items-center gap-8">
          {showQR && downloadUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-3xl border border-gold/20 backdrop-blur-xl shadow-2xl">
              <p className="text-gold tracking-[0.2em] text-[10px] font-bold uppercase">
                Scan to Download
              </p>
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={downloadUrl} size={150} level="H" />
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="text-white/40 text-[9px] hover:text-white transition-colors">
                CLOSE QR
              </button>
            </motion.div>
          )}

          <div className="flex gap-4 items-center">
            {!showQR && (
              <InfernoButton
                text="GET QR CODE"
                onClick={handleGenerateQR}
                variant="gold"
                className="px-10 py-4 shadow-premium"
              />
            )}

            <InfernoButton
              text="PRINT"
              onClick={handlePrint}
              variant="gold"
              className={`px-10 py-4 shadow-premium ${!showQR ? "opacity-70" : ""}`}
            />
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-white/40 hover:text-gold uppercase text-xs font-display tracking-[0.2em] transition-colors">
            BACK TO HOME
          </button>
        </div>
      </div>
    </main>
  );
}
