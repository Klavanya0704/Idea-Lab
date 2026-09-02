import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import generalDentistryImg from "@/assets/service-general-dentistry.png";
import dentalImplantsImg from "@/assets/service-dental-implants.jpg";
import orthodonticsImg from "@/assets/service-orthodontics.jpg";
import cosmeticDentistryImg from "@/assets/service-cosmetic-dentistry.jpg";
import rootCanalImg from "@/assets/service-root-canal.jpg";

type Service = {
  title: string;
  description: string;
  image: string;
  alt: string;
  tone: string;
  titleColor: string;
};

const services: Service[] = [
  {
    title: "General Dentistry",
    description: "Cleanings, checkups & oral care",
    image: generalDentistryImg,
    alt: "3D purple tooth icon for General Dentistry",
    tone: "bg-soft-purple",
    titleColor: "text-brand-purple",
  },
  {
    title: "Dental Implants",
    description: "Permanent solutions for missing teeth",
    image: dentalImplantsImg,
    alt: "3D dental implant icon for Dental Implants",
    tone: "bg-soft-blue",
    titleColor: "text-brand",
  },
  {
    title: "Orthodontics",
    description: "Braces & aligners for a perfect smile",
    image: orthodonticsImg,
    alt: "3D tooth with braces icon for Orthodontics",
    tone: "bg-soft-pink",
    titleColor: "text-brand-pink",
  },
  {
    title: "Cosmetic Dentistry",
    description: "Whitening, veneers & smile makeovers",
    image: cosmeticDentistryImg,
    alt: "3D tooth with protective shield icon for Cosmetic Dentistry",
    tone: "bg-soft-cyan",
    titleColor: "text-brand-deep",
  },
  {
    title: "Root Canal Treatment",
    description: "Relief from pain & save natural teeth",
    image: rootCanalImg,
    alt: "3D root canal tooth icon for Root Canal Treatment",
    tone: "bg-soft-orange",
    titleColor: "text-[#D97706]",
  },
];

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex min-w-[16rem] flex-1 snap-start flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card sm:p-6">
      <div
        className={`mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full sm:h-40 sm:w-40 lg:h-44 lg:w-44 ${service.tone}`}
      >
        <img
          src={service.image}
          alt={service.alt}
          width={180}
          height={180}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
      <h3 className={`mt-6 text-lg font-semibold leading-snug ${service.titleColor}`}>
        {service.title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {service.description}
      </p>
      <div className="mt-6 flex justify-end">
        <a
          href="#appointment"
          aria-label={`Book ${service.title}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

export function DentalServices() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" className="relative bg-background pt-6">
      <div className="mx-auto max-w-[1400px] rounded-[2rem] bg-surface px-5 py-14 sm:rounded-[2.5rem] lg:px-12 lg:py-20">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <span className="flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.24em] text-brand">
              <span className="h-[2px] w-10 rounded-full bg-gradient-brand" />
              OUR DENTAL SERVICES
            </span>
            <h2 className="mt-5 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[3rem]">
              Complete Care for Every Smile
            </h2>
          </div>
          <button
            type="button"
            aria-label="Show more services"
            onClick={() => trackRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-brand text-white shadow-soft transition-transform duration-300 hover:scale-105"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible"
        >
          {services.map((s) => (
            <ServiceCard key={s.title} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
