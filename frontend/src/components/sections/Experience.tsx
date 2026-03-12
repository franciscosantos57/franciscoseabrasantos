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
      <div className="w-full bg-card border border-[#3A6640]/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#3A6640]/30 transition-all duration-300">
        {/* Card header */}
        <div className="relative flex items-center gap-3 px-4 pt-4 pb-3.5 bg-linear-to-br from-[#3A6640]/10 via-[#3A6640]/5 to-transparent border-b border-[#3A6640]/10">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-[#7BC47F] via-[#3A6640] to-[#2C5432] rounded-l-2xl" />

          {COMPANY_ICONS[item.id] && (
            <img
              src={COMPANY_ICONS[item.id]}
              alt={item.company}
              className="w-13 h-13 rounded-xl object-cover border border-[#3A6640]/20 shrink-0 shadow-sm"
            />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight text-foreground dark:text-white">
              {item.title}
            </h3>
            <p className="text-[13px] font-semibold text-[#3A6640] mt-0.5">{item.company}</p>
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
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#3A6640]/8 text-[#3A6640] border-[#3A6640]/25 hover:bg-[#3A6640] hover:text-white hover:border-[#3A6640] transition-colors"
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
      <div className="max-w-4xl mx-auto px-5 pt-20 pb-10 md:px-6 md:pt-32 md:pb-4 reveal flex flex-col gap-3">
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



