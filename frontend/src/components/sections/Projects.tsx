import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectGridBackground } from "@/components/ui/ProjectGridBackground";
import { GithubIcon, Link as LinkIcon } from "lucide-react";
import data from "@/data/portfolio.json";
import vozsaudeSrc from "@/assets/vozsaude.png";
import hacSrc from "@/assets/hac.png";
import aplmSrc from "@/assets/aplm.png";
import dotworksSrc from "@/assets/dotworks.png";

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
      className="py-20 px-8 md:py-32 md:px-6 relative overflow-hidden bg-background"
    >
      <ProjectGridBackground />
      <div className="relative z-10 max-w-4xl flex flex-col gap-12 md:gap-16" style={{ marginInline: "auto" }}>
        <div className="reveal flex flex-col gap-3">
          <p className="text-sm font-mono text-primary tracking-widest uppercase">portfolio</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-base md:text-lg">Things I've built.</p>
        </div>

        <div className="flex flex-col gap-10 md:gap-12">
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
      className={`reveal reveal-delay-${Math.min(index + 1, 4)} group flex flex-col sm:flex-row rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300`}
    >
      {cover && (
        <div className="relative w-full aspect-video sm:w-2/5 sm:aspect-auto shrink-0 overflow-hidden">
          <img
            src={cover}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <ProjectCardBody
        project={project}
        titleClassName="text-lg md:text-xl font-bold"
        bodyClassName="flex flex-col gap-4 md:gap-5 p-5 sm:p-8 flex-1"
        headerGapClassName="gap-4"
        tagGapClassName="gap-2"
      />
    </div>
  );
}

function SmallCard({ project, index }: { project: Project; index: number }) {
  const cover = PROJECT_COVERS[project.id];

  return (
    <div
      className={`reveal reveal-delay-${Math.min((index % 4) + 1, 4)} group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md hover:shadow-primary/8 transition-all duration-300`}
    >
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

      <ProjectCardBody
        project={project}
        titleClassName="text-base font-semibold"
        bodyClassName="flex flex-col gap-4 p-5 md:p-6 flex-1"
        headerGapClassName="gap-2"
        tagGapClassName="gap-1.5"
      />
    </div>
  );
}

function ProjectCardBody({
  project,
  titleClassName,
  bodyClassName,
  headerGapClassName,
  tagGapClassName,
}: {
  project: Project;
  titleClassName: string;
  bodyClassName: string;
  headerGapClassName: string;
  tagGapClassName: string;
}) {
  return (
    <div className={bodyClassName}>
      <div className={`flex items-center justify-between ${headerGapClassName}`}>
        <h3 className={`${titleClassName} group-hover:text-primary transition-colors text-left`}>
          {project.title}
        </h3>
        <div className="flex gap-1 shrink-0">
          {project.github && (
            <ProjectActionButton href={project.github}>
              <GithubIcon className="h-4 w-4" />
            </ProjectActionButton>
          )}
          {project.live && (
            <ProjectActionButton href={project.live}>
              <LinkIcon className="h-4 w-4" />
            </ProjectActionButton>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed text-left flex-1">
        {project.description}
      </p>

      <div className={`flex flex-wrap ${tagGapClassName}`}>
        {project.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs rounded-full bg-primary/8 text-primary border-primary/25 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ProjectActionButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="size-8 min-h-8 min-w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="size-8">
        {children}
      </a>
    </Button>
  );
}
