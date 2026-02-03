"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface InfernoButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "red";
  className?: string;
}

export default function InfernoButton({
  text,
  href,
  onClick,
  variant = "gold",
  className = "",
}: InfernoButtonProps) {
  // Mapping warna sesuai theme
  const bgColor =
    variant === "gold" ? "var(--accent-gold)" : "var(--accent-primary)";
  const shadowColor = variant === "gold" ? "#8c6d1a" : "#7a0c0c";
  const textColor = variant === "gold" ? "#2b0202" : "#ffffff";

  // Efek kilau di bagian atas tombol (Inner Light)
  const innerGlow =
    variant === "gold"
      ? "inset 0 2px 4px rgba(255, 255, 255, 0.3)"
      : "inset 0 2px 4px rgba(255, 255, 255, 0.2)";

  const buttonContent = (
    <motion.button
      whileHover={{
        scale: 1.05,
        filter: "brightness(1.1)",
        boxShadow: `0 8px 0 0 ${shadowColor}, 0 20px 30px rgba(0, 0, 0, 0.6)`,
      }}
      whileTap={{
        scale: 0.98,
        translateY: 4,
        boxShadow: `0 2px 0 0 ${shadowColor}, 0 5px 10px rgba(0, 0, 0, 0.4)`,
      }}
      onClick={onClick}
      className={`
        relative px-10 py-3 rounded-full 
        font-display text-xl tracking-0.1em uppercase
        transition-all duration-200
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        // Tumpukan shadow: Inner Glow + 3D Side + Ambient Drop Shadow
        boxShadow: `${innerGlow}, 0 6px 0 0 ${shadowColor}, 0 15px 25px rgba(0, 0, 0, 0.5)`,
      }}>
      {text}
    </motion.button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
