"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import InfernoButton from "@/components/ui/Button";
import { usePhotoStore } from "@/store/usePhotoStore";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMES } from "@/components/data/Frame";

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

  const handleDownload = async () => {
    console.log("Mendownload Frame ID:", activeFrame.id);
    if (stripRef.current === null) return;
    try {
      const dataUrl = await toPng(stripRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `inferno-photobox-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal download:", err);
    }
  };

  if (photos.length === 0) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center text-white p-6"
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

      <div className="relative bg-black/40 p-6 rounded-[40px] backdrop-blur-md border border-white/5 mb-10 shadow-premium">
        {/* CANVAS CONTAINER - Pakai class w-85 h-127.5 biar warning ilang */}
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

      {/* FILTER SELECTOR */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFilter(f)}
              className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                selectedFilter.name === f.name
                  ? "bg-gold/20 ring-gold ring-1"
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

      {/* ACTION BUTTONS */}
      <div className="flex gap-6 items-center">
        <InfernoButton
          text="DOWNLOAD"
          onClick={handleDownload}
          variant="gold"
          className="px-10 py-4 shadow-premium"
        />
        <button
          onClick={() => router.push("/")}
          className="text-white/40 hover:text-gold uppercase text-xs font-display tracking-[0.2em] transition-colors">
          BACK
        </button>
      </div>
    </main>
  );
}
