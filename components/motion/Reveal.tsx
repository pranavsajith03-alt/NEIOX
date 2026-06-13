'use client';
// components/motion/Reveal.tsx
// Shared scroll-reveal primitive — fades/slides content into place the first
// time it enters the viewport, using a relaxed spring so motion feels like a
// gentle glide rather than a snap. Stagger sibling Reveals by passing
// `delay={i * 0.1}` for the classic 0.1s-increment cascade.

import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds — e.g. index * 0.1 for sequential reveals. */
  delay?: number;
  /** Vertical travel distance (px) before settling into place. */
  y?: number;
  className?: string;
  style?: CSSProperties;
  /** How much of the element must enter the viewport before it triggers (0–1). */
  amount?: number;
}

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  style,
  amount = 0.2,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ type: 'spring', stiffness: 50, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}
