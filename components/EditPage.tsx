"use client";

import React, { useState, useRef, useMemo } from "react";
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

  // --- SCALING ---
  const DESIGN_WIDTH = 1200;
  const CANVAS_WIDTH = 340;
  const scaleFactor = CANVAS_WIDTH / DESIGN_WIDTH;

  // --- GENERATE QR ---
  const handleGenerateQR = async () => {
    if (!stripRef.current) return;

    try {
      const dataUrl = await toPng(stripRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // 🔥 CONVERT base64 → Blob → Blob URL
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      setDownloadUrl(blobUrl);
      setShowQR(true);
    } catch (err) {
      console.error("Gagal generate QR:", err);
    }
  };

  const handlePrint = () => window.print();

  if (photos.length === 0) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6"
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
        className="font-display text-3xl text-gold mb-8 uppercase tracking-[0.3em]">
        PREVIEW & EDIT
      </motion.h2>

      {/* PREVIEW */}
      <div className="relative bg-black/40 p-6 rounded-[40px] mb-10 backdrop-blur-md border border-white/5 shadow-premium">
        <div
          ref={stripRef}
          key={activeFrame.id}
          className="relative w-85 h-127.5 overflow-hidden bg-[#120000]">
          {/* FOTO */}
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

          {/* FRAME */}
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

      {/* FILTER */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFilter(f)}
              className={`p-2 rounded-xl transition-all ${
                selectedFilter.name === f.name
                  ? "bg-gold/20 ring-1 ring-gold"
                  : "bg-white/5"
              }`}>
              <div
                className={`relative w-12 h-12 rounded-lg overflow-hidden ${f.class}`}>
                <Image
                  src={photos[0]}
                  alt="preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-[10px] text-white/70">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTION */}
      <div className="flex flex-col items-center gap-6">
        {!showQR && (
          <InfernoButton
            text="GET QR CODE"
            onClick={handleGenerateQR}
            variant="gold"
            className="px-10 py-4 shadow-premium"
          />
        )}

        {showQR && downloadUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <p className="text-gold tracking-widest text-sm">
              SCAN TO DOWNLOAD
            </p>

            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={downloadUrl} size={180} level="M" />
            </div>

            <p className="text-white/60 text-xs text-center">
              Scan QR ini untuk menyimpan foto
            </p>
          </motion.div>
        )}

        <InfernoButton
          text="PRINT"
          onClick={handlePrint}
          variant="gold"
          className="px-8 py-4 opacity-80"
        />

        <button
          onClick={() => router.push("/")}
          className="text-white/40 hover:text-gold uppercase text-xs tracking-widest">
          BACK
        </button>
      </div>
    </main>
  );
}
