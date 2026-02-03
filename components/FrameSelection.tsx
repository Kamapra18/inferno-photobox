"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import InfernoButton from "@/components/ui/Button";
import { FRAMES } from "@/components/data/Frame";

export default function FrameSelection() {
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0].id);

  return (
    <main
      className="min-h-screen py-20 px-6 relative overflow-hidden"
      style={{ background: "var(--background-down)" }}>
      {/* Grain Overlay */}
      {/* <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('/grain-texture.png')]" /> */}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl text-gold uppercase">
            Pilih Bingkai
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/60 mt-4 uppercase tracking-widest">
            Tentukan gaya untuk memori timeless Anda
          </motion.p>
        </header>

        {/* GRID KATALOG */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {FRAMES.map((frame) => (
            <motion.div
              key={frame.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFrame(frame.id)}
              className={`
                cursor-pointer relative group rounded-sm p-4 transition-all duration-300
                ${
                  selectedFrame === frame.id
                    ? "ring-2 ring-gold shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-white/5"
                    : "ring-1 ring-white/10 bg-white/2 hover:bg-white/5"
                }
              `}>
              {/* PREVIEW FRAME */}
              <div className="relative aspect-2/3 w-full mb-4 shadow-2xl overflow-hidden bg-neutral-900">
                <Image
                  src={frame.src}
                  alt={frame.name}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    selectedFrame === frame.id
                      ? "opacity-100 scale-100"
                      : "opacity-70 group-hover:opacity-100 group-hover:scale-[1.02]"
                  }`}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />

                {/* GOLD SOFT GLOW OVERLAY WHEN ACTIVE */}
                {selectedFrame === frame.id && (
                  <motion.div
                    layoutId="activeOverlay"
                    className="absolute inset-0 bg-gold/10 mix-blend-soft-light z-10"
                  />
                )}
              </div>

              {/* TEXT */}
              <div className="text-center">
                <span className="font-display text-xl text-white block uppercase tracking-wider">
                  {frame.name}
                </span>
                <span className="font-sans text-[10px] text-gold/80 uppercase tracking-[0.2em]">
                  {frame.category}
                </span>
              </div>

              {/* SELECTED BADGE */}
              {selectedFrame === frame.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 text-[9px] bg-gold text-[#2b0202] px-2 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                  Selected
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ACTION */}
        <div className="flex justify-center">
          <InfernoButton
            text="Lanjut ke Kamera"
            href={`/camera?frame=${selectedFrame}`}
            variant="gold"
          />
        </div>
      </div>
    </main>
  );
}
