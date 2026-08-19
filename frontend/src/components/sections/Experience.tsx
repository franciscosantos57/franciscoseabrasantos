import { Badge } from "@/components/ui/badge";
import { CurvedTimeline } from "@/components/ui/timeline";
import { MapPin } from "lucide-react";
import data from "@/data/portfolio.json";
import importrustSrc from "@/assets/importrust.jpg";
import jeknowledgeSrc from "@/assets/jeknowledge.jpg";
import neiSrc from "@/assets/nei.jpg";
import deiSrc from "@/assets/dei.jpg";
import ucSrc from "@/assets/uc.jpg";

const COMPANY_ICONS: Record<number, string> = {
  1: importrustSrc,
  2: jeknowledgeSrc,
  3: neiSrc,
  4: deiSrc,
  5: ucSrc,
};

export default function Experience() {
  const timelineData = data.experience.map((item) => ({
    // title is rendered as the period label above each card
    title: item.period,
    content: (
      <div className="w-full bg-card border border-primary/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Card header */}
        <div className="relative flex items-center gap-3 px-4 pt-4 pb-3.5 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-primary/55 via-primary to-primary/75 rounded-l-2xl" />

          {COMPANY_ICONS[item.id] && (
            <img
              src={COMPANY_ICONS[item.id]}
              alt={item.company}
              className={`w-11 h-11 md:w-13 md:h-13 rounded-xl border border-primary/20 shrink-0 shadow-sm ${
                item.id === 5 ? "bg-white object-contain p-1.5" : "object-cover"
              }`}
            />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight text-foreground dark:text-white">
              {item.title}
            </h3>
            <p className="text-[13px] font-semibold text-primary mt-0.5">{item.company}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground dark:text-white/55 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.location}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-2.5 px-4 py-3.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground dark:text-white/75">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary border-primary/25 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <section
      id="experience"
      className="experience-bg bg-muted/50 overflow-hidden relative"
    >
      {/* Section header */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-10 md:px-6 md:pt-32 md:pb-4 reveal flex flex-col gap-3">
        <p className="text-sm font-mono text-primary tracking-widest uppercase">
          career
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Experience
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">My journey so far.</p>
      </div>

      {/* Curved SVG Timeline */}
      <CurvedTimeline data={timelineData} />
    </section>
  );
}
