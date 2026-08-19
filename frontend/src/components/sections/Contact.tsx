import { Mail, LinkedinIcon, GithubIcon, ArrowUpRight } from "lucide-react";
import data from "@/data/portfolio.json";

const contactLinks = [
  {
    label: "Email",
    value: data.contact.email,
    href: `mailto:${data.contact.email}`,
    icon: Mail,
    description: "Send me an email",
  },
  {
    label: "LinkedIn",
    value: "franciscoseabrasantos",
    href: data.contact.linkedin,
    icon: LinkedinIcon,
    description: "Let's connect",
  },
  {
    label: "GitHub",
    value: "franciscosantos57",
    href: data.contact.github,
    icon: GithubIcon,
    description: "Check my work",
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="min-h-[100svh] md:min-h-[100dvh] px-8 py-12 md:px-6 md:py-24 bg-muted/50 flex items-center"
      style={{ minHeight: "100svh" }}
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 md:gap-16">
        {/* Section header */}
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs md:text-sm font-mono text-primary tracking-widest uppercase">get in touch</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Contact</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-lg">{data.contact.message}</p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
          {contactLinks.map(({ label, value, href, icon: Icon, description }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                  <p className="text-xs text-muted-foreground truncate">{value}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border flex flex-col gap-1 text-center text-muted-foreground text-xs md:text-sm pt-5 md:pt-8">
          <p>
            Designed & built by{" "}
            <span className="text-foreground font-medium">Francisco Seabra Santos</span>
          </p>
          <p className="text-xs">{new Date().getFullYear()} - All rights reserved</p>
        </div>
      </div>
    </section>
  );
}
