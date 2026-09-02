import { useState } from "react";
import { ArrowUpRight, Check, Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "./Logo";

const socials = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
];

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.05-.8-.01-1.76.2-2.63.22-.94 1.45-6.14 1.45-6.14s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.7 0 1.02-.65 2.55-.99 3.97-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.58-2.74 3.58-5.99 0-2.47-1.66-4.32-4.69-4.32-3.42 0-5.55 2.55-5.55 5.4 0 .98.29 1.68.74 2.22.21.25.24.35.16.63-.05.2-.18.72-.23.92-.08.29-.32.4-.59.29-1.64-.67-2.4-2.46-2.4-4.47 0-3.33 2.8-7.32 8.36-7.32 4.47 0 7.41 3.23 7.41 6.7 0 4.58-2.55 8-6.3 8-1.26 0-2.44-.68-2.85-1.45l-.77 3.05c-.28 1-.83 2-1.32 2.77A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("done");
    setEmail("");
  };

  return (
    <footer id="contact" className="px-5 pb-8 lg:px-10">
      <div className="mx-auto max-w-[1320px] rounded-[2rem] bg-gradient-soft px-6 py-12 sm:rounded-[2.5rem] sm:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          <div className="min-w-0">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium dental care in the heart of New Delhi — gentle, modern and made for every
              smile.
            </p>
          </div>

          <div className="min-w-0">
            <h4 className="font-display text-xl text-foreground">Stay Connected</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow us for dental tips, smiles &amp; updates.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#contact"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full bg-card text-brand-purple shadow-soft transition-transform duration-300 hover:scale-110"
                >
                  <s.icon className="h-5 w-5" strokeWidth={1.7} />
                </a>
              ))}
              <a
                href="#contact"
                aria-label="Pinterest"
                className="grid h-11 w-11 place-items-center rounded-full bg-card text-brand-pink shadow-soft transition-transform duration-300 hover:scale-110"
              >
                <PinterestIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <form
              onSubmit={submit}
              noValidate
              className="flex items-center gap-2 rounded-full bg-card p-2 shadow-soft"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState("idle");
                }}
                placeholder="Your email address"
                aria-label="Your email address"
                className="w-full min-w-0 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="group grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-brand text-white transition-transform duration-300 hover:scale-105"
              >
                {state === "done" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </button>
            </form>
            {state === "error" && (
              <p className="mt-2 pl-4 text-xs text-destructive">
                Please enter a valid email address.
              </p>
            )}
            {state === "done" && (
              <p className="mt-2 pl-4 text-xs font-medium text-brand-purple">
                You&apos;re subscribed — welcome to SmileCare!
              </p>
            )}
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              © 2025 SmileCare Dental Hospital.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
