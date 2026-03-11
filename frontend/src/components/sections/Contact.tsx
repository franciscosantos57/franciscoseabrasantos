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
    <section id="contact" className="py-20 px-5 md:py-32 md:px-6 bg-muted/50">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        {/* Section header */}
        <div className="reveal flex flex-col gap-3">
          <p className="text-sm font-mono text-[#3A6640] tracking-widest uppercase">get in touch</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Contact</h2>
          <p className="text-muted-foreground text-lg max-w-lg">{data.contact.message}</p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {contactLinks.map(({ label, value, href, icon: Icon, description }, i) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`reveal reveal-delay-${i + 1} block group`}
            >
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 hover:border-[#3A6640]/50 hover:shadow-md hover:shadow-[#3A6640]/10 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#3A6640]/10 border border-[#3A6640]/20 flex items-center justify-center text-[#3A6640]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#3A6640] transition-colors" />
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
        <div className="reveal border-t border-border flex flex-col gap-1 text-center text-muted-foreground text-sm pt-8">
          <p>
            Designed & built by{" "}
            <span className="text-foreground font-medium">Francisco Seabra Santos</span>
          </p>
          <p className="text-xs">{new Date().getFullYear()} — All rights reserved</p>
        </div>
      </div>
    </section>
  );
}

