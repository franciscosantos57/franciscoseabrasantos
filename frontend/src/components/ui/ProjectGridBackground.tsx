import { useEffect, useRef } from "react";

const CELL = 28;
const MAX_DPR = 1.35;
const DURATION = 12000;
const WAVE_SPREAD = 285;
const WAVE_REACH = WAVE_SPREAD * 3;
const MAX_LIFT = 42;
const MIN_INTENSITY = 0.0015;
const DIAGONAL_SLOPE = 0.42;

interface GridCell {
  x: number;
  y: number;
  wavePosition: number;
  texture: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function periodicDistance(position: number, waveX: number, loopLength: number) {
  const offset = ((((position - waveX) % loopLength) + loopLength) % loopLength);
  const distance = Math.min(offset, loopLength - offset);

  return distance;
}

function waveIntensity(wavePosition: number, waveX: number, loopLength: number) {
  const distance = periodicDistance(wavePosition, waveX, loopLength);
  if (distance > WAVE_REACH) return 0;

  return Math.exp(-(distance * distance) / (2 * WAVE_SPREAD * WAVE_SPREAD));
}

function cellTexture(col: number, row: number) {
  const broad = Math.sin(col * 0.18 + row * 0.26) * 0.11;
  const fine = Math.sin(col * 0.68 - row * 0.43) * 0.055;
  const diagonal = Math.sin((col + row) * 0.15) * 0.055;

  return clamp(1 + broad + fine + diagonal, 0.78, 1.22);
}

function createCells(cols: number, rows: number) {
  return Array.from({ length: cols * rows }, (_, index): GridCell => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * CELL;
    const y = row * CELL;
    const centerX = x + CELL / 2;
    const centerY = y + CELL / 2;

    return {
      x,
      y,
      wavePosition: centerX + centerY * DIAGONAL_SLOPE,
      texture: cellTexture(col, row),
    };
  });
}

function getThemeRgb() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--theme-rgb")
    .trim()
    .split(/\s+/)
    .map(Number);

  return value.length === 3 && value.every(Number.isFinite) ? value : [77, 155, 74];
}

function drawPrism(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lift: number,
  intensity: number,
  isDark: boolean,
  themeRgb: number[],
) {
  const inset = 1;
  const size = CELL - 2;
  const raiseX = -lift * 0.28;
  const raiseY = -lift * 0.82;
  const topAlpha = isDark ? intensity * 0.27 : intensity * 0.3;
  const sideAlpha = isDark ? intensity * 0.32 : intensity * 0.35;
  const edgeAlpha = isDark ? intensity * 0.34 : intensity * 0.4;

  const left = x + inset;
  const top = y + inset;
  const right = x + inset + size;
  const bottom = y + inset + size;

  const raisedLeft = left + raiseX;
  const raisedTop = top + raiseY;
  const raisedRight = right + raiseX;
  const raisedBottom = bottom + raiseY;
  const [r, g, b] = themeRgb;
  const sideR = Math.max(0, r - 58);
  const sideG = Math.max(0, g - 72);
  const sideB = Math.max(0, b - 62);
  const edgeR = isDark ? Math.min(255, r + 30) : r;
  const edgeG = isDark ? Math.min(255, g + 24) : g;
  const edgeB = isDark ? Math.min(255, b + 30) : b;

  if (lift > 0.35) {
    ctx.fillStyle = isDark
      ? `rgba(${sideR},${sideG},${sideB},${sideAlpha * 0.66})`
      : `rgba(${sideR},${sideG},${sideB},${sideAlpha * 0.58})`;
    ctx.beginPath();
    ctx.moveTo(raisedLeft, raisedBottom);
    ctx.lineTo(raisedRight, raisedBottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isDark
      ? `rgba(${Math.min(255, sideR + 26)},${Math.min(255, sideG + 34)},${Math.min(255, sideB + 26)},${sideAlpha * 0.78})`
      : `rgba(${Math.min(255, sideR + 12)},${Math.min(255, sideG + 18)},${Math.min(255, sideB + 12)},${sideAlpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(raisedRight, raisedTop);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(raisedRight, raisedBottom);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = `rgba(${r},${g},${b},${topAlpha})`;
  ctx.fillRect(raisedLeft, raisedTop, size, size);

  ctx.fillStyle = isDark
    ? `rgba(225,255,226,${intensity * 0.065})`
    : `rgba(255,255,255,${intensity * 0.06})`;
  ctx.fillRect(raisedLeft + 1, raisedTop + 1, size - 2, 1);
  ctx.fillRect(raisedLeft + 1, raisedTop + 1, 1, size - 2);

  ctx.strokeStyle = isDark
    ? `rgba(${edgeR},${edgeG},${edgeB},${edgeAlpha})`
    : `rgba(${edgeR},${edgeG},${edgeB},${edgeAlpha})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(raisedLeft + 0.5, raisedTop + 0.5, size - 1, size - 1);
}

export function ProjectGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = document.getElementById("projects");
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !section || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let startTime = 0;
    let cols = 0;
    let rows = 0;
    let cells: GridCell[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = section.offsetHeight;
      cols = Math.ceil(width / CELL) + 2;
      rows = Math.ceil(height / CELL) + 2;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = createCells(cols, rows);
    };

    const render = (now: number) => {
      raf = 0;
      if (!running) return;

      const isDark = document.documentElement.classList.contains("dark");
      const themeRgb = getThemeRgb();
      const progress = reducedMotion ? 0.48 : ((now - startTime) % DURATION) / DURATION;
      const diagonalReach = height * DIAGONAL_SLOPE;
      const loopLength = Math.max(1, width + diagonalReach);
      const waveX = progress * loopLength;

      ctx.clearRect(0, 0, width, height);

      cells.forEach((cell) => {
        const baseIntensity = waveIntensity(cell.wavePosition, waveX, loopLength);
        const intensity = clamp(baseIntensity * cell.texture, 0, 1);
        if (intensity < MIN_INTENSITY) return;

        const liftIntensity = Math.pow(intensity, 1.02);
        const colorIntensity = Math.pow(intensity, 1.18);
        drawPrism(ctx, cell.x, cell.y, liftIntensity * MAX_LIFT, colorIntensity, isDark, themeRgb);
      });

      if (!reducedMotion) {
        raf = requestAnimationFrame(render);
      }
    };

    const start = () => {
      if (reducedMotion || raf) return;
      running = true;
      startTime = performance.now();
      raf = requestAnimationFrame(render);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(section);

    if (reducedMotion) {
      render(performance.now());
      running = false;
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" className="project-grid-wrap pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="project-grid-base absolute inset-0" />
      <canvas ref={canvasRef} className="project-grid-depth absolute inset-0" />
    </div>
  );
}
