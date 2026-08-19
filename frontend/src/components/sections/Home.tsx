import { GithubIcon, LinkedinIcon, Mail, Phone, Download, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FloatingCubes } from "@/components/ui/FloatingCubes";
import data from "@/data/portfolio.json";
import photoSrc from "@/assets/photo.jpeg";

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
  const scrollToNext = () => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-[100dvh] flex flex-col items-center justify-center relative px-6 pt-16"
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

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl gap-6">
        {/* Avatar */}
        <div className="reveal relative group">
          <div className="absolute -inset-1.5 bg-linear-to-r from-primary to-primary/55 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
          <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-primary/40 bg-muted flex items-center justify-center">
            <img
              src={photoSrc}
              alt={data.personal.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML = `
                  <span class="text-4xl font-bold text-muted-foreground">FS</span>
                `;
              }}
            />
          </div>
        </div>

        {/* Name */}
        <div className="reveal reveal-delay-1 flex flex-col gap-2">
          <h1 className="whitespace-nowrap text-[2rem] mobile-sm:text-2xl md:text-5xl font-bold tracking-tight">
            <span className="theme-gradient-text">
              {data.personal.name}
            </span>
          </h1>
          <p className="text-muted-foreground dark:text-white/80 text-lg font-medium">{data.personal.role}</p>
        </div>

        {/* Description */}
        <p className="reveal reveal-delay-2 text-muted-foreground dark:text-white/75 leading-relaxed text-base max-w-xl">
          {data.personal.description}
        </p>

        {/* Social icons */}
        <div className="reveal reveal-delay-3 flex items-center gap-3">
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
                    className="w-11 h-11 rounded-full border-border hover:scale-115 hover:shadow-lg hover:shadow-black/15 hover:border-foreground/35 dark:border-white/20 dark:hover:border-white/60 dark:hover:bg-white/10 dark:hover:shadow-white/15 transition-all duration-200"
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
        <a className="reveal reveal-delay-4" href={data.personal.cv} download>
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 px-8 py-3 text-base"
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
