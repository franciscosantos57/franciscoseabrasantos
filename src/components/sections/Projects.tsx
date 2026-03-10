import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import data from "@/data/portfolio.json";
import vozsaudeSrc from "@/assets/vozsaude.jpg";
import hacSrc from "@/assets/hac.jpg";
import aplmSrc from "@/assets/aplm.jpg";
import dotworksSrc from "@/assets/dotworks.jpg";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  github: string | null;
  live: string | null;
  featured: boolean;
}

const PROJECT_COVERS: Record<number, string> = {
  1: vozsaudeSrc,
  2: hacSrc,
  3: aplmSrc,
  4: dotworksSrc,
};

export default function Projects() {
  const featured = data.projects.filter((p) => p.featured);
  const rest = data.projects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      className="py-32 px-6 relative dot-bg"
    >
      <div className="max-w-4xl flex flex-col gap-16" style={{ marginInline: "auto" }}>
        {/* Section header */}
        <div className="reveal flex flex-col gap-3">
          <p className="text-sm font-mono text-[#3A6640] tracking-widest uppercase">portfolio</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-lg">Things I've built.</p>
        </div>

        <div className="flex flex-col gap-12">
          {featured.length > 0 && (
            <div className="flex flex-col gap-6">
              {featured.map((project, i) => (
                <FeaturedCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">other work</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {rest.map((project, i) => (
                  <SmallCard key={project.id} project={project} index={i + featured.length} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const cover = PROJECT_COVERS[project.id];
  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 4)} group flex flex-row rounded-2xl border border-border bg-card overflow-hidden hover:border-[#3A6640]/40 hover:shadow-xl hover:shadow-[#3A6640]/10 transition-all duration-300`}
    >
      {/* Cover image — left side, stretches to card height */}
      {cover && (
        <div className="relative w-2/5 shrink-0 overflow-hidden">
          <img
            src={cover}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Accent line on right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#3A6640] to-[#5A9660]" />
        </div>
      )}

      <div className="flex flex-col gap-5 p-8 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold group-hover:text-[#3A6640] transition-colors text-left">
            {project.title}
          </h3>
          <div className="flex gap-1 shrink-0">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3A6640] hover:text-white transition-colors">
                  <Github className="h-4 w-4" />
                </Button>
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3A6640] hover:text-white transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed text-left flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs rounded-full bg-[#3A6640]/8 text-[#3A6640] border-[#3A6640]/25 hover:bg-[#3A6640] hover:text-white hover:border-[#3A6640] transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function SmallCard({ project, index }: { project: Project; index: number }) {
  const cover = PROJECT_COVERS[project.id];
  return (
    <div
      className={`reveal reveal-delay-${Math.min((index % 4) + 1, 4)} group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-[#3A6640]/40 hover:shadow-md hover:shadow-[#3A6640]/8 transition-all duration-300`}
    >
      {/* Cover image */}
      {cover && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={cover}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-card/30" />
        </div>
      )}

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold group-hover:text-[#3A6640] transition-colors text-left">
            {project.title}
          </h3>
          <div className="flex gap-1 shrink-0">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#3A6640] hover:text-white transition-colors">
                  <Github className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#3A6640] hover:text-white transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed text-left flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs rounded-full bg-[#3A6640]/8 text-[#3A6640] border-[#3A6640]/25 hover:bg-[#3A6640] hover:text-white hover:border-[#3A6640] transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

