import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, Star, X } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

const gallery = [
  { src: g1, alt: "Close-up of a bright healthy smile" },
  { src: g2, alt: "Dentist consulting with a patient" },
  { src: g3, alt: "Dentist treating a patient's teeth" },
  { src: g4, alt: "Modern dental clinic treatment room" },
];

const testimonials = [
  {
    quote:
      "Amazing experience! The staff is very friendly and the clinic is very clean and modern.",
    name: "Priya S.",
    initials: "PS",
    tone: "bg-soft-purple text-brand-purple",
  },
  {
    quote: "Best dental care I've ever had. Highly recommend SmileCare!",
    name: "Rahul M.",
    initials: "RM",
    tone: "bg-soft-blue text-brand",
  },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="font-display text-2xl text-foreground">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function AboutSection() {
  return (
    <Panel title="About Us">
      <p className="text-sm leading-relaxed text-muted-foreground">
        At SmileCare Dental Hospital, we are committed to providing exceptional dental care in a
        comfortable and compassionate environment. Your smile is our priority.
      </p>
      {/* Large Handwritten Signature */}
      <div className="mt-5 mb-2">
        <span className="inline-block font-signature text-3xl font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#6D4AFF] via-[#6B35D9] to-[#A855F7] opacity-95 drop-shadow-[0_1px_2px_rgba(107,53,217,0.15)] sm:text-4xl">
          Dr. Anaya Sharma
        </span>
      </div>

      {/* Clean Designation Line */}
      <div className="space-y-0.5">
        <p className="text-sm font-bold text-[#17203A]">Dr. Anaya Sharma</p>
        <p className="text-xs font-medium text-[#667085]">Chief Dental Surgeon</p>
      </div>
      <a
        href="#appointment"
        className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform duration-300 hover:scale-[1.03]"
      >
        Learn More About Us
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </Panel>
  );
}

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active !== null) {
        setActive(null);
      }
    };
    if (active !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return (
    <>
      <Panel title="Smile Gallery">
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((img, i) => (
            <button
              key={img.alt}
              type="button"
              onClick={() => setActive(i)}
              className="overflow-hidden rounded-2xl shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <img
                src={img.src}
                alt={img.alt}
                width={768}
                height={768}
                loading="lazy"
                className="h-28 w-full object-cover sm:h-32"
              />
            </button>
          ))}
        </div>
      </Panel>

      {active !== null && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close image"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={gallery[active].src}
              alt={gallery[active].alt}
              className="w-full rounded-[2rem] object-cover shadow-lift"
            />
            <p className="mt-4 text-center text-sm text-white/90">{gallery[active].alt}</p>
          </div>
        </div>
      )}
    </>
  );
}

export function Testimonials() {
  return (
    <Panel title="What Our Patients Say">
      <div className="grid gap-4">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold ${t.tone}`}
              >
                {t.initials}
              </span>
              <span className="flex shrink-0 gap-0.5 text-brand-pink">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
            <p className="mt-3 text-sm font-semibold text-foreground">— {t.name}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function ClinicInformation() {
  return (
    <Panel title="Clinic Information">
      <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-brand">
          <Clock className="h-4 w-4" /> WORKING HOURS
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {[
            ["Monday – Friday", "9:00 AM – 7:00 PM"],
            ["Saturday", "9:00 AM – 5:00 PM"],
            ["Sunday", "Closed"],
          ].map(([d, h]) => (
            <li key={d} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">{d}</span>
              <span className="shrink-0 font-semibold text-foreground">{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand-purple">CONTACT US</p>
        <ul className="mt-4 space-y-4 text-sm">
          <li className="flex min-w-0 items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft-blue text-brand">
              <MapPin className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 text-muted-foreground">
              123 Smile Street,
              <br />
              New Delhi, India 110001
            </span>
          </li>
          <li className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft-purple text-brand-purple">
              <Phone className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <a
              href="tel:+919876543210"
              className="truncate text-muted-foreground hover:text-foreground"
            >
              +91 98765 43210
            </a>
          </li>
          <li className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft-pink text-brand-pink">
              <Mail className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <a
              href="mailto:info@smilecare.com"
              className="truncate text-muted-foreground hover:text-foreground"
            >
              info@smilecare.com
            </a>
          </li>
        </ul>
      </div>
    </Panel>
  );
}

export function InfoSection() {
  return (
    <section id="about" className="bg-background px-5 py-10 lg:px-10 lg:py-14">
      <div
        id="gallery"
        className="mx-auto grid max-w-[1320px] gap-12 rounded-[2rem] bg-surface px-6 py-14 sm:rounded-[2.5rem] sm:px-10 lg:grid-cols-4 lg:gap-10 lg:px-12 lg:py-16"
      >
        <AboutSection />
        <Gallery />
        <Testimonials />
        <ClinicInformation />
      </div>
    </section>
  );
}
