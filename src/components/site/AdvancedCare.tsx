import { Cpu, Heart, ShieldPlus, User } from "lucide-react";
import careImage from "@/assets/advanced-care.jpg";

const features = [
  { icon: Cpu, title: "Digital", subtitle: "Technology" },
  { icon: Heart, title: "Pain-Free", subtitle: "Treatment" },
  { icon: ShieldPlus, title: "Sterilized", subtitle: "Environment" },
  { icon: User, title: "Friendly", subtitle: "Doctors" },
];

export function AdvancedCare() {
  return (
    <section id="doctors" className="bg-background px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto grid w-full max-w-[1240px] overflow-hidden rounded-[28px] shadow-xl lg:h-[340px] lg:grid-cols-[55%_45%]">
        {/* LEFT SIDE (55%): SmileCare Blue -> Purple -> Pink Gradient Panel */}
        <div className="flex flex-col justify-between bg-[linear-gradient(110deg,#3155D9_0%,#6B35D9_55%,#D83CCF_100%)] p-7 sm:p-9 lg:p-[34px_40px] text-white">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-[1.08] text-white sm:text-3xl lg:text-[36px]">
              Advanced Care,
              <br />
              Exceptional Experience
            </h2>
            <p className="mt-3.5 max-w-[460px] text-xs leading-[1.5] text-white/90 sm:text-[14px]">
              We combine advanced technology with a gentle approach to deliver pain-free,
              comfortable, and effective dental care.
            </p>
          </div>

          {/* 4 Feature Items (Horizontal Row at bottom) */}
          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-xs backdrop-blur-xs">
                  <f.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="mt-2 text-[11px] font-medium leading-[1.18] text-white/95 sm:text-[13px]">
                  {f.title}
                  <br />
                  {f.subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (45%): Doctor + Patient Image */}
        <div className="relative h-64 w-full sm:h-72 lg:h-full">
          <img
            src={careImage}
            alt="Dentist consulting with a patient in dental chair using a digital tablet"
            width={1024}
            height={1024}
            loading="lazy"
            className="h-full w-full object-cover object-[center_25%]"
          />
        </div>
      </div>
    </section>
  );
}
