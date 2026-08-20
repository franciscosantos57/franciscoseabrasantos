import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Home from "@/components/sections/Home";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import { InteractiveCursor } from "@/components/ui/InteractiveCursor";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useThemeColor } from "@/hooks/useThemeColor";

const NAV_HEIGHT = 64;

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT);
  window.scrollTo({ top, behavior: "auto" });
}

function App() {
  useScrollReveal();
  const { isDark, toggle } = useDarkMode();
  const { hue, setHue, isAutoColor, toggleAutoColor } = useThemeColor();

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;

      requestAnimationFrame(() => {
        scrollToSection(id);
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          isDark={isDark}
          onToggleDark={toggle}
          themeHue={hue}
          onThemeHueChange={setHue}
          isAutoColor={isAutoColor}
          onToggleAutoColor={toggleAutoColor}
        />
        <main>
          <Home />
          <Experience />
          <Projects />
          <Contact />
        </main>
        <InteractiveCursor />
      </div>
    </TooltipProvider>
  );
}

export default App;
