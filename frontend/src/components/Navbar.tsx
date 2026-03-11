import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Navbar({ isDark, onToggleDark }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["home", "experience", "projects", "contact"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 md:px-10 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <button
          onClick={() => handleNav("#home")}
          className="font-bold text-lg tracking-tight transition-colors"
        >
          <span className="bg-linear-to-r from-[#3A6640] to-[#5A9660] bg-clip-text text-transparent">
            Francisco
          </span>{" "}
          <span className="text-foreground">Santos</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                active === href.replace("#", "")
                  ? "text-[#3A6640] dark:text-white font-semibold"
                  : "text-foreground/60 dark:text-white/75 hover:text-[#3A6640] hover:bg-[#3A6640]/8 dark:hover:text-white dark:hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            className="ml-1 text-muted-foreground dark:text-white/60 hover:text-[#3A6640] hover:bg-[#3A6640]/8 dark:hover:text-white dark:hover:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground hover:text-[#3A6640]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </header>

      {/* Mobile full-screen overlay — sibling of header to avoid fixed-in-fixed clipping */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background flex flex-col">
          {/* Header row — same height as navbar */}
          <div className="w-full px-4 h-16 flex items-center justify-between border-b border-border">
            <button
              onClick={() => handleNav("#home")}
              className="font-bold text-lg tracking-tight"
            >
              <span className="bg-linear-to-r from-[#3A6640] to-[#5A9660] bg-clip-text text-transparent">Francisco</span>{" "}
              <span className="text-foreground">Santos</span>
            </button>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav links — centred, large */}
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => handleNav(href)}
                className={`w-full max-w-xs text-center px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                  active === href.replace("#", "")
                    ? "text-[#3A6640] font-semibold bg-[#3A6640]/8"
                    : "text-foreground/60 hover:text-[#3A6640] hover:bg-[#3A6640]/8"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dark mode toggle at bottom */}
          <div className="pb-10 flex justify-center">
            <button
              onClick={onToggleDark}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-[#3A6640] hover:bg-[#3A6640]/8 transition-all"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
