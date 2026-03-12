import { useEffect, useRef } from "react";

interface Shape {
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

export function FloatingCubes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const shapesRef = useRef<Shape[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const initShapes = () => {
      const sign = () => (Math.random() < 0.5 ? 1 : -1);
      shapesRef.current = Array.from({ length: 18 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseSize: 28 + Math.random() * 72,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
        baseOpacity: 0.045 + Math.random() * 0.09,
        rotY: Math.random() * Math.PI * 2,
        rotX: Math.random() * Math.PI * 2,
        rotSpeedY: sign() * (0.18 + Math.random() * 0.32),
        rotSpeedX: sign() * (0.08 + Math.random() * 0.16),
      }));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initShapes();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains("dark");
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cr = isDark ? 100 : 58;
      const cg = isDark ? 170 : 102;
      const cb = isDark ? 110 : 64;

      for (const s of shapesRef.current) {
        const breath = Math.sin(t * 0.001 * s.speed + s.phase);
        const size = s.baseSize * (1 + breath * 0.18);

        const dx = mx - s.x;
        const dy = my - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - dist / 240);

        const sizeFinal = size * (1 + inf * 0.9);
        const baseOp = s.baseOpacity * (isDark ? 2.2 : 3.2) * (1 + inf * 1.6);

        const rotY = s.rotY + t * 0.001 * s.rotSpeedY;
        const rotX = s.rotX + t * 0.001 * s.rotSpeedX;
        drawCube(ctx, s.x, s.y, sizeFinal, rotY, rotX, cr, cg, cb, baseOp);
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
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
