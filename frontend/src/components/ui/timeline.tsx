"use client";

import {
  useScroll,
  useTransform,
  motion,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildThresholds(n: number) {
  if (n <= 1) return [0.1];
  return Array.from({ length: n }, (_, i) => 0.08 + (i / (n - 1)) * 0.74);
}

interface NodePos {
  cx: number;
  cy: number;
  side: "left" | "right";
}

// Smooth S-curve through measured node positions, with a short tail below the last node
function buildPath(nodes: NodePos[], tailCy: number): string {
  if (nodes.length === 0) return "";
  let d = `M ${nodes[0].cx} ${nodes[0].cy}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const midY = (prev.cy + curr.cy) / 2;
    d += ` C ${prev.cx} ${midY}, ${curr.cx} ${midY}, ${curr.cx} ${curr.cy}`;
  }
  const last = nodes[nodes.length - 1];
  d += ` L ${last.cx} ${tailCy}`;
  return d;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CurvedTimeline({ data }: { data: TimelineEntry[] }) {
  const n = data.length;
  const thresholds = buildThresholds(n);

  const containerRef = useRef<HTMLDivElement>(null);
  // Refs point to the inner card wrapper (not the motion.div) so translateX from
  // Framer Motion doesn't corrupt the vertical measurement
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [svgDims, setSvgDims]         = useState({ w: 900, h: 1400 });
  const [nodePositions, setNodePositions] = useState<NodePos[]>([]);
  const [activeNodes, setActiveNodes] = useState<boolean[]>(new Array(n).fill(false));

  // ── Measurement ─────────────────────────────────────────────────────────────
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const w     = cRect.width;
    const h     = container.scrollHeight;

    const positions: NodePos[] = cardRefs.current.map((ref, i) => {
      const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
      // Node x sits just at the inner boundary of each 44%-wide card:
      //   right card starts at 56% → node at 55%
      //   left  card ends   at 44% → node at 45%
      const cx = side === "right" ? w * 0.55 : w * 0.45;
      if (!ref) return { cx, cy: 80 + i * 320, side };
      const rRect = ref.getBoundingClientRect();
      // translateX on the parent motion.div does NOT affect .top — safe to use
      const cy = rRect.top - cRect.top + rRect.height / 2;
      return { cx, cy, side };
    });

    setSvgDims({ w, h });
    setNodePositions(positions);
  }, []);

  useEffect(() => {
    // RAF: Framer Motion has applied initial transforms by this point
    const raf = requestAnimationFrame(() => measure());
    const ro  = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure, n]);

  // ── Scroll animation ────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 55%"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setActiveNodes((prev) => {
      const next = [...prev];
      thresholds.forEach((thresh, i) => {
        if (latest >= thresh)         next[i] = true;
        else if (latest < thresh - 0.04) next[i] = false;
      });
      return next;
    });
  });

  // ── SVG path ────────────────────────────────────────────────────────────────
  const tailCy  = nodePositions.length > 0
    ? nodePositions[nodePositions.length - 1].cy + 240
    : svgDims.h * 0.9;
  const svgPath = buildPath(nodePositions, tailCy);
  // viewBox matches the rendered pixel size exactly → 1 SVG unit = 1 CSS px
  const viewBox = `0 0 ${svgDims.w} ${svgDims.h}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl px-4 pb-24"
      style={{ marginInline: "auto" }}
    >
      {/* SVG absolute overlay — fills container at 1:1 pixel scale */}
      {svgPath && (
        <svg
          viewBox={viewBox}
          className="absolute left-0 top-0 w-full pointer-events-none"
          style={{ height: svgDims.h }}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradient in userSpaceOnUse so coordinates are real CSS pixels */}
            <linearGradient
              id="tlGrad"
              gradientUnits="userSpaceOnUse"
              x1={svgDims.w / 2} y1="0"
              x2={svgDims.w / 2} y2={tailCy}
            >
              <stop offset="0%"   stopColor="#5A9660" />
              <stop offset="88%"  stopColor="#3A6640" />
              <stop offset="100%" stopColor="#3A6640" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ghost track */}
          <path d={svgPath} fill="none" stroke="#3A6640" strokeWidth="2.5" strokeOpacity="0.12" strokeLinecap="round" />

          {/* Animated drawing line */}
          <motion.path d={svgPath} fill="none" stroke="url(#tlGrad)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength }} />

          {/* Nodes */}
          {nodePositions.map((node, i) => (
            <React.Fragment key={i}>
              <motion.circle
                cx={node.cx} cy={node.cy} r="10"
                fill="white" stroke="#3A6640" strokeWidth="2.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={activeNodes[i] ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
              />
              <motion.circle
                cx={node.cx} cy={node.cy} r="4"
                fill="#3A6640"
                initial={{ scale: 0, opacity: 0 }}
                animate={activeNodes[i] ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.08 }}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
              />
            </React.Fragment>
          ))}
        </svg>
      )}

      {/* Cards column — ref on the inner wrapper so x-translate doesn't pollute cy measurement */}
      <div className="flex flex-col gap-20 pt-10 pb-10">
        {data.map((item, i) => {
          const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
          return (
            <motion.div
              key={i}
              className={`flex w-full ${side === "right" ? "justify-end" : "justify-start"}`}
              // No scale — translateX only; doesn't affect top/height measurement
              initial={{ opacity: 0, x: side === "right" ? 48 : -48 }}
              animate={
                activeNodes[i]
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: side === "right" ? 48 : -48 }
              }
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.1 }}
            >
              <div
                ref={(el) => { cardRefs.current[i] = el; }}
                className="w-[41%] flex flex-col gap-2"
              >
                <p className={`text-xs font-mono text-[#3A6640] tracking-widest ${
                  side === "left" ? "text-right" : "text-left"
                }`}>
                  {item.title}
                </p>
                <div className="w-full bg-card border border-[#3A6640]/15 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#3A6640]/30 transition-all duration-300">
                  {item.content}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export const Timeline = ({ data }: { data: TimelineEntry[]; hideHeader?: boolean }) =>
  <CurvedTimeline data={data} />;

