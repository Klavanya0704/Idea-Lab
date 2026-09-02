import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import assistant from "@/assets/assistant.png";
import { registerPublicAppointment } from "@/lib/clinicalStore";

const serviceOptions = [
  "General Checkup",
  "Dental Implants",
  "Orthodontics",
  "Cosmetic Dentistry",
  "Root Canal Treatment",
];

const patientOptions = ["New Patient", "Returning Patient"];
const timeOptions = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const ageOptions = ["Select age", "Under 18", "18 - 30", "31 - 45", "46 - 60", "60+"];
const genderOptions = ["Select gender", "Female", "Male", "Other", "Prefer not to say"];

export function AppointmentForm() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState("2026-09-02");
  const [time, setTime] = useState("10:30 AM");
  const [service, setService] = useState(serviceOptions[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [patient, setPatient] = useState(patientOptions[0]);
  const [age, setAge] = useState(ageOptions[0]);
  const [gender, setGender] = useState(genderOptions[0]);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    if (!name.trim()) {
      next.name = "Please enter your full name";
    }

    if (!phone.trim()) {
      next.phone = "Please enter your phone number";
    }

    if (!date) {
      next.date = "Please choose a date";
    }

    if (!time) {
      next.time = "Please choose a time";
    }

    setErrors(next);
    if (Object.keys(next).length === 0) {
      // Register into Clinical Store (Persisted to localStorage)
      registerPublicAppointment({
        name,
        phone,
        email,
        date,
        time,
        service,
        patientType: patient,
        age,
        gender,
        reasonForVisit,
        medicalHistory,
      });

      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border/60 bg-white p-8 text-center shadow-card sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-soft-purple text-brand-purple">
          <CheckCircle2 className="h-8 w-8" strokeWidth={1.6} />
        </span>
        <h3 className="mt-6 font-display text-2xl font-bold text-[#17203A]">Slot Confirmed!</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you, <span className="font-semibold text-foreground">{name || "Patient"}</span>.
          Your appointment for <span className="font-semibold text-foreground">{service}</span> is
          booked for{" "}
          <span className="font-semibold text-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>{" "}
          at <span className="font-semibold text-foreground">{time}</span>. Our team will contact
          you shortly at <span className="font-semibold text-foreground">{phone}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setPhone("");
            setEmail("");
            setMedicalHistory("");
          }}
          className="mt-7 rounded-full bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-soft transition-transform duration-300 hover:scale-[1.03]"
        >
          Book Another Slot
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border/70 bg-white p-5 shadow-card sm:p-7"
    >
      <div className="space-y-3.5">
        {/* Row 1: Date & Time */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Calendar className="h-3.5 w-3.5 text-brand" /> Date
            </span>
            <div className="mt-1.5 flex items-center rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 transition-colors focus-within:border-brand">
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] outline-none sm:text-sm"
              />
            </div>
            {errors.date && (
              <span className="mt-1 block text-[11px] text-destructive">{errors.date}</span>
            )}
          </label>

          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Clock className="h-3.5 w-3.5 text-brand-purple" /> Preferred Time
            </span>
            <div className="relative mt-1.5">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 pr-9 text-xs font-medium text-[#17203A] outline-none transition-colors focus:border-brand sm:text-sm"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.time && (
              <span className="mt-1 block text-[11px] text-destructive">{errors.time}</span>
            )}
          </label>
        </div>

        {/* Row 2: Dental Service / Treatment */}
        <div>
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Stethoscope className="h-3.5 w-3.5 text-brand" /> Dental Service / Treatment
            </span>
            <div className="relative mt-1.5">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 pr-9 text-xs font-medium text-[#17203A] outline-none transition-colors focus:border-brand sm:text-sm"
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>
        </div>

        {/* Row 3: Full Name & Phone Number */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <User className="h-3.5 w-3.5 text-brand" /> Full Name
            </span>
            <div className="mt-1.5 flex items-center rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 transition-colors focus-within:border-brand">
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] placeholder:text-muted-foreground/60 outline-none sm:text-sm"
              />
            </div>
            {errors.name && (
              <span className="mt-1 block text-[11px] text-destructive">{errors.name}</span>
            )}
          </label>

          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Phone className="h-3.5 w-3.5 text-brand-purple" /> Phone Number
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border/80 bg-[#FAFAFC] px-3 py-2.5 transition-colors focus-within:border-brand">
              <span className="flex items-center gap-1 shrink-0 text-xs font-semibold text-muted-foreground border-r border-border/80 pr-2">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] placeholder:text-muted-foreground/60 outline-none sm:text-sm"
              />
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            </div>
            {errors.phone && (
              <span className="mt-1 block text-[11px] text-destructive">{errors.phone}</span>
            )}
          </label>
        </div>

        {/* Row 4: Email Address & Patient Type */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Mail className="h-3.5 w-3.5 text-brand" /> Email Address
            </span>
            <div className="mt-1.5 flex items-center rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 transition-colors focus-within:border-brand">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] placeholder:text-muted-foreground/60 outline-none sm:text-sm"
              />
            </div>
          </label>

          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <Users className="h-3.5 w-3.5 text-brand-purple" /> Patient Type
            </span>
            <div className="relative mt-1.5">
              <select
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 pr-9 text-xs font-medium text-[#17203A] outline-none transition-colors focus:border-brand sm:text-sm"
              >
                {patientOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>
        </div>

        {/* Row 5: Age & Gender */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <UserCheck className="h-3.5 w-3.5 text-brand" /> Age
            </span>
            <div className="relative mt-1.5">
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 pr-9 text-xs font-medium text-[#17203A] outline-none transition-colors focus:border-brand sm:text-sm"
              >
                {ageOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <User className="h-3.5 w-3.5 text-brand-purple" /> Gender
            </span>
            <div className="relative mt-1.5">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 pr-9 text-xs font-medium text-[#17203A] outline-none transition-colors focus:border-brand sm:text-sm"
              >
                {genderOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>
        </div>

        {/* Row 6: Medical History / Allergies */}
        <div>
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <FileText className="h-3.5 w-3.5 text-brand" /> Medical History / Allergies (Optional)
            </span>
            <div className="mt-1.5 flex items-center rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 transition-colors focus-within:border-brand">
              <input
                type="text"
                placeholder="Any medical conditions or allergies?"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] placeholder:text-muted-foreground/60 outline-none sm:text-sm"
              />
            </div>
          </label>
        </div>

        {/* Row 7: Reason for Visit / Dental Concern */}
        <div>
          <label className="block min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#17203A]">
              <MessageSquare className="h-3.5 w-3.5 text-brand-purple" /> Reason for Visit / Dental
              Concern
            </span>
            <div className="mt-1.5 flex items-start rounded-xl border border-border/80 bg-[#FAFAFC] px-3.5 py-2.5 transition-colors focus-within:border-brand">
              <textarea
                rows={2}
                placeholder="Describe your dental problem or reason for visiting..."
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#17203A] placeholder:text-muted-foreground/60 outline-none resize-none sm:text-sm"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Submit CTA Button */}
      <button
        type="submit"
        className="group mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-gradient-brand py-3.5 px-6 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:opacity-95 hover:shadow-button"
      >
        <span>Find Available Slot</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </form>
  );
}

export function AppointmentSection() {
  return (
    <section id="appointment" className="bg-[#F8F8FC] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[2.5rem] border border-border/60 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-[280px_1fr_340px] xl:grid-cols-[300px_1fr_360px]">
          {/* LEFT SIDE: Heading & Content */}
          <div className="flex flex-col justify-between self-stretch py-2">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#6B35D9] uppercase">
                <span className="h-0.5 w-4 bg-gradient-brand rounded-full"></span>
                APPOINTMENT BOOKING
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-[#17203A] sm:text-4xl">
                Book Your
                <br />
                Appointment
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-[#667085] sm:text-sm">
                Your smile deserves expert care. Choose your preferred date, time and treatment to
                get started.
              </p>

              {/* Trust features row */}
              <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-[#17203A]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#F2EBFF] text-[#6B35D9]">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  Quick
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#F2EBFF] text-[#6B35D9]">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  Easy
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#F2EBFF] text-[#6B35D9]">
                    <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  Secure
                </span>
              </div>

              {/* Need Help Card */}
              <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-purple-100 bg-[#F5F2FE] p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#6B35D9] shadow-xs">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#667085]">Need help?</p>
                  <p className="text-xs font-semibold text-[#17203A]">We&apos;re here for you.</p>
                  <a
                    href="tel:+919876543210"
                    className="mt-0.5 block text-xs font-bold text-[#17203A] hover:text-[#6B35D9]"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Trust Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white px-2.5 py-1 text-[11px] font-medium text-[#667085]">
                <ShieldCheck className="h-3 w-3 text-brand" /> Trusted Care
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white px-2.5 py-1 text-[11px] font-medium text-[#667085]">
                <UserCheck className="h-3 w-3 text-brand-purple" /> Expert Doctors
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white px-2.5 py-1 text-[11px] font-medium text-[#667085]">
                <Sparkles className="h-3 w-3 text-brand-pink" /> Modern Clinic
              </span>
            </div>
          </div>

          {/* CENTER: Form Card */}
          <AppointmentForm />

          {/* RIGHT: Large Girl/Doctor Illustration */}
          <div className="relative flex min-h-[460px] items-end justify-center overflow-visible lg:min-h-[500px]">
            {/* Soft lavender background glow */}
            <div className="absolute bottom-0 right-0 -z-0 h-80 w-80 rounded-full bg-soft-purple/80 blur-3xl" />

            {/* Subtle floating badges matching reference */}
            <div className="absolute left-2 top-8 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-[#6B35D9] shadow-soft backdrop-blur-md">
              <Stethoscope className="h-5 w-5" />
            </div>

            <div className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-[#6B35D9] shadow-soft backdrop-blur-md">
              <Calendar className="h-5 w-5" />
            </div>

            <div className="absolute left-4 bottom-20 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-[#6B35D9] shadow-soft backdrop-blur-md">
              <Shield className="h-5 w-5" />
            </div>

            {/* Doctor Image */}
            <img
              src={assistant}
              alt="SmileCare Dental Specialist holding digital tablet"
              width={768}
              height={1024}
              loading="lazy"
              className="relative z-10 max-h-[480px] w-auto object-contain object-bottom drop-shadow-md sm:max-h-[520px] lg:max-h-[550px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
