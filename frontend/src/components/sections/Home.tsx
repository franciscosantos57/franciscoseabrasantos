import { GithubIcon, LinkedinIcon, Mail, Phone, Download, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FloatingCubes } from "@/components/ui/FloatingCubes";
import data from "@/data/portfolio.json";
import photoSrc from "@/assets/photo-optimized.jpg";
import { useState } from "react";

const socialLinks = [
  {
    label: "GitHub",
    href: data.personal.links.github,
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    href: data.personal.links.linkedin,
    icon: LinkedinIcon,
  },
  {
    label: "Email",
    href: data.personal.links.email,
    icon: Mail,
  },
  {
    label: "Phone",
    href: data.personal.links.phone,
    icon: Phone,
  },
];

export default function Home() {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const scrollToNext = () => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-[100svh] md:min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-8 md:px-6 pt-16"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Background: interactive floating circles + corner glows + overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingCubes />
        {/* Top-left corner glow */}
        <div className="absolute -top-24 -left-24 w-105 h-105 rounded-full bg-primary/12 blur-3xl" />
        {/* Bottom-right corner glow */}
        <div className="absolute -bottom-24 -right-24 w-95 h-95 rounded-full bg-primary/10 blur-3xl" />
        {/* Soft radial clearing so text stays readable */}
        <div className="home-bg-overlay absolute inset-0" />
      </div>

      <div className="home-intro relative z-10 flex flex-col items-center text-center max-w-2xl gap-5 md:gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-linear-to-r from-primary to-primary/55 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-primary/40 bg-muted flex items-center justify-center">
            {photoFailed ? <span className="text-4xl font-bold text-muted-foreground">FS</span> : <img
              width={176}
              height={176}
              fetchPriority="high"
              decoding="async"
              src={photoSrc}
              alt={data.personal.name}
              className={`w-full h-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${photoReady ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setPhotoReady(true)}
              onError={() => setPhotoFailed(true)}
            />}
          </div>
        </div>

        {/* Name */}
        <div className="flex w-full flex-col gap-2">
          <h1 className="whitespace-nowrap text-[clamp(1.18rem,5.1vw,1.75rem)] md:text-5xl font-bold tracking-tight">
            <span className="theme-gradient-text">
              {data.personal.name}
            </span>
          </h1>
          <p className="text-muted-foreground dark:text-white/80 text-base md:text-lg font-medium">{data.personal.role}</p>
        </div>

        {/* Description */}
        <p className="text-muted-foreground dark:text-white/75 leading-relaxed text-sm md:text-base max-w-xl">
          {data.personal.description}
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border-border hover:scale-115 hover:shadow-lg hover:shadow-black/15 hover:border-foreground/35 dark:border-white/20 dark:hover:border-white/60 dark:hover:bg-white/10 dark:hover:shadow-white/15 transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* CV download */}
        <a href={data.personal.cv} download>
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base"
          >
            <Download className="h-4 w-4" />
            Download CV
          </Button>
        </a>
      </div>

      {/* Scroll down hint */}
      <button
        onClick={scrollToNext}
        className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </section>
  );
}
