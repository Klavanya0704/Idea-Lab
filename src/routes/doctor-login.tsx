import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Users,
  Calendar,
  Activity,
  Star,
  Home,
  MapPin,
  Phone,
} from "lucide-react";
import clinicBg from "@/assets/clinic-background.jpg";
import doctorCutout from "@/assets/doctor-cutout.png";
import { Logo, ToothIcon } from "@/components/site/Logo";
import { loginDoctorWithSupabase } from "@/lib/clinicalService";

export const Route = createFileRoute("/doctor-login")({
  head: () => ({
    meta: [
      { title: "Doctor Login | SmileCare Dental Hospital" },
      {
        name: "description",
        content: "Secure clinical workspace login for SmileCare dental surgeons and staff.",
      },
    ],
  }),
  component: DoctorLoginPage,
});

function DoctorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 4) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const res = await loginDoctorWithSupabase(email, password);

    if (res.success) {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/doctor-dashboard" });
      }, 600);
    } else {
      setLoading(false);
      setError(res.error || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* 1. FULL PAGE BACKGROUND: Blurred Dental Clinic Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={clinicBg}
          alt="Dental Clinic Environment"
          className="w-full h-full object-cover object-center filter blur-[6px] scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,247,255,0.85)_0%,rgba(235,241,255,0.75)_50%,rgba(245,237,254,0.85)_100%)] mix-blend-multiply" />
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-purple-300/20 blur-3xl" />
      </div>

      {/* 2. TOP HEADER */}
      <header className="relative z-20 w-full max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <Logo href="" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-300 pl-3">
            <span className="text-xs text-slate-500 font-medium">Your Smile, Our Commitment</span>
            <div className="h-1 w-6 bg-brand rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand hover:underline transition-colors"
          >
            <Home className="h-4 w-4 text-brand" />
            <span>← Back to Home</span>
          </Link>

          <div className="hidden lg:block text-right">
            <p className="font-signature text-2xl text-brand-purple tracking-wide font-normal leading-tight">
              Healthy
              <br />
              Smiles
              <br />
              Happier Lives ♡
            </p>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER: 61% Left Hero / 39% Right Login */}
      <main className="relative z-10 w-full max-w-[1420px] mx-auto px-4 sm:px-6 my-2 sm:my-4 flex-1 grid lg:grid-cols-[1.55fr_1fr] gap-5 items-stretch">
        {/* 4. LEFT HERO PANEL */}
        <div className="relative rounded-[28px] overflow-hidden border border-white/80 shadow-[0_25px_70px_-15px_rgba(49,85,217,0.25)] p-7 sm:p-10 lg:p-12 text-white flex flex-col justify-between">
          {/* Dental clinic photo inside hero panel under gradient */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src={clinicBg}
              alt="Clinic Background"
              className="w-full h-full object-cover filter blur-[3px] scale-105 opacity-30"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(49,85,217,0.92)_0%,rgba(79,54,221,0.88)_35%,rgba(123,59,219,0.88)_70%,rgba(216,60,207,0.92)_100%)]" />
          </div>

          {/* Ambient Glows inside hero */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl z-0" />
          <div className="pointer-events-none absolute bottom-1/3 right-0 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl z-0" />

          {/* Top Row: Portal Label & Handwritten Script */}
          <div className="relative z-20 flex items-start justify-between">
            <div>
              <span className="inline-block text-[11px] font-bold tracking-[0.25em] text-white/80 uppercase">
                D O C T O R &nbsp; P O R T A L
              </span>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-[3.1rem] font-bold leading-[1.12] text-white tracking-tight">
                Care Beyond
                <br />
                Treatment <span className="font-sans font-normal text-white/90">♡</span>
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-white/85 max-w-xs sm:max-w-sm font-normal leading-relaxed">
                Access your patients, appointments and clinical records through one secure SmileCare
                workspace.
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <p className="font-signature text-2xl sm:text-3xl text-white/95 leading-snug font-normal max-w-[170px] ml-auto drop-shadow-xs rotate-1">
                Great
                <br />
                Dentistry
                <br />
                Builds
                <br />
                Brighter
                <br />
                Futures ♡
              </p>
            </div>
          </div>

          {/* Middle Section: Light Glass Feature Cards & Doctor Image */}
          <div className="relative z-20 my-6 grid sm:grid-cols-2 gap-4 items-end flex-1">
            {/* 8. Light Translucent Feature Cards Stack */}
            <div className="space-y-3 max-w-[310px] z-20">
              <div className="group bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 text-white shadow-sm hover:bg-white/30 transition-all">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Patient Records
                  </h3>
                  <p className="text-[11px] text-white/85 leading-tight mt-0.5">
                    View and manage patient history
                  </p>
                </div>
              </div>

              <div className="group bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 text-white shadow-sm hover:bg-white/30 transition-all">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Appointments
                  </h3>
                  <p className="text-[11px] text-white/85 leading-tight mt-0.5">
                    Stay on top of your schedule
                  </p>
                </div>
              </div>

              <div className="group bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 text-white shadow-sm hover:bg-white/30 transition-all">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Clinical Care
                  </h3>
                  <p className="text-[11px] text-white/85 leading-tight mt-0.5">
                    Deliver better dental care
                  </p>
                </div>
              </div>

              {/* 9. Lower Left Script */}
              <div className="pt-2">
                <p className="font-signature text-2xl sm:text-3xl text-white/90 leading-tight font-normal -rotate-2 drop-shadow-xs max-w-[220px]">
                  Empowering Dentists
                  <br />
                  for Healthier Smiles
                </p>
                <div className="h-0.5 w-16 bg-white/60 rounded-full mt-1" />
              </div>
            </div>

            {/* 5. Doctor Image: True 32-bit RGBA Alpha Transparent PNG Cutout (No white box, no checkerboard) */}
            <div className="relative flex items-end justify-center h-full min-h-[320px]">
              <img
                src={doctorCutout}
                alt="SmileCare Specialist Doctor"
                className="absolute bottom-0 right-0 sm:-right-2 w-full max-w-[340px] sm:max-w-[410px] lg:max-w-[450px] h-auto object-contain object-bottom pointer-events-none z-10 drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]"
              />

              {/* 10. Floating Doctor Badge */}
              <div className="absolute right-2 bottom-12 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md p-3 text-slate-900 shadow-xl max-w-[210px]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm">
                  <ToothIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold leading-tight text-slate-900">
                    “A Healthier Tomorrow, One Smile at a Time.”
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 11. Bottom Hero Stats Bar */}
          <div className="relative z-20 -mx-7 -mb-7 sm:-mx-10 sm:-mb-10 lg:-mx-12 lg:-mb-12 border-t border-white/20 bg-white/15 backdrop-blur-md px-6 py-4 flex items-center justify-around text-white text-xs">
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-white/90 shrink-0" />
              <div>
                <p className="font-bold leading-none text-sm">500+</p>
                <p className="text-[10px] text-white/80 leading-tight mt-0.5">Happy Patients</p>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-white/90 shrink-0" />
              <div>
                <p className="font-bold leading-none text-sm">Trusted</p>
                <p className="text-[10px] text-white/80 leading-tight mt-0.5">Dental Care</p>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-white/90 shrink-0" />
              <div>
                <p className="font-bold leading-none text-sm">Modern</p>
                <p className="text-[10px] text-white/80 leading-tight mt-0.5">Facilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* 12. RIGHT LOGIN PANEL */}
        <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_25px_70px_-15px_rgba(49,85,217,0.18)] p-7 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="max-w-[420px] mx-auto w-full flex-1 flex flex-col justify-center">
            {/* 13. Login Header */}
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-brand-purple uppercase">
                D O C T O R &nbsp; P O R T A L
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Welcome Back,
                <br />
                Doctor
              </h2>
              <div className="h-1 w-12 bg-brand rounded-full mt-2 mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sign in to securely access your SmileCare clinical workspace.
              </p>
            </div>

            {/* Success Notification */}
            {success && (
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Authentication successful! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* 14. Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@smilecare.com"
                    className="w-full rounded-2xl border border-blue-100 bg-slate-50/60 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>
              </div>

              {/* 15. Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-blue-100 bg-slate-50/60 py-3.5 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 16. Remember / Forgot Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/20"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Password reset instructions have been sent to your registered email.")
                  }
                  className="text-xs font-semibold text-brand-purple hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* 17. Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full h-[56px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#3155D9_0%,#6B35D9_50%,#D83CCF_100%)] text-sm sm:text-base font-semibold text-white shadow-[0_10px_25px_-5px_rgba(49,85,217,0.35)] transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-[0.99] disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* 18. OR Divider */}
            <div className="relative my-5 text-center text-xs text-slate-400 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200">
              <span className="relative z-10 bg-white px-3 font-medium text-slate-400">OR</span>
            </div>

            {/* 19. Security Card */}
            <div className="rounded-2xl bg-[#F0F5FF] border border-blue-100 p-3.5 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">Secure clinical access</p>
                <p className="text-[11px] text-slate-500">Authorized SmileCare doctors only.</p>
              </div>
            </div>

            {/* 20. Bottom Slogan */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-brand/30" />
              <p className="text-[11px] font-semibold tracking-[0.22em] text-brand text-center uppercase">
                CARE &nbsp;|&nbsp; COMPASSION &nbsp;|&nbsp; CONFIDENCE
              </p>
              <div className="h-px w-8 bg-brand/30" />
            </div>
          </div>
        </div>
      </main>

      {/* 21. PAGE FOOTER */}
      <footer className="relative z-20 w-full max-w-[1440px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-brand font-medium gap-2 border-t border-blue-200/50 mt-2">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-brand" /> Tadepalligudem
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-brand" /> +91 98765 43210
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-brand" /> support@smilecare.com
          </span>
        </div>

        <p className="text-center sm:text-right text-slate-500">
          © 2026 SmileCare Dental Hospital. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
