"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type RevealVariant = "fade-up" | "fade" | "slide-left" | "slide-right" | "scale";

const OFFSETS: Record<RevealVariant, { x?: number; y?: number; scale?: number }> = {
  "fade-up": { y: 24 },
  fade: {},
  "slide-left": { x: 32 },
  "slide-right": { x: -32 },
  scale: { scale: 0.96 },
};

function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const reduceMotion = useReducedMotion();
  const offset = OFFSETS[variant];

  const variants: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </MotionTag>
  );
}

export { Reveal };
