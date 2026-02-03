"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  Suspense, // Tambahkan Suspense
} from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import InfernoButton from "@/components/ui/Button";
import { usePhotoStore } from "@/store/usePhotoStore";
import { FRAMES } from "@/components/data/Frame";

// --- 1. Bungkus Komponen Utama ---
export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-gold font-display tracking-widest">
          INITIALIZING CAMERA...
        </div>
      }>
      <CameraContent />
    </Suspense>
  );
}

// --- 2. Pindahkan Semua Logic ke Sini ---
function CameraContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const frameId = searchParams.get("frame") || "1";
  const currentFrame = useMemo(() => {
    return FRAMES.find((f) => f.id === Number(frameId)) || FRAMES[0];
  }, [frameId]);

  const setCapturedPhotos = usePhotoStore((state) => state.setCapturedPhotos);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const [timerSetting, setTimerSetting] = useState(3);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const isFrontCamera = facingMode === "user";

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setFacingMode("environment");
    }
  }, []);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleFinalize = () => {
    if (photos.length === currentFrame.maxPhotos) {
      setCapturedPhotos(photos);
      router.push(`/edit?frame=${frameId}`);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setTempPhoto(imageSrc);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 150);
      }
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (tempPhoto && photos.length < currentFrame.maxPhotos) {
      setPhotos((prev) => [...prev, tempPhoto]);
      setTempPhoto(null);
    }
  };

  const startSequence = () => {
    setIsCapturing(true);
    let timer = timerSetting;
    setCountdown(timer);

    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        capture();
        setCountdown(null);
        setIsCapturing(false);
      }
    }, 1000);
  };

  return (
    <main
      className="min-h-screen relative flex flex-col items-center py-10 px-6"
      style={{ background: "var(--background-down)" }}>
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* TOP MENU */}
      <div className="relative z-10 flex flex-wrap gap-4 mb-8 items-center bg-white/5 p-3 px-6 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={() => router.push("/frame")}
          className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-gold hover:text-white transition">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="h-4 w-px bg-white/10" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] uppercase font-bold tracking-widest text-white/70 hover:text-white transition">
          Upload
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
          />
        </button>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase">Timer:</span>
          <select
            value={timerSetting}
            onChange={(e) => setTimerSetting(Number(e.target.value))}
            className="bg-transparent text-white text-[10px] font-bold outline-none cursor-pointer">
            {[3, 5, 10].map((t) => (
              <option key={t} value={t} className="bg-[#2b0202]">
                {t}S
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <button
          onClick={() => setIsBlur(!isBlur)}
          className={`text-[10px] uppercase font-bold transition ${isBlur ? "text-gold" : "text-white/70"}`}>
          Focus: {isBlur ? "Soft" : "Sharp"}
        </button>

        <div className="h-4 w-px bg-white/10" />

        <button
          onClick={switchCamera}
          className="text-[10px] uppercase font-bold tracking-widest text-white/70 hover:text-gold transition">
          Flip Cam
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* VIEWPORT */}
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl shadow-premium border-4 border-white/10 bg-black">
          <Webcam
            audio={false}
            key={facingMode}
            ref={webcamRef}
            screenshotFormat="image/png"
            className={`absolute inset-0 w-full h-full object-cover ${isFrontCamera ? "mirror" : ""}`}
            videoConstraints={{
              facingMode,
              aspectRatio: 3 / 4,
            }}
          />

          <AnimatePresence>
            {isBlur && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-10 backdrop-blur-md"
                style={{
                  maskImage:
                    "radial-gradient(circle, transparent 20%, black 80%)",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 20%, black 80%)",
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <span className="font-display text-[150px] text-white drop-shadow-premium">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 h-16">
          {!isCapturing && photos.length < currentFrame.maxPhotos && (
            <InfernoButton
              text="Capture Moment"
              onClick={startSequence}
              variant="gold"
            />
          )}
        </div>

        {/* PHOTO TRAY */}
        <div className="mt-6 w-full bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-display text-gold text-sm tracking-widest uppercase">
              {currentFrame.name} Session
            </span>
            <span className="font-mono text-[10px] text-white/30 uppercase">
              {photos.length}/{currentFrame.maxPhotos} Photos
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {photos.map((src, i) => (
              <div
                key={i}
                className="relative aspect-3/4 rounded-lg overflow-hidden ring-1 ring-white/20 group">
                <Image src={src} alt="captured" fill className="object-cover" />
                <button
                  onClick={() =>
                    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[8px] opacity-0 group-hover:opacity-100 transition z-10">
                  ✕
                </button>
              </div>
            ))}
            {[...Array(currentFrame.maxPhotos - photos.length)].map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5">
                <span className="text-white/10 text-xs">+</span>
              </div>
            ))}
          </div>

          {photos.length === currentFrame.maxPhotos && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6">
              <InfernoButton
                text="✨ Edit & Finalize"
                onClick={handleFinalize}
                variant="gold"
                className="w-full"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* POP-UP PREVIEW */}
      <AnimatePresence>
        {tempPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-premium">
              <h3 className="text-black font-display text-2xl text-center mb-4 uppercase">
                Nice Shot!
              </h3>
              <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-6 shadow-2xl ring-4 ring-black/5">
                <Image
                  src={tempPhoto}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setTempPhoto(null)}
                  className="flex-1 py-4 bg-zinc-200 text-zinc-800 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                  Ulangi
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 py-4 bg-red-700 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg">
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
