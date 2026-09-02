import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Play, ShieldCheck, Sparkles, Stethoscope, X } from "lucide-react";
import heroImage from "@/assets/hero-dentist.jpg";
import { ToothIcon } from "./Logo";

const highlights = [
  { icon: Sparkles, title: "Advanced Technology", tone: "bg-soft-blue text-brand" },
  { icon: ShieldCheck, title: "Pain-Free Treatment", tone: "bg-soft-purple text-brand-purple" },
  { icon: Stethoscope, title: "Experienced Doctors", tone: "bg-soft-pink text-brand-pink" },
];

const avatars = ["PS", "RM", "AK", "NV"];

export function FeatureHighlights() {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-4 pt-8">
      {highlights.map((h) => (
        <li key={h.title} className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${h.tone}`}>
            <h.icon className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{h.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoOpen) {
        setVideoOpen(false);
      }
    };
    if (videoOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoOpen]);

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[38rem] w-[38rem] rounded-full bg-gradient-soft blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 h-[26rem] w-[26rem] rounded-full bg-soft-purple blur-3xl" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-10 pt-10 lg:grid-cols-2 lg:gap-8 lg:px-10 lg:pb-20 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-w-0"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-soft-purple px-4 py-2 text-[0.7rem] font-semibold tracking-[0.18em] text-brand-purple">
            <ToothIcon className="h-4 w-4" /> SMILECARE DENTAL HOSPITAL
          </span>

          <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl xl:text-[4.4rem]">
            <span className="text-brand">Your Smile,</span>
            <br />
            <span className="text-gradient-brand">Our Passion</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Advanced dental care for a healthier, brighter smile. Experience comfort, care and
            confidence.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#appointment"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-brand py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-card transition-transform duration-300 hover:scale-[1.03]"
            >
              Book Appointment
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20">
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>

            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="group inline-flex items-center gap-3 rounded-full border border-border bg-card py-2 pl-2 pr-6 text-sm font-semibold text-foreground shadow-soft transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-soft-pink text-brand-pink">
                <Play className="h-4 w-4 fill-current" />
              </span>
              Watch Our Video
            </button>
          </div>

          <FeatureHighlights />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative min-w-0"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-soft p-2 shadow-lift sm:rounded-[2.5rem]">
            <img
              src={heroImage}
              alt="Dentist examining a smiling patient at SmileCare Dental Hospital"
              width={1024}
              height={1280}
              className="h-[26rem] w-full rounded-[1.6rem] object-cover sm:h-[34rem] lg:h-[38rem] sm:rounded-[2rem]"
            />
            <div className="pointer-events-none absolute inset-2 rounded-[1.6rem] bg-gradient-to-t from-brand-deep/20 via-transparent to-white/10 sm:rounded-[2rem]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card absolute bottom-5 right-3 w-[15rem] rounded-3xl p-4 sm:bottom-8 sm:right-6 sm:w-[17rem] sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white">
                <ToothIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  Patient&apos;s Choice
                </span>
                <span className="block text-xs text-muted-foreground">Award 2024</span>
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex shrink-0 -space-x-2">
                {avatars.map((a, i) => (
                  <span
                    key={a}
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[0.6rem] font-semibold text-white ${
                      ["bg-brand", "bg-brand-purple", "bg-brand-pink", "bg-brand-deep"][i]
                    }`}
                  >
                    {a}
                  </span>
                ))}
              </div>
              <span className="truncate text-xs font-semibold text-foreground">
                2K+ Happy Smiles
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {videoOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid aspect-video place-items-center bg-gradient-brand px-6 text-center text-white">
              <div>
                <Play className="mx-auto h-14 w-14 fill-current opacity-90" />
                <p className="mt-4 text-lg font-semibold">Inside SmileCare Dental Hospital</p>
                <p className="mt-1 text-sm text-white/80">Clinic tour video coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
