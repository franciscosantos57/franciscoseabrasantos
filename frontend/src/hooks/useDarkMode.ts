import { useState, useEffect, useRef } from "react";

export function useDarkMode() {
  // True only if the user has explicitly toggled (or had a stored preference from a previous session).
  const manualOverride = useRef(!!localStorage.getItem("theme"));

  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      const dark = stored === "dark";
      document.documentElement.classList.toggle("dark", dark);
      return dark;
    }
    // No stored preference: follow the OS.
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
    return prefersDark;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    // Only persist to localStorage when the user has manually overridden —
    // otherwise the OS-change listener would always be blocked by a stored value.
    if (manualOverride.current) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  // Follow OS changes whenever there is no manual override.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!manualOverride.current) setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    manualOverride.current = true;
    setIsDark((d) => !d);
  };

  return { isDark, toggle };
}
