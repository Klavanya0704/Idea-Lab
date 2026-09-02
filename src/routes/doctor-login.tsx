import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import doctorImage from "@/assets/assistant.png";
import { Logo } from "@/components/site/Logo";
import { loginDoctorWithSupabase } from "@/lib/clinicalService";

export const Route = createFileRoute("/doctor-login")({
  head: () => ({
    meta: [
      { title: "Doctor Login | SmileCare Dental Portal" },
      {
        name: "description",
        content: "Secure access for SmileCare dental surgeons and clinical staff.",
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

  const handleFillDemo = () => {
    setEmail("doctor@smilecare.com");
    setPassword("smile123");
    setError("");
  };

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
    <div className="flex min-h-screen flex-col bg-[#FAFAFF] font-sans antialiased text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur-md px-5 py-3.5 lg:px-10">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Doctor Portal
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Screen Body */}
      <main className="flex-1 grid lg:grid-cols-[1.1fr_1fr] min-h-[calc(100vh-65px)]">
        {/* LEFT PANEL: Branded Doctor Visual Panel */}
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#3155D9_0%,#4F36DD_40%,#6B35D9_75%,#D83CCF_100%)] p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-between">
          {/* Decorative Ambient Elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-xs backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>DOCTOR PORTAL</span>
            </div>

            <h1 className="mt-6 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl text-white">
              Welcome Back,
              <br />
              Doctor
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
              Access your appointments, patients, treatment records and clinical dashboard securely.
            </p>
          </div>

          {/* Doctor Image & Floating Badges */}
          <div className="relative z-10 mt-8 flex flex-1 items-end justify-center lg:mt-0">
            <div className="relative max-w-[340px] lg:max-w-[400px]">
              <img
                src={doctorImage}
                alt="SmileCare Specialist Doctor"
                className="h-auto max-h-[380px] w-full object-contain drop-shadow-2xl"
              />

              <div className="absolute left-0 top-1/4 flex items-center gap-2.5 rounded-2xl border border-white/30 bg-white/20 px-4 py-2.5 shadow-lg backdrop-blur-md">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/25 text-white">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-white/80">Clinical Access</p>
                  <p className="text-xs font-bold text-white">Verified Surgeon</p>
                </div>
              </div>

              <div className="absolute right-0 bottom-6 flex items-center gap-2 rounded-2xl border border-white/30 bg-white/20 px-3.5 py-2 shadow-lg backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
                <span className="text-xs font-semibold text-white">256 Active Records</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Line */}
          <div className="relative z-10 mt-6 border-t border-white/20 pt-4 flex items-center justify-between text-xs text-white/80">
            <span>SmileCare Hospital Information System v2.4</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Centered Doctor Login Card */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#FAFAFF]">
          <div className="w-full max-w-[460px] rounded-[24px] border border-border/80 bg-white p-8 sm:p-10 shadow-lift">
            <div className="text-left">
              <span className="text-xs font-bold tracking-[0.18em] text-brand-purple uppercase">
                DOCTOR PORTAL
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Doctor Login
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                Sign in to access your SmileCare dashboard.
              </p>
            </div>

            {/* Success Notification */}
            {success && (
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Authentication successful! Signing you in...</span>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@smilecare.com"
                    className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground transition-all duration-200 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-11 text-sm text-foreground transition-all duration-200 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Password reset link has been sent to your registered email.")
                  }
                  className="text-xs font-semibold text-brand-purple hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/70" />
              Secure access for authorized SmileCare doctors only.
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-border bg-slate-50 p-3.5 text-center text-xs">
              <p className="font-semibold text-foreground">Demo Doctor Account</p>
              <div className="mt-1 flex items-center justify-center gap-2 text-muted-foreground">
                <span>
                  Email:{" "}
                  <code className="font-mono font-semibold text-brand">doctor@smilecare.com</code>
                </span>
                <span>•</span>
                <span>
                  Pass: <code className="font-mono font-semibold text-brand">smile123</code>
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="mt-2 text-[11px] font-semibold text-brand-purple hover:underline"
              >
                Auto-fill demo credentials
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
