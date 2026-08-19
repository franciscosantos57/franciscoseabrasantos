import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Home from "@/components/sections/Home";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useThemeColor } from "@/hooks/useThemeColor";

function App() {
  useScrollReveal();
  const { isDark, toggle } = useDarkMode();
  const { hue, setHue, isAutoColor, toggleAutoColor } = useThemeColor();

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
      </div>
    </TooltipProvider>
  );
}

export default App;
