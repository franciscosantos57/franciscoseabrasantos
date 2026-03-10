import { useEffect, useRef } from "react";

interface Circle {
  x: number;
  y: number;
  baseR: number;
  phase: number;
  speed: number;
  baseOpacity: number;
}

export function FloatingCircles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const circlesRef = useRef<Circle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const initCircles = () => {
      circlesRef.current = Array.from({ length: 18 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseR: 28 + Math.random() * 72,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
        baseOpacity: 0.045 + Math.random() * 0.09,
      }));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initCircles();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains("dark");
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const c of circlesRef.current) {
        const breath = Math.sin(t * 0.001 * c.speed + c.phase);
        const r = c.baseR * (1 + breath * 0.18);

        const dx = mx - c.x;
        const dy = my - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - dist / 240);

        const rFinal = r * (1 + inf * 0.9);
        const baseOp = c.baseOpacity * (isDark ? 2.2 : 1.0);
        const opFinal = Math.min(baseOp * (1 + inf * 1.6), 0.42);

        ctx.beginPath();
        ctx.arc(c.x, c.y, rFinal, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(100,170,110,${opFinal})`
          : `rgba(58,102,64,${opFinal})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
