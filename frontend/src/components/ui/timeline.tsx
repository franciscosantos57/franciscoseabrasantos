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

const primaryOklch = "oklch(0.62 0.14 var(--theme-hue))";
const primaryDeepOklch = "oklch(0.42 0.12 var(--theme-hue))";
const primarySoftOklch = "oklch(0.74 0.12 var(--theme-hue))";

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

// 3 weaving strands that converge exactly to anchorCxs[i] at every node
// (so all strands meet at the sphere centre), then oscillate between nodes
// via bezier control points. weavingPhase shifts the oscillation on scroll.
function buildWeavingPath(
  nodes: NodePos[], tailCy: number, phase: number, amplitude: number,
  anchorCxs: number[]
): string {
  if (nodes.length === 0) return "";
  let d = `M ${anchorCxs[0]} ${nodes[0].cy}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1], curr = nodes[i];
    const midY = (prev.cy + curr.cy) / 2;
    // oscillation peak lives at the midpoint between nodes
    const t = ((i - 0.5) / Math.max(nodes.length - 1, 1)) * Math.PI * 3;
    const osc = amplitude * Math.sin(t + phase);
    d += ` C ${anchorCxs[i-1] + osc} ${midY}, ${anchorCxs[i] + osc} ${midY}, ${anchorCxs[i]} ${curr.cy}`;
  }
  d += ` L ${anchorCxs[anchorCxs.length - 1]} ${tailCy}`;
  return d;
}

// Projects a 3-D cube to visible SVG polygon faces in painter's order —
// same vertex math as FloatingCubes.tsx, outputs SVG-ready strings.
function svgCubeFaces(
  cx: number, cy: number, size: number, rotY: number, rotX: number
): { key: number; points: string; shade: number }[] {
  const h = size / 2;
  const verts: [number, number, number][] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h,  h], [h, -h,  h], [h, h,  h], [-h, h,  h],
  ];
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const transformed = verts.map(([vx, vy, vz]): [number, number, number] => {
    const rx  =  vx * cosY + vz * sinY;
    const rz1 = -vx * sinY + vz * cosY;
    const ry  =  vy * cosX - rz1 * sinX;
    const rz  =  vy * sinX + rz1 * cosX;
    return [cx + rx, cy + ry, rz];
  });
  const faces = [
    { idx: [0, 1, 2, 3], nx:  0, ny:  0, nz: -1 },
    { idx: [7, 6, 5, 4], nx:  0, ny:  0, nz:  1 },
    { idx: [4, 5, 1, 0], nx:  0, ny: -1, nz:  0 },
    { idx: [3, 2, 6, 7], nx:  0, ny:  1, nz:  0 },
    { idx: [0, 3, 7, 4], nx: -1, ny:  0, nz:  0 },
    { idx: [1, 5, 6, 2], nx:  1, ny:  0, nz:  0 },
  ];
  return faces
    .map((face) => {
      const rnz1 = -face.nx * sinY + face.nz * cosY;
      const rnz  =  face.ny * sinX + rnz1 * cosX;
      return { ...face, normalZ: rnz };
    })
    .filter((f) => f.normalZ > 0)
    .sort((a, b) => {
      const za = a.idx.reduce((s, j) => s + transformed[j][2], 0) / 4;
      const zb = b.idx.reduce((s, j) => s + transformed[j][2], 0) / 4;
      return za - zb;
    })
    .map((face, fi) => ({
      key: fi,
      points: face.idx
        .map(j => `${transformed[j][0].toFixed(2)},${transformed[j][1].toFixed(2)}`)
        .join(" "),
      shade: face.normalZ,
    }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CurvedTimeline({ data }: { data: TimelineEntry[] }) {
  const n = data.length;
  const thresholds = buildThresholds(n);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [svgDims, setSvgDims]             = useState({ w: 900, h: 1400 });
  const [nodePositions, setNodePositions] = useState<NodePos[]>([]);
  const [activeNodes, setActiveNodes]     = useState<boolean[]>(new Array(n).fill(false));
  const [isMobile, setIsMobile]           = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [mobileTailCy, setMobileTailCy]   = useState<number | null>(null);
  const [weavingPhase, setWeavingPhase]   = useState(0);
  const [tipProgress, setTipProgress]     = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Measurement ─────────────────────────────────────────────────────────────
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const w     = cRect.width;
    const h     = container.scrollHeight;

    if (isMobile) {
      const cx = w / 2;
      const rects = cardRefs.current.map(ref => ref?.getBoundingClientRect() ?? null);
      const positions: NodePos[] = rects.map((rect, i) => {
        const prevRect = i > 0 ? rects[i - 1] : null;
        let cy: number;
        if (i === 0 && rect) {
          // First node: ensure sphere (r=38) + spring margin never clips at SVG top
          cy = Math.max(60, (rect.top - cRect.top) / 2);
        } else if (rect && prevRect) {
          // Between bottom of previous card and top of this card
          cy = ((prevRect.bottom - cRect.top) + (rect.top - cRect.top)) / 2;
        } else {
          cy = 40 + i * 200;
        }
        return { cx, cy, side: 'right' as const };
      });
      const lastRect = rects[rects.length - 1];
      const lastCardBottom = lastRect ? lastRect.bottom - cRect.top : h * 0.82;
      const lastNodeTail = positions.length > 0
        ? positions[positions.length - 1].cy + 240
        : h * 0.9;
      const desiredTailEnd = Math.max(
        lastNodeTail,
        lastCardBottom + 104,
      );
      const tailEnd = Math.min(h - 32, desiredTailEnd);
      setSvgDims({ w, h });
      setMobileTailCy(tailEnd);
      setNodePositions(positions);
    } else {
      const positions: NodePos[] = cardRefs.current.map((ref, i) => {
        const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
        const cx = side === "right" ? w * 0.55 : w * 0.45;
        if (!ref) return { cx, cy: 80 + i * 320, side };
        const rRect = ref.getBoundingClientRect();
        const cy = rRect.top - cRect.top + rRect.height / 2;
        return { cx, cy, side };
      });
      setSvgDims({ w, h });
      setMobileTailCy(null);
      setNodePositions(positions);
    }
  }, [isMobile]);

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
    setWeavingPhase(latest * Math.PI * 2);
    setTipProgress(latest);
  });

  // ── Tip fade mask (fades the animated leading edge of the strands) ──────────
  const FADE_ZONE_PX  = 130;
  const tipFadeEndY   = tipProgress * svgDims.h;
  const tipFadeStartY = Math.max(0, tipFadeEndY - FADE_ZONE_PX);

  // ── SVG path ────────────────────────────────────────────────────────────────
  const tailCy     = isMobile && mobileTailCy !== null
    ? mobileTailCy
    : nodePositions.length > 0
    ? nodePositions[nodePositions.length - 1].cy + 240
    : svgDims.h * 0.9;
  const svgPath    = buildPath(nodePositions, tailCy);
  const mobilePath = `M ${svgDims.w / 2} 0 L ${svgDims.w / 2} ${tailCy}`;
  const activePath = isMobile ? mobilePath : svgPath;
  const viewBox    = `0 0 ${svgDims.w} ${svgDims.h}`;

  // ── Weaving strand paths (scroll-driven phase shifts the crossing points) ──
  const A = 28; // lateral amplitude in SVG units

  // Sphere centre for each node — all 3 strands anchor here so the
  // junction with the globe is perfectly seamless
  const sphereCxs: number[] = nodePositions.map((node, i) => {
    const t_i = n > 1 ? (i / (n - 1)) * Math.PI * 3 : 0;
    return node.cx + (isMobile ? 0 : A * 0.15 * Math.sin(t_i + weavingPhase));
  });

  const strand1d = nodePositions.length > 0
    ? (isMobile
        ? `M ${svgDims.w / 2 - 9} 0 L ${svgDims.w / 2 - 9} ${tailCy}`
        : buildWeavingPath(nodePositions, tailCy, weavingPhase, A, sphereCxs))
    : "";
  const strand2d = nodePositions.length > 0
    ? (isMobile
        ? `M ${svgDims.w / 2} 0 L ${svgDims.w / 2} ${tailCy}`
        : buildWeavingPath(nodePositions, tailCy, weavingPhase + Math.PI * 2 / 3, A, sphereCxs))
    : "";
  const strand3d = nodePositions.length > 0
    ? (isMobile
        ? `M ${svgDims.w / 2 + 9} 0 L ${svgDims.w / 2 + 9} ${tailCy}`
        : buildWeavingPath(nodePositions, tailCy, weavingPhase + Math.PI * 4 / 3, A, sphereCxs))
    : "";

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl px-4 pb-24 pt-14 md:pt-4"
      style={{ marginInline: "auto" }}
    >
      {/* SVG absolute overlay — always behind cards */}
      {activePath && (
        <svg
          viewBox={viewBox}
          className="absolute left-0 top-0 w-full pointer-events-none z-0"
          style={{ height: svgDims.h }}
          overflow="visible"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Strand 1 — lightest, drawn on top */}
            <linearGradient id="tlGrad1" gradientUnits="userSpaceOnUse"
              x1={svgDims.w / 2} y1="0" x2={svgDims.w / 2} y2={tailCy}>
              <stop offset="0%"   stopColor={primarySoftOklch} />
              <stop offset="88%"  stopColor={primaryOklch} />
              <stop offset="100%" stopColor={primaryOklch} stopOpacity="0" />
            </linearGradient>
            {/* Strand 2 — mid tone */}
            <linearGradient id="tlGrad2" gradientUnits="userSpaceOnUse"
              x1={svgDims.w / 2} y1="0" x2={svgDims.w / 2} y2={tailCy}>
              <stop offset="0%"   stopColor={primaryOklch} />
              <stop offset="88%"  stopColor={primaryDeepOklch} />
              <stop offset="100%" stopColor={primaryDeepOklch} stopOpacity="0" />
            </linearGradient>
            {/* Strand 3 — darkest, drawn behind */}
            <linearGradient id="tlGrad3" gradientUnits="userSpaceOnUse"
              x1={svgDims.w / 2} y1="0" x2={svgDims.w / 2} y2={tailCy}>
              <stop offset="0%"   stopColor={primaryOklch} />
              <stop offset="88%"  stopColor={primaryDeepOklch} />
              <stop offset="100%" stopColor={primaryDeepOklch} stopOpacity="0" />
            </linearGradient>

            {/* Tip fade: gradient mask so the animated leading edge fades to transparent */}
            <linearGradient id="tipFadeGrad" gradientUnits="userSpaceOnUse"
              x1="0" y1={tipFadeStartY} x2="0" y2={Math.max(tipFadeEndY, tipFadeStartY + 1)}>
              <stop offset="0%"   stopColor="white" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="tipFadeMask">
              {tipFadeStartY > 0 && (
                <rect x="0" y="0" width={svgDims.w} height={tipFadeStartY} fill="white" />
              )}
              <rect x="0" y={tipFadeStartY} width={svgDims.w}
                height={Math.max(1, tipFadeEndY - tipFadeStartY + 1)}
                fill="url(#tipFadeGrad)" />
            </mask>
          </defs>

          {/* Strands — wrapped in mask so the animated tip fades out */}
          <g mask="url(#tipFadeMask)">
            {/* Strand 3 — behind */}
            {strand3d && (
              <motion.path d={strand3d} fill="none" stroke="url(#tlGrad3)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.60" style={{ pathLength }} />
            )}

            {/* Strand 2 — middle */}
            {strand2d && (
              <motion.path d={strand2d} fill="none" stroke="url(#tlGrad2)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.80" style={{ pathLength }} />
            )}

            {/* Strand 1 — front */}
            {strand1d && (
              <motion.path d={strand1d} fill="none" stroke="url(#tlGrad1)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength }} />
            )}
          </g>

          {/* Nodes — rotating 3D cubes (same renderer as FloatingCubes) */}
          {nodePositions.map((node, i) => {
            const S = 38;
            const t_i = n > 1 ? (i / (n - 1)) * Math.PI * 3 : 0;
            const scx = node.cx + (isMobile ? 0 : A * 0.15 * Math.sin(t_i + weavingPhase));
            const cy  = node.cy;
            // Both axes scroll-driven at different rates → natural tumble
            const rotY = weavingPhase * 1.2 + t_i * 0.8;
            const rotX = weavingPhase * 0.7 + i * 0.45;
            const faces = svgCubeFaces(scx, cy, S, rotY, rotX);
            return (
              <motion.g
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={activeNodes[i] ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                style={{ transformOrigin: `${scx}px ${cy}px` }}
              >
                {/* mask: background circle hides strands behind the cube;
                    the area between cube silhouette and circle edge shows bg color
                    which is invisible since it matches the page background */}
                <circle cx={scx} cy={cy} r={S} fill="var(--background)" />
                {faces.map(({ key: fk, points, shade }) => (
                  <polygon
                    key={fk}
                    points={points}
                    fill={`rgb(var(--theme-rgb) / ${(0.08 + shade * 0.50).toFixed(3)})`}
                    stroke={`rgb(var(--theme-rgb) / ${(0.35 + shade * 0.55).toFixed(3)})`}
                    strokeWidth="1"
                  />
                ))}
              </motion.g>
            );
          })}
        </svg>
      )}

      {/* Cards column — ref on the inner wrapper so x-translate doesn't pollute cy measurement */}
      <div className="flex flex-col gap-28 sm:pt-0 pt-10 pb-10">
        {data.map((item, i) => {
          const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
          const justify = isMobile ? "justify-center" : side === "right" ? "justify-end" : "justify-start";
          const initX   = isMobile ? 0 : side === "right" ? 48 : -48;
          return (
            <motion.div
              key={i}
              className={`relative z-10 flex w-full ${justify}`}
              initial={{ opacity: 0, x: initX }}
              animate={
                activeNodes[i]
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: initX }
              }
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.1 }}
            >
              <div
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`${isMobile ? "w-full" : "w-[38%]"} flex flex-col gap-2`}
              >
                <p className={`text-xs font-mono text-primary tracking-widest ${
                  side === "left" ? "text-right" : "text-left"
                }`}>
                  {item.title}
                </p>
                {item.content}
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
