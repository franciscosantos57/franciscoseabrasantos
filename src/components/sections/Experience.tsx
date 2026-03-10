import { Badge } from "@/components/ui/badge";
import { CurvedTimeline } from "@/components/ui/timeline";
import { MapPin } from "lucide-react";
import data from "@/data/portfolio.json";
import importrustSrc from "@/assets/importrust.jpg";
import jeknowledgeSrc from "@/assets/jeknowledge.jpg";
import neiSrc from "@/assets/nei.jpg";
import deiSrc from "@/assets/dei.jpg";

const COMPANY_ICONS: Record<number, string> = {
  1: importrustSrc,
  2: jeknowledgeSrc,
  3: neiSrc,
  4: deiSrc,
};

export default function Experience() {
  const timelineData = data.experience.map((item) => ({
    // title is rendered as the period label above each card
    title: item.period,
    content: (
      <div className="flex flex-col gap-3">
        {/* Role + company + icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold leading-snug text-foreground dark:text-white">
              {item.title}
            </h3>
            <p className="text-xs font-semibold text-[#3A6640]">{item.company}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground dark:text-white/60">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.location}
            </span>
          </div>
          {COMPANY_ICONS[item.id] && (
            <img
              src={COMPANY_ICONS[item.id]}
              alt={item.company}
              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#3A6640]/15"
            />
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-muted-foreground dark:text-white/75">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#3A6640]/8 text-[#3A6640] border-[#3A6640]/25 hover:bg-[#3A6640] hover:text-white hover:border-[#3A6640] transition-colors"
            >
              {tag}
            </Badge>
          ))}
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
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-12 reveal flex flex-col gap-3">
        <p className="text-sm font-mono text-[#3A6640] tracking-widest uppercase">
          career
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Experience
        </h2>
        <p className="text-muted-foreground text-lg">My journey so far.</p>
      </div>

      {/* Curved SVG Timeline */}
      <CurvedTimeline data={timelineData} />
    </section>
  );
}



