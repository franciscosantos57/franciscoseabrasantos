import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], [data-cursor-interactive]";

type CursorMode = "default" | "interactive" | "text";

function getCursorMode(target: EventTarget | null): CursorMode {
  const element = target instanceof Element ? target : null;
  if (!element) return "default";
  if (element.closest("input, textarea, [contenteditable='true']")) return "text";
  if (element.closest(INTERACTIVE_SELECTOR)) return "interactive";
  return "default";
}

export function InteractiveCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);
  const modeRef = useRef<CursorMode>("default");

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const update = () => {
      setEnabled(media.matches);
      document.documentElement.classList.toggle("site-cursor-enabled", media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
      document.documentElement.classList.remove("site-cursor-enabled");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = document.querySelector<HTMLElement>("[data-cursor-dot]");
    const halo = document.querySelector<HTMLElement>("[data-cursor-halo]");
    if (!dot || !halo) return;

    const pos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      haloX: window.innerWidth / 2,
      haloY: window.innerHeight / 2,
      previousX: window.innerWidth / 2,
      previousY: window.innerHeight / 2,
      angle: 0,
      stretch: 1,
      initialized: false,
    };
    let raf = 0;
    let visible = false;

    const render = () => {
      pos.haloX += (pos.x - pos.haloX) * 0.32;
      pos.haloY += (pos.y - pos.haloY) * 0.32;
      pos.stretch += (1 - pos.stretch) * 0.2;

      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      halo.style.transform = `translate3d(${pos.haloX}px, ${pos.haloY}px, 0) translate(-50%, -50%) rotate(${pos.angle}deg) scaleX(${pos.stretch})`;
      raf = requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const velocity = Math.min(14, Math.hypot(event.clientX - pos.previousX, event.clientY - pos.previousY));
      pos.angle = Math.atan2(event.clientY - pos.previousY, event.clientX - pos.previousX) * (180 / Math.PI);
      pos.stretch = 1 + velocity * 0.018;
      pos.previousX = event.clientX;
      pos.previousY = event.clientY;
      pos.x = event.clientX;
      pos.y = event.clientY;

      if (!pos.initialized) {
        pos.initialized = true;
        pos.haloX = event.clientX;
        pos.haloY = event.clientY;
      }

      const nextMode = getCursorMode(event.target);
      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
      }

      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        halo.style.opacity = "1";
      }
    };

    const handlePointerLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      halo.style.opacity = "0";
    };

    const handlePointerDown = () => setPressed(true);
    const handlePointerUp = () => setPressed(false);

    raf = requestAnimationFrame(render);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isInteractive = mode === "interactive";
  const isText = mode === "text";

  return (
    <>
      <div
        data-cursor-halo
        aria-hidden="true"
        className={`fixed left-0 top-0 z-[100] pointer-events-none rounded-full opacity-0 transition-[width,height,border-color,background-color,box-shadow,opacity] duration-180 ease-out ${
          isInteractive
            ? pressed
              ? "h-11 w-11 border border-primary bg-primary/16 shadow-[0_0_30px_rgb(var(--theme-rgb)/0.24)]"
              : "h-13 w-13 border border-primary bg-primary/12 shadow-[0_0_34px_rgb(var(--theme-rgb)/0.22)]"
            : isText
              ? "h-9 w-5 rounded-md border border-primary/65 bg-primary/8 shadow-[0_0_24px_rgb(var(--theme-rgb)/0.18)]"
              : pressed
                ? "h-7 w-7 border border-primary/70 bg-primary/10 shadow-[0_0_24px_rgb(var(--theme-rgb)/0.2)]"
                : "h-8 w-8 border border-primary/55 bg-primary/6 shadow-[0_0_28px_rgb(var(--theme-rgb)/0.16)]"
        }`}
      />
      <div
        data-cursor-dot
        aria-hidden="true"
        className={`fixed left-0 top-0 z-[101] pointer-events-none opacity-0 transition-[width,height,background-color,border-color,opacity] duration-120 ease-out ${
          isInteractive
            ? "h-2.5 w-2.5 rounded-full border border-primary bg-background shadow-[0_0_0_4px_rgb(var(--theme-rgb)/0.2)]"
            : isText
              ? "h-5 w-0.75 rounded-full bg-primary"
              : "h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_rgb(var(--theme-rgb)/0.4)]"
        } ${pressed ? "h-2 w-2 bg-primary" : ""}`}
      />
    </>
  );
}
