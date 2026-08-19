import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "portfolio-theme-hue-choice";
const DEFAULT_HUE = 143;
const FULL_CYCLE_MS = 180000;

function readStoredHue() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  const value = Number(stored);
  return Number.isFinite(value) ? value : null;
}

function readInitialState() {
  const storedHue = readStoredHue();

  return {
    hue: storedHue ?? DEFAULT_HUE,
    autoEnabled: storedHue === null,
  };
}

function hueToRgb(hue: number) {
  const lightness = 0.62;
  const chroma = 0.14;
  const radians = (hue / 180) * Math.PI;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  const linearRgb = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linearRgb.map((channel) => {
    const clamped = Math.max(0, Math.min(1, channel));
    const srgb = clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055;

    return Math.round(srgb * 255);
  });
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

function applyThemeHue(hue: number) {
  const normalizedHue = normalizeHue(hue);
  const root = document.documentElement;
  root.style.setProperty("--theme-hue", String(normalizedHue));
  root.style.setProperty("--theme-rgb", hueToRgb(normalizedHue).join(" "));
}

export function useThemeColor() {
  const initialState = useRef(readInitialState());
  const [autoEnabled, setAutoEnabled] = useState(initialState.current.autoEnabled);
  const [hue, setHue] = useState(initialState.current.hue);
  const hueRef = useRef(initialState.current.hue);

  useEffect(() => {
    hueRef.current = normalizeHue(hue);
    applyThemeHue(hueRef.current);
  }, [hue]);

  useEffect(() => {
    if (!autoEnabled) return;

    let raf = 0;
    let previous = performance.now();
    let lastStateSync = previous;

    const tick = (now: number) => {
      const delta = now - previous;
      previous = now;
      hueRef.current = normalizeHue(hueRef.current + (delta / FULL_CYCLE_MS) * 360);
      applyThemeHue(hueRef.current);

      if (now - lastStateSync > 120) {
        setHue(hueRef.current);
        lastStateSync = now;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoEnabled]);

  const chooseHue = useCallback((nextHue: number) => {
    const normalizedHue = normalizeHue(nextHue);
    hueRef.current = normalizedHue;
    setHue(normalizedHue);
    setAutoEnabled(false);
    applyThemeHue(normalizedHue);
    window.localStorage.setItem(STORAGE_KEY, String(normalizedHue));
  }, []);

  const toggleAutoColor = useCallback(() => {
    setAutoEnabled((enabled) => {
      const nextEnabled = !enabled;

      if (nextEnabled) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        setHue(hueRef.current);
      }

      return nextEnabled;
    });
  }, []);

  return {
    hue,
    setHue: chooseHue,
    isAutoColor: autoEnabled,
    toggleAutoColor,
  };
}
