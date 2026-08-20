import { useEffect, useRef, useState } from "react";

interface Shape {
  nx: number;
  ny: number;
  x: number;
  y: number;
  baseSize: number;
  phase: number;
  speed: number;
  baseOpacity: number;
  rotY: number;
  rotX: number;
  rotSpeedY: number;
  rotSpeedX: number;
}

const MOBILE_CUBES = [
  { left: "8%", top: "12%", size: 42, duration: 8.4, delay: -5.6, opacity: 0.3, dx: "16px", dy: "-18px" },
  { left: "72%", top: "10%", size: 54, duration: 9.6, delay: -1.4, opacity: 0.28, dx: "-18px", dy: "22px" },
  { left: "83%", top: "28%", size: 72, duration: 10.8, delay: -7.2, opacity: 0.26, dx: "12px", dy: "-24px" },
  { left: "10%", top: "34%", size: 58, duration: 9.2, delay: -3.8, opacity: 0.22, dx: "22px", dy: "16px" },
  { left: "31%", top: "43%", size: 44, duration: 7.8, delay: -6.2, opacity: 0.24, dx: "-14px", dy: "-20px" },
  { left: "58%", top: "50%", size: 66, duration: 10.2, delay: -2.5, opacity: 0.2, dx: "18px", dy: "18px" },
  { left: "86%", top: "55%", size: 46, duration: 8.8, delay: -4.3, opacity: 0.25, dx: "-16px", dy: "16px" },
  { left: "13%", top: "70%", size: 78, duration: 11.4, delay: -8.8, opacity: 0.24, dx: "18px", dy: "-18px" },
  { left: "47%", top: "75%", size: 52, duration: 8.6, delay: -1.9, opacity: 0.2, dx: "-18px", dy: "20px" },
  { left: "72%", top: "82%", size: 68, duration: 10.6, delay: -6.7, opacity: 0.23, dx: "14px", dy: "-22px" },
  { left: "5%", top: "88%", size: 44, duration: 8.2, delay: -3.1, opacity: 0.27, dx: "20px", dy: "14px" },
  { left: "90%", top: "88%", size: 40, duration: 7.6, delay: -5.1, opacity: 0.26, dx: "-18px", dy: "-16px" },
];

function getThemeRgb() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--theme-rgb")
    .trim()
    .split(/\s+/)
    .map(Number);

  return value.length === 3 && value.every(Number.isFinite) ? value : [0, 160, 129];
}

function drawCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotY: number,
  rotX: number,
  r: number,
  g: number,
  b: number,
  baseOp: number
) {
  const h = size / 2;

  const verts: [number, number, number][] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h,  h], [h, -h,  h], [h, h,  h], [-h, h,  h],
  ];

  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

  const transformed = verts.map(([vx, vy, vz]) => {
    const rx  =  vx * cosY + vz * sinY;
    const rz1 = -vx * sinY + vz * cosY;
    const ry  =  vy * cosX - rz1 * sinX;
    const rz  =  vy * sinX + rz1 * cosX;
    return [cx + rx, cy + ry, rz] as [number, number, number];
  });

  const proj = transformed.map(([px, py]) => [px, py] as [number, number]);

  const faces = [
    { idx: [0, 1, 2, 3], nx:  0, ny:  0, nz: -1 },
    { idx: [7, 6, 5, 4], nx:  0, ny:  0, nz:  1 },
    { idx: [4, 5, 1, 0], nx:  0, ny: -1, nz:  0 },
    { idx: [3, 2, 6, 7], nx:  0, ny:  1, nz:  0 },
    { idx: [0, 3, 7, 4], nx: -1, ny:  0, nz:  0 },
    { idx: [1, 5, 6, 2], nx:  1, ny:  0, nz:  0 },
  ];

  const visible = faces
    .map((face) => {
      const rnz1 = -face.nx * sinY + face.nz * cosY;
      const rnz  =  face.ny * sinX + rnz1 * cosX;
      return { ...face, normalZ: rnz };
    })
    .filter((f) => f.normalZ > 0);

  visible.sort((a, b) => {
    const za = a.idx.reduce((s, i) => s + transformed[i][2], 0) / 4;
    const zb = b.idx.reduce((s, i) => s + transformed[i][2], 0) / 4;
    return za - zb;
  });

  for (const face of visible) {
    const [first, ...rest] = face.idx;
    ctx.beginPath();
    ctx.moveTo(proj[first][0], proj[first][1]);
    for (const i of rest) ctx.lineTo(proj[i][0], proj[i][1]);
    ctx.closePath();

    const shade = 0.15 + face.normalZ * 0.85;
    const op = Math.min(baseOp * shade, 0.5);
    ctx.fillStyle = `rgba(${r},${g},${b},${op})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(op * 0.6, 0.25)})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function MobileFloatingCubes() {
  return (
    <div className="mobile-floating-cubes absolute inset-0 md:hidden" aria-hidden="true">
      {MOBILE_CUBES.map((cube, index) => (
        <div
          key={index}
          className="mobile-floating-cube"
          style={{
            left: cube.left,
            top: cube.top,
            width: cube.size,
            height: cube.size,
            opacity: cube.opacity,
            animationDuration: `${cube.duration}s`,
            animationDelay: `${cube.delay}s`,
            ["--cube-size" as string]: `${cube.size}px`,
            ["--cube-drift-x" as string]: cube.dx,
            ["--cube-drift-y" as string]: cube.dy,
          }}
        >
          <span className="mobile-cube-face mobile-cube-front" />
          <span className="mobile-cube-face mobile-cube-back" />
          <span className="mobile-cube-face mobile-cube-right" />
          <span className="mobile-cube-face mobile-cube-left" />
          <span className="mobile-cube-face mobile-cube-top" />
          <span className="mobile-cube-face mobile-cube-bottom" />
        </div>
      ))}
    </div>
  );
}

function CanvasFloatingCubes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const shapesRef = useRef<Shape[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const canUsePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const shapeCount = isMobile ? 12 : 18;
    let canvasCssWidth = 0;
    let elapsed = 0;
    let previousFrame: number | null = null;

    const initShapes = () => {
      const sign = () => (Math.random() < 0.5 ? 1 : -1);
      shapesRef.current = Array.from({ length: shapeCount }, () => {
        const nx = Math.random();
        const ny = Math.random();

        return {
          nx,
          ny,
          x: nx * canvas.width,
          y: ny * canvas.height,
          baseSize: isMobile ? 22 + Math.random() * 42 : 28 + Math.random() * 72,
          phase: Math.random() * Math.PI * 2,
          speed: isMobile ? 0.72 + Math.random() * 0.58 : 0.3 + Math.random() * 0.7,
          baseOpacity: isMobile ? 0.04 + Math.random() * 0.06 : 0.045 + Math.random() * 0.09,
          rotY: Math.random() * Math.PI * 2,
          rotX: Math.random() * Math.PI * 2,
          rotSpeedY: sign() * (isMobile ? 0.52 + Math.random() * 0.45 : 0.18 + Math.random() * 0.32),
          rotSpeedX: sign() * (isMobile ? 0.24 + Math.random() * 0.26 : 0.08 + Math.random() * 0.16),
        };
      });
    };

    const syncShapePositions = () => {
      shapesRef.current = shapesRef.current.map((shape) => ({
        ...shape,
        x: shape.nx * canvas.width,
        y: shape.ny * canvas.height,
      }));
    };

    const resize = () => {
      const nextWidth = canvas.offsetWidth;
      const nextHeight = canvas.offsetHeight;

      if (isMobile && canvasCssWidth && Math.abs(nextWidth - canvasCssWidth) < 2) {
        return;
      }

      canvasCssWidth = nextWidth;
      canvas.width = nextWidth;
      canvas.height = nextHeight;

      if (shapesRef.current.length !== shapeCount) {
        initShapes();
      } else {
        syncShapePositions();
      }
    };

    const draw = (t: number) => {
      const delta = previousFrame === null ? 16.7 : Math.min(t - previousFrame, 34);
      previousFrame = t;
      elapsed += delta;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains("dark");
      const mx = canUsePointer ? mouseRef.current.x : -9999;
      const my = canUsePointer ? mouseRef.current.y : -9999;
      const [baseR, baseG, baseB] = getThemeRgb();

      for (const s of shapesRef.current) {
        const breath = Math.sin(elapsed * 0.001 * s.speed + s.phase);
        const size = s.baseSize * (1 + breath * 0.18);

        const dx = mx - s.x;
        const dy = my - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - dist / 240);

        const sizeFinal = size * (1 + inf * 0.9);
        const baseOp = s.baseOpacity * (isDark ? 2.2 : 3.2) * (1 + inf * 1.6);

        const rotY = s.rotY + elapsed * 0.001 * s.rotSpeedY;
        const rotX = s.rotX + elapsed * 0.001 * s.rotSpeedX;
        drawCube(ctx, s.x, s.y, sizeFinal, rotY, rotX, baseR, baseG, baseB, baseOp);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      // Ignore touch/stylus — only real mouse pointer should trigger the proximity effect.
      if (e.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouseRef.current = { x: -9999, y: -9999 };
    };
    if (canUsePointer) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    draw(performance.now());

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener("resize", resize);
      if (canUsePointer) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 hidden h-full w-full pointer-events-none md:block"
    />
  );
}

export function FloatingCubes() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  ));

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile ? <MobileFloatingCubes /> : <CanvasFloatingCubes />;
}
