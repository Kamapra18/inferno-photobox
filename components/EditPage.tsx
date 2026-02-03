"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import InfernoButton from "@/components/ui/Button";
import { usePhotoStore } from "@/store/usePhotoStore";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMES } from "@/components/data/Frame";
import { QRCodeSVG } from "qrcode.react";

// KONFIGURASI CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dtvet2awa";
const CLOUDINARY_UPLOAD_PRESET = "Inferno-photobox";

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
        <div className="min-h-screen bg-black flex items-center justify-center text-gold">
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
  const [isUploading, setIsUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);

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

  // --- FUNGSI GENERATE & UPLOAD ---
  const handleGenerateQR = async () => {
    if (!stripRef.current) return;
    setIsUploading(true);

    try {
      // 1. Convert HTML ke PNG
      const dataUrl = await toPng(stripRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      // 2. Upload ke Cloudinary
      const formData = new FormData();
      formData.append("file", dataUrl);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      const data = await response.json();

      if (data.secure_url) {
        // 3. Tambahkan fl_attachment agar otomatis download saat discan
        const directDownloadUrl = data.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/",
        );
        setDownloadUrl(directDownloadUrl);
        setShowQR(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Gagal memproses gambar. Cek internet kamu!");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => window.print();

  if (photos.length === 0) return null;

  return (
    <main
      className="min-h-screen py-10 px-6 flex flex-col items-center"
      style={{ background: "var(--background-down)" }}>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      <motion.h2 className="no-print font-display text-3xl text-gold mb-8 uppercase tracking-[0.3em]">
        PREVIEW & EDIT
      </motion.h2>

      {/* PREVIEW CONTAINER */}
      <div className="print-area relative bg-black/40 p-6 rounded-[40px] mb-10 backdrop-blur-md border border-white/5 shadow-premium">
        <div
          ref={stripRef}
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
                    alt="shot"
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

      {/* UI CONTROLS */}
      <div className="no-print w-full flex flex-col items-center">
        {/* FILTER SELECTOR */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFilter(f)}
                className={`p-2 rounded-xl transition-all ${selectedFilter.name === f.name ? "bg-gold/20 ring-1 ring-gold" : "bg-white/5"}`}>
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
                <span className="text-[10px] text-white/70 block mt-1">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {!showQR ? (
              <motion.div key="btn-qr" exit={{ opacity: 0, y: 10 }}>
                <InfernoButton
                  text={isUploading ? "PROCESS..." : "GET QR CODE"}
                  onClick={handleGenerateQR}
                  variant="gold"
                  className="px-12 py-4 shadow-premium"
                  disabled={isUploading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="qr-box"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-2xl">
                <p className="text-black font-bold text-xs tracking-[0.2em] uppercase">
                  Scan to Download
                </p>
                <div className="bg-white p-1">
                  <QRCodeSVG value={downloadUrl || ""} size={180} level="H" />
                </div>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-zinc-400 text-[10px] hover:text-black underline uppercase">
                  Close QR
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 items-center mt-4">
            <InfernoButton
              text="PRINT PHOTO"
              onClick={handlePrint}
              variant="gold"
              className="px-8 py-3 opacity-80"
            />
            <button
              onClick={() => router.push("/")}
              className="text-white/40 hover:text-gold uppercase text-[10px] tracking-widest transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
