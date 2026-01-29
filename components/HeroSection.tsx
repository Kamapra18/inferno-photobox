"use client";

import { motion } from "framer-motion";
import InfernoButton from "@/components/ui/Button";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{ background: "var(--background-down)" }}>
      <div className="relative z-10 max-w-8xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-18 items-center">
        {/* LEFT CONTENT */}
        <div className="text-center lg:text-left ">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl leading-[0.9] text-white uppercase tracking-tight">
            Momen <span className="text-accent">tidak perlu</span>
            <br />
            dijelaskan.
            <br />
            Cukup <span className="text-gold">dirasakan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-8 text-md md:text-lg text-white/70 max-w-xl font-sans leading-relaxed mx-auto lg:mx-0">
            Inferno Photobox mengemas momen menjadi memori yang elegan,
            dramatis, dan eksklusif. Rasakan pengalaman photobox premium dengan
            sentuhan sinematik[cite: 3, 9].
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-5">
            <InfernoButton text="Ciptakan Momen" href="/frame" variant="gold" />
          </motion.div>
        </div>

        {/* RIGHT VISUAL (Photo Strip Mockups)  */}
        <div className="relative flex justify-center lg:justify-end items-center">
          {/* Deep Red Glow [cite: 4] */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] blur-[100px] opacity-40 pointer-events-none z-1"
            style={{
              background:
                "radial-gradient(circle, var(--accent-gold) 0%, transparent 80%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, rotate: -5 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex  md:gap-3 items-center justify-center w-full z-2">
            {/* Card 1 - Small Left */}
            <div className="relative w-24 md:w-44 aspect-2/3 rounded-sm shadow-premium -rotate-6 translate-y-8 border-4 border-white/5 overflow-hidden bg-card">
              <Image
                src="/frame/inferno-photobox.png"
                alt="Inferno 1"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 opacity-10 bg-[url('/frame/grain-texture.png')] pointer-events-none" />
            </div>

            {/* Card 2 - Main Center */}
            <div className="relative w-32 md:w-52 aspect-2/3 rounded-sm shadow-premium z-20 border-4 border-white/10 overflow-hidden bg-card scale-110 md:scale-100">
              <Image
                src="/frame/inferno-photobox.png"
                alt="Inferno 2"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 opacity-15 bg-[url('/frame/grain-texture.png')] pointer-events-none" />
            </div>

            {/* Card 3 - Small Right */}
            <div className="relative w-24 md:w-44 aspect-2/3 rounded-sm shadow-premium rotate-6 translate-y-12 border-4 border-white/5 overflow-hidden bg-card">
              <Image
                src="/frame/inferno-photobox.png"
                alt="Inferno 3"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 opacity-10 bg-[url('/frame/grain-texture.png')]pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
