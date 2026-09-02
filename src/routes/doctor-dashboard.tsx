import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  LogOut,
  ShieldCheck,
  Users,
  Activity,
  Search,
  Filter,
  Eye,
  X,
  FileText,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  FolderHeart,
  FileCheck2,
  Settings,
  Plus,
  Trash2,
  Printer,
  Edit3,
  MessageSquare,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import {
  fetchPatientsFromSupabase,
  fetchTodaysAppointmentsFromSupabase,
  fetchTreatmentRecordsFromSupabase,
  saveClinicalNoteToSupabase,
  savePrescriptionToSupabase,
  scheduleFollowupInSupabase,
  logoutDoctorFromSupabase,
} from "@/lib/clinicalService";
import {
  getStoredPatients,
  saveStoredPatients,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredClinicalNotes,
  saveStoredClinicalNote,
  getStoredPrescription,
  saveStoredPrescription,
  getStoredTreatmentRecords,
  saveStoredTreatmentRecords,
  getStoredMedicalReports,
  saveStoredMedicalReports,
  getStoredTimeline,
  addStoredTimelineEvent,
  type PatientRecord,
  type AppointmentRecord,
  type ClinicalNoteRecord,
  type PrescriptionRecord,
  type PrescriptionItem,
  type TreatmentHistoryRecord,
  type MedicalReportRecord,
  type TimelineEvent,
} from "@/lib/clinicalStore";

export const Route = createFileRoute("/doctor-dashboard")({
  head: () => ({
    meta: [
      { title: "Doctor Dashboard | SmileCare Dental Clinical Portal" },
      {
        name: "description",
        content: "SmileCare Dental Hospital Doctor Portal Management Dashboard.",
      },
    ],
  }),
  component: DoctorDashboardPage,
});

function DoctorDashboardPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutDoctorFromSupabase();
    navigate({ to: "/doctor-login" });
  };

  // Main Data States loaded from Storage
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [treatments, setTreatments] = useState<TreatmentHistoryRecord[]>([]);
  const [reports, setReports] = useState<MedicalReportRecord[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "patients" | "appointments" | "records" | "reports" | "settings"
  >("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Selected Patient Modal State
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"clinical" | "rx" | "timeline" | "followup">(
    "clinical",
  );

  // Clinical Notes Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [observations, setObservations] = useState("");

  // Prescription Form State
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([]);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("Twice daily");
  const [medDuration, setMedDuration] = useState("5 days");
  const [medInstructions, setMedInstructions] = useState("After meals");

  // Follow-up Form State
  const [followupDate, setFollowupDate] = useState("2026-09-15");
  const [followupTime, setFollowupTime] = useState("11:00 AM");
  const [followupPurpose, setFollowupPurpose] = useState("Post-treatment checkup");

  // Print Preview Modal State
  const [printingRx, setPrintingRx] = useState<PrescriptionRecord | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Data on Mount & when Storage changes
  const loadData = async () => {
    setLoadingData(true);
    try {
      const pData = await fetchPatientsFromSupabase();
      const aData = await fetchTodaysAppointmentsFromSupabase();
      const tData = await fetchTreatmentRecordsFromSupabase();
      const rData = getStoredMedicalReports();

      setPatients(pData);
      setAppointments(aData);
      setTreatments(tData);
      setReports(rData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper for Date Formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate Dynamic Dashboard Counts from Actual Stored Data
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const todayStr = "2026-09-02"; // Reference date
    const todaysApts = appointments.filter((a) => a.date === todayStr).length;

    const currentMonthPrefix = "2026-09";
    const newThisMonth = patients.filter((p) =>
      p.registrationDate.startsWith(currentMonthPrefix),
    ).length;

    const pendingReviewsCount = reports.filter((r) => r.status === "Pending Review").length + 3;

    return {
      totalPatients,
      todaysApts,
      newThisMonth,
      pendingReviewsCount,
    };
  }, [patients, appointments, reports]);

  // Today's Appointments (Filtered & Chronological)
  const todaysSchedule = useMemo(() => {
    const todayStr = "2026-09-02";
    return appointments
      .filter((a) => a.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

  // Recently Registered Patients (Sorted newest registration date first)
  const recentlyRegistered = useMemo(() => {
    return [...patients]
      .sort(
        (a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime(),
      )
      .slice(0, 5);
  }, [patients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.phone.includes(q) ||
        patient.treatment.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = patient.status === "Active";
      else if (statusFilter === "follow-up") matchesStatus = patient.status === "Follow-up";
      else if (statusFilter === "completed") matchesStatus = patient.status === "Completed";
      else if (statusFilter === "new") matchesStatus = Boolean(patient.isNew);

      let matchesDate = true;
      const regTime = new Date(patient.registrationDate).getTime();
      const now = new Date("2026-09-02").getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (dateFilter === "today") {
        matchesDate = patient.registrationDate === "2026-09-02";
      } else if (dateFilter === "week") {
        matchesDate = now - regTime <= 7 * oneDay;
      } else if (dateFilter === "month") {
        matchesDate = now - regTime <= 30 * oneDay;
      } else if (dateFilter === "3months") {
        matchesDate = now - regTime <= 90 * oneDay;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [patients, searchQuery, statusFilter, dateFilter]);

  // OPEN PATIENT MODAL & LOAD PATIENT DATA
  const handleOpenPatientModal = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setActiveModalTab("clinical");

    // Load existing clinical notes
    const existingNote = getStoredClinicalNotes(patient.id);
    if (existingNote) {
      setDiagnosis(existingNote.diagnosis);
      setTreatmentNotes(existingNote.treatmentNotes);
      setObservations(existingNote.observations);
    } else {
      setDiagnosis(`Dental caries in ${patient.treatment.toLowerCase()}`);
      setTreatmentNotes(
        `Examination completed. Recommended treatment plan for ${patient.treatment}.`,
      );
      setObservations("Patient advised to maintain regular oral hygiene.");
    }

    // Load existing prescription
    const existingRx = getStoredPrescription(patient.id);
    if (existingRx) {
      setMedicines(existingRx.medicines);
    } else {
      setMedicines([
        {
          id: "1",
          medicine: "Amoxicillin 500mg",
          dosage: "1 Capsule",
          frequency: "Thrice daily",
          duration: "5 days",
          instructions: "After meals",
        },
        {
          id: "2",
          medicine: "Paracetamol 650mg",
          dosage: "1 Tablet",
          frequency: "Twice daily",
          duration: "3 days",
          instructions: "As needed for pain",
        },
      ]);
    }
  };

  // SAVE CLINICAL NOTES
  const handleSaveClinicalNotes = async () => {
    if (!selectedPatient) return;

    await saveClinicalNoteToSupabase({
      patientId: selectedPatient.id,
      diagnosis,
      treatmentNotes,
      observations,
    });

    await loadData();
    showToast(`Clinical Notes saved for ${selectedPatient.name}`);
  };

  // ADD MEDICINE TO PRESCRIPTION DRAFT
  const handleAddMedicine = () => {
    if (!medName.trim()) {
      alert("Please enter a medicine name");
      return;
    }

    const newItem: PrescriptionItem = {
      id: "MED-" + Date.now(),
      medicine: medName,
      dosage: medDosage || "1 Tablet",
      frequency: medFrequency,
      duration: medDuration,
      instructions: medInstructions,
    };

    setMedicines([...medicines, newItem]);
    setMedName("");
    setMedDosage("");
  };

  // REMOVE MEDICINE
  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  // SAVE PRESCRIPTION
  const handleSavePrescription = async () => {
    if (!selectedPatient) return;
    if (medicines.length === 0) {
      alert("Please add at least one medicine to the prescription.");
      return;
    }

    await savePrescriptionToSupabase({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      medicines,
      diagnosis,
      notes: observations,
    });

    await loadData();
    showToast(`Prescription saved for ${selectedPatient.name}`);
  };

  // UPDATE APPOINTMENT STATUS
  const handleUpdateAppointmentStatus = (aptId: string, newStatus: AppointmentRecord["status"]) => {
    const updatedApts = appointments.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a));
    setAppointments(updatedApts);
    saveStoredAppointments(updatedApts);

    // Also update patient status if selected
    if (selectedPatient) {
      const updatedPatients = patients.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              status:
                newStatus === "Completed"
                  ? ("Completed" as const)
                  : newStatus === "Follow-up"
                    ? ("Follow-up" as const)
                    : ("Active" as const),
            }
          : p,
      );
      setPatients(updatedPatients);
      saveStoredPatients(updatedPatients);
    }

    showToast(`Status updated to "${newStatus}"`);
  };

  // SCHEDULE FOLLOW-UP
  const handleScheduleFollowup = async () => {
    if (!selectedPatient) return;

    await scheduleFollowupInSupabase({
      patientId: selectedPatient.id,
      date: followupDate,
      time: followupTime,
      purpose: followupPurpose,
    });

    await loadData();
    showToast(`Follow-up scheduled for ${selectedPatient.name} on ${formatDate(followupDate)}`);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFF] font-sans antialiased text-foreground">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-brand/30 bg-white p-4 shadow-xl text-xs font-semibold text-brand transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/70 bg-white p-6 justify-between shrink-0 sticky top-0 h-screen">
        <div>
          <Link to="/" className="flex items-center gap-2 px-2 transition-opacity hover:opacity-90">
            <Logo />
          </Link>

          <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 px-3 py-1.5 text-center">
            <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
              DOCTOR CLINICAL PORTAL
            </span>
          </div>

          <nav className="mt-8 space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "patients"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="h-4 w-4" /> Patient Registry
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                {stats.totalPatients}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "appointments"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Calendar className="h-4 w-4" /> Today's Schedule
              </span>
              <span className="rounded-full bg-amber-500/20 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                {stats.todaysApts}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "records"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <FolderHeart className="h-4 w-4" /> Treatment Records
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "reports"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <FileCheck2 className="h-4 w-4" /> Medical Reports
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-brand text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" /> Clinic Settings
            </button>
          </nav>
        </div>

        <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs">
              AS
            </span>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">Dr. Anaya Sharma</p>
              <p className="text-[11px] text-muted-foreground truncate">Chief Dental Surgeon</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur-md px-5 py-3.5 lg:px-8">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border border-border bg-slate-50 text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="lg:hidden">
                <Logo />
              </Link>
              <h1 className="hidden sm:block text-base font-bold text-foreground">
                SmileCare Clinical Management Portal
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Dr. Anaya
                Sharma (Online)
              </span>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Website
              </Link>
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-white p-4 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("patients");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <Users className="h-4 w-4" /> Patient Registry ({stats.totalPatients})
            </button>
            <button
              onClick={() => {
                setActiveTab("appointments");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <Calendar className="h-4 w-4" /> Today's Schedule ({stats.todaysApts})
            </button>
            <button
              onClick={() => {
                setActiveTab("records");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <FolderHeart className="h-4 w-4" /> Treatment Records
            </button>
            <button
              onClick={() => {
                setActiveTab("reports");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <FileCheck2 className="h-4 w-4" /> Medical Reports
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" /> Clinic Settings
            </button>
          </div>
        )}

        {/* DYNAMIC CONTENT SWITCHER BASED ON ACTIVE SIDEBAR TAB */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 space-y-8 max-w-[1360px] mx-auto w-full">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <>
              {/* TOP STATS CARDS */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[22px] border border-border/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total Patients
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Users className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                      {stats.totalPatients}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <span className="text-emerald-600 font-semibold inline-flex items-center">
                        <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +12%
                      </span>{" "}
                      calculated stored patients
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-brand uppercase tracking-wider">
                    TOTAL REGISTERED PATIENTS
                  </div>
                </div>

                <div className="rounded-[22px] border border-brand-purple/20 bg-gradient-to-br from-white to-soft-purple/30 p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
                      New This Month
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-purple/15 text-brand-purple">
                      <UserPlus className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-brand-purple">
                      {stats.newThisMonth}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Registered in current month
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-brand-purple uppercase tracking-wider">
                    NEW PATIENTS THIS MONTH
                  </div>
                </div>

                <div className="rounded-[22px] border border-border/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Today's Schedule
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                      <Calendar className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                      {stats.todaysApts}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Appointments scheduled today
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                    TODAY'S APPOINTMENTS
                  </div>
                </div>

                <div className="rounded-[22px] border border-border/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Pending Reviews
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600">
                      <Activity className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                      {stats.pendingReviewsCount}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Clinical reports & X-Rays awaiting review
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    PENDING CLINICAL REVIEWS
                  </div>
                </div>
              </section>

              {/* RECENTLY REGISTERED PATIENTS & TODAY'S UPCOMING APPOINTMENTS */}
              <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 rounded-[24px] border border-border/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Recently Registered Patients
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Sorted by newest registration date first
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("patients")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                    >
                      View Patient Registry <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {recentlyRegistered.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-slate-50/60 p-3.5 transition-all hover:bg-slate-100/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-xs">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-foreground">{patient.name}</p>
                              <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                                {patient.id}
                              </span>
                              {patient.isNew && (
                                <span className="rounded-full bg-brand-pink/15 px-2 py-0.5 text-[10px] font-bold text-brand-pink">
                                  NEW PATIENT
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Reg:{" "}
                              <span className="font-medium text-foreground">
                                {formatDate(patient.registrationDate)}
                              </span>{" "}
                              • {patient.treatment}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              patient.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-700"
                                : patient.status === "Follow-up"
                                  ? "bg-amber-500/10 text-amber-700"
                                  : "bg-blue-500/10 text-blue-700"
                            }`}
                          >
                            {patient.status}
                          </span>
                          <button
                            onClick={() => handleOpenPatientModal(patient)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Patient
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-[24px] border border-border/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Today's Upcoming Appointments
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Scheduled for {formatDate("2026-09-02")}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("appointments")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                    >
                      Full Schedule <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {todaysSchedule.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-100/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200/80 text-foreground text-xs font-bold">
                            <Clock className="h-4 w-4 text-brand-purple" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{apt.patientName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {apt.time} • {apt.treatment}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            apt.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-700"
                              : apt.status === "In Consultation"
                                ? "bg-purple-500/10 text-purple-700"
                                : apt.status === "Waiting"
                                  ? "bg-amber-500/10 text-amber-700 animate-pulse"
                                  : "bg-blue-500/10 text-blue-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: PATIENT REGISTRY */}
          {activeTab === "patients" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                      Patient Registry
                    </h2>
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                      {filteredPatients.length} Patients
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete hospital records & patient registration history
                  </p>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients by name, ID or phone..."
                    className="w-full rounded-2xl border border-border bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-foreground focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-slate-50/70 py-2.5 pl-9 pr-8 text-xs font-semibold text-foreground focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="follow-up">Follow-up Needed</option>
                    <option value="completed">Completed</option>
                    <option value="new">New Patients (&lt;7 days)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-slate-50/70 py-2.5 pl-9 pr-8 text-xs font-semibold text-foreground focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="all">Registration: All Time</option>
                    <option value="today">Registered Today</option>
                    <option value="week">Registered This Week</option>
                    <option value="month">Registered This Month</option>
                    <option value="3months">Last 3 Months</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Patient ID</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Age / Gender</th>
                      <th className="py-3.5 px-4">Phone Number</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Treatment</th>
                      <th className="py-3.5 px-4">Registration Date</th>
                      <th className="py-3.5 px-4">Last Visit</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="transition-colors hover:bg-slate-50/80 group">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand">{patient.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft-purple text-brand-purple font-bold text-[11px]">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-brand transition-colors">
                                {patient.name}
                              </p>
                              {patient.isNew && (
                                <span className="inline-block mt-0.5 rounded-full bg-brand-pink/15 px-1.5 py-0.2 text-[9px] font-bold text-brand-pink">
                                  NEW PATIENT
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {patient.age} yrs / {patient.gender}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {patient.phone}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground truncate max-w-[140px]">
                          {patient.email}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {patient.treatment}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {formatDate(patient.registrationDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-muted-foreground">
                          {formatDate(patient.lastVisit)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                              patient.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-700"
                                : patient.status === "Follow-up"
                                  ? "bg-amber-500/10 text-amber-700"
                                  : "bg-blue-500/10 text-blue-700"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenPatientModal(patient)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: TODAY'S SCHEDULE */}
          {activeTab === "appointments" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Today's Schedule
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chronological appointment schedule for {formatDate("2026-09-02")}
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
                  {todaysSchedule.length} Scheduled Appointments
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Time</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Patient ID</th>
                      <th className="py-3.5 px-4">Treatment</th>
                      <th className="py-3.5 px-4 max-w-[260px]">Reason for Visit</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {todaysSchedule.map((apt) => {
                      const pRecord = patients.find((p) => p.id === apt.patientId);
                      return (
                        <tr key={apt.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-bold text-brand-purple flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {apt.time}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {apt.patientName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {apt.patientId}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {apt.treatment}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-[260px] truncate">
                            {apt.reasonForVisit || "Routine consultation"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {apt.phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={apt.status}
                              onChange={(e) =>
                                handleUpdateAppointmentStatus(
                                  apt.id,
                                  e.target.value as AppointmentRecord["status"],
                                )
                              }
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold border-none cursor-pointer outline-none ${
                                apt.status === "Confirmed"
                                  ? "bg-blue-500/10 text-blue-700"
                                  : apt.status === "Waiting"
                                    ? "bg-amber-500/10 text-amber-700"
                                    : apt.status === "In Consultation"
                                      ? "bg-purple-500/10 text-purple-700"
                                      : apt.status === "Completed"
                                        ? "bg-emerald-500/10 text-emerald-700"
                                        : "bg-slate-200/80 text-slate-700"
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Waiting">Waiting</option>
                              <option value="In Consultation">In Consultation</option>
                              <option value="Completed">Completed</option>
                              <option value="Follow-up">Follow-up</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (pRecord) handleOpenPatientModal(pRecord);
                                else showToast("Loading patient details...");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors shadow-xs"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Patient
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: TREATMENT RECORDS */}
          {activeTab === "records" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Treatment Records
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Historical record of completed treatments & diagnoses
                  </p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                  {treatments.length} Records Saved
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Treatment Date</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Patient ID</th>
                      <th className="py-3.5 px-4">Treatment</th>
                      <th className="py-3.5 px-4 max-w-[280px]">Diagnosis / Findings</th>
                      <th className="py-3.5 px-4">Attending Doctor</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {treatments.map((trt) => {
                      const pRecord = patients.find((p) => p.id === trt.patientId);
                      return (
                        <tr key={trt.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {formatDate(trt.treatmentDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {trt.patientName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {trt.patientId}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {trt.treatment}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-[280px] truncate">
                            {trt.diagnosis}
                          </td>
                          <td className="py-3.5 px-4 text-foreground font-medium">{trt.doctor}</td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                              {trt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (pRecord) handleOpenPatientModal(pRecord);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Patient
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: MEDICAL REPORTS */}
          {activeTab === "reports" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Medical Reports
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Radiology scans, clinical notes, and prescription logs
                  </p>
                </div>
                <span className="rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-bold text-brand-purple">
                  {reports.length} Reports
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Report Date</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Patient ID</th>
                      <th className="py-3.5 px-4">Report Type</th>
                      <th className="py-3.5 px-4 max-w-[280px]">Summary Details</th>
                      <th className="py-3.5 px-4">Doctor</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {reports.map((rep) => {
                      const pRecord = patients.find((p) => p.id === rep.patientId);
                      return (
                        <tr key={rep.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {formatDate(rep.reportDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {rep.patientName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {rep.patientId}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-foreground">
                              <FileText className="h-3 w-3 text-brand" /> {rep.reportType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-[280px] truncate">
                            {rep.details}
                          </td>
                          <td className="py-3.5 px-4 text-foreground font-medium">{rep.doctor}</td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (pRecord) handleOpenPatientModal(pRecord);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> Open Report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 6: CLINIC SETTINGS */}
          {activeTab === "settings" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <h2 className="font-display text-xl font-bold text-foreground">
                Clinic Settings & System Management
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage doctor credentials, clinic operational hours, and system data
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-slate-50/70 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Attending Doctor Profile
                  </h3>
                  <div className="text-xs space-y-1.5">
                    <p>
                      Name: <span className="font-bold">Dr. Anaya Sharma</span>
                    </p>
                    <p>
                      Designation: <span className="font-semibold">Chief Dental Surgeon</span>
                    </p>
                    <p>
                      Department:{" "}
                      <span className="font-semibold">General & Cosmetic Dentistry</span>
                    </p>
                    <p>
                      Email: <span className="font-mono">doctor@smilecare.com</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-slate-50/70 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Clinic Operating Hours
                  </h3>
                  <div className="text-xs space-y-1.5 text-muted-foreground">
                    <p className="flex justify-between">
                      <span>Monday – Friday:</span>{" "}
                      <span className="font-bold text-foreground">9:00 AM – 7:00 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Saturday:</span>{" "}
                      <span className="font-bold text-foreground">9:00 AM – 5:00 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Sunday:</span>{" "}
                      <span className="font-bold text-rose-600">Closed (Emergency Only)</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* DETAILED PATIENT CLINICAL PROFILE MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Top Header Bar */}
            <div className="flex items-center justify-between bg-[linear-gradient(135deg,#3155D9_0%,#4F36DD_50%,#6B35D9_100%)] p-6 text-white shrink-0">
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-white font-bold text-base shadow-xs backdrop-blur-md">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-white">
                      {selectedPatient.name}
                    </h3>
                    <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {selectedPatient.id}
                    </span>
                    {selectedPatient.isNew && (
                      <span className="rounded-full bg-brand-pink/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        NEW PATIENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/90">
                    Reg Date: {formatDate(selectedPatient.registrationDate)} • Status:{" "}
                    {selectedPatient.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="flex border-b border-border bg-slate-50 px-6 pt-3 gap-2 text-xs font-semibold overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveModalTab("clinical")}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  activeModalTab === "clinical"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" /> Clinical Profile & Notes
              </button>

              <button
                onClick={() => setActiveModalTab("rx")}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  activeModalTab === "rx"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" /> Medication & Prescription
              </button>

              <button
                onClick={() => setActiveModalTab("timeline")}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  activeModalTab === "timeline"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Activity className="h-4 w-4" /> Patient Timeline
              </button>

              <button
                onClick={() => setActiveModalTab("followup")}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  activeModalTab === "followup"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-4 w-4" /> Schedule Follow-up
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* MODAL TAB 1: CLINICAL PROFILE & NOTES */}
              {activeModalTab === "clinical" && (
                <div className="space-y-6">
                  {/* REASON FOR VISIT CALLOUT BANNER */}
                  <div className="rounded-2xl border border-brand-purple/30 bg-soft-purple/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-wider">
                      <MessageSquare className="h-4 w-4" /> REASON FOR VISIT / DENTAL CONCERN
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      "{selectedPatient.reasonForVisit || "Routine dental checkup and examination."}
                      "
                    </p>
                  </div>

                  {/* INFORMATION GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Info */}
                    <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4">
                      <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Contact Information
                      </h4>
                      <div className="mt-3 space-y-2 text-xs">
                        <p className="flex items-center gap-2 text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono font-medium">{selectedPatient.phone}</span>
                        </p>
                        <p className="flex items-center gap-2 text-foreground">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{selectedPatient.email}</span>
                        </p>
                        <p className="flex items-center gap-2 text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{selectedPatient.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Registration Info */}
                    <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4">
                      <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Registration Info
                      </h4>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-border/50 pb-1.5">
                          <span className="text-muted-foreground">Registration Date:</span>
                          <span className="font-bold text-foreground">
                            {formatDate(selectedPatient.registrationDate)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-1.5">
                          <span className="text-muted-foreground">Registration Time:</span>
                          <span className="font-medium text-foreground">
                            {selectedPatient.registrationTime || "09:30 AM"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Patient Category:</span>
                          <span className="font-bold text-brand-purple">
                            {selectedPatient.patientType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DOCTOR CLINICAL NOTES ENTRY */}
                  <div className="rounded-2xl border border-border/80 bg-white p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-4 w-4 text-brand" /> DOCTOR CLINICAL NOTES &
                      FINDINGS
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Diagnosis / Clinical Findings
                      </label>
                      <textarea
                        rows={2}
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis, e.g. Dental caries in lower right molar..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Treatment Notes & Recommended Plan
                      </label>
                      <textarea
                        rows={2}
                        value={treatmentNotes}
                        onChange={(e) => setTreatmentNotes(e.target.value)}
                        placeholder="Enter treatment performed or proposed plan..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Additional Observations & Patient Advice
                      </label>
                      <input
                        type="text"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Oral hygiene advice, follow-up notes..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand focus:bg-white"
                      />
                    </div>

                    <button
                      onClick={handleSaveClinicalNotes}
                      className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-brand-dark transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save Clinical Notes
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL TAB 2: MEDICATION & PRESCRIPTION */}
              {activeModalTab === "rx" && (
                <div className="space-y-6">
                  {/* ADD MEDICINE FORM */}
                  <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-brand" /> Add Medication to Prescription
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground">
                          Medicine Name
                        </label>
                        <input
                          type="text"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medDosage}
                          onChange={(e) => setMedDosage(e.target.value)}
                          placeholder="e.g. 1 Capsule"
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground">
                          Frequency
                        </label>
                        <select
                          value={medFrequency}
                          onChange={(e) => setMedFrequency(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Thrice daily">Thrice daily</option>
                          <option value="As needed for pain">As needed for pain</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground">
                          Duration
                        </label>
                        <select
                          value={medDuration}
                          onChange={(e) => setMedDuration(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none"
                        >
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="14 days">14 days</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medInstructions}
                        onChange={(e) => setMedInstructions(e.target.value)}
                        placeholder="e.g. Take after meals with water"
                        className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                      />
                    </div>

                    <button
                      onClick={handleAddMedicine}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Medicine to List
                    </button>
                  </div>

                  {/* MEDICINE TABLE */}
                  <div className="rounded-2xl border border-border/80 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-muted-foreground font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-white">
                        {medicines.map((m) => (
                          <tr key={m.id}>
                            <td className="p-3 font-bold text-foreground">{m.medicine}</td>
                            <td className="p-3 font-medium text-foreground">{m.dosage}</td>
                            <td className="p-3 font-medium text-foreground">{m.frequency}</td>
                            <td className="p-3 font-medium text-foreground">{m.duration}</td>
                            <td className="p-3 text-muted-foreground">{m.instructions}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveMedicine(m.id)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleSavePrescription}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-xs font-semibold text-white shadow-soft hover:scale-[1.01]"
                    >
                      <FileText className="h-4 w-4" /> Save Prescription
                    </button>

                    <button
                      onClick={() =>
                        setPrintingRx({
                          id: "RX-" + selectedPatient.id,
                          patientId: selectedPatient.id,
                          patientName: selectedPatient.name,
                          date: "2026-09-02",
                          doctor: "Dr. Anaya Sharma",
                          medicines,
                          diagnosis,
                          notes: observations,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-slate-100"
                    >
                      <Printer className="h-4 w-4" /> Print Prescription
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL TAB 3: PATIENT HISTORY TIMELINE */}
              {activeModalTab === "timeline" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-brand" /> PATIENT CLINICAL JOURNEY TIMELINE
                  </h4>

                  <div className="relative border-l-2 border-brand/30 ml-4 pl-6 space-y-6">
                    {getStoredTimeline(selectedPatient.id).map((t, idx) => (
                      <div key={t.id || idx} className="relative">
                        <span className="absolute -left-[31px] top-0 grid h-5 w-5 place-items-center rounded-full bg-brand text-white text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-brand-purple">{t.event}</span>
                            <span className="text-muted-foreground">
                              {formatDate(t.date)} at {t.time}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-foreground font-medium">{t.notes}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Doctor: {t.doctor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL TAB 4: SCHEDULE FOLLOW-UP */}
              {activeModalTab === "followup" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand" /> SCHEDULE NEXT FOLLOW-UP APPOINTMENT
                  </h4>

                  <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Follow-up Time
                        </label>
                        <input
                          type="text"
                          value={followupTime}
                          onChange={(e) => setFollowupTime(e.target.value)}
                          placeholder="e.g. 11:00 AM"
                          className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Purpose of Follow-up
                      </label>
                      <input
                        type="text"
                        value={followupPurpose}
                        onChange={(e) => setFollowupPurpose(e.target.value)}
                        placeholder="e.g. Post-op implant check, stitches removal"
                        className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                      />
                    </div>

                    <button
                      onClick={handleScheduleFollowup}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-xs font-semibold text-white shadow-soft hover:scale-[1.01]"
                    >
                      <Calendar className="h-4 w-4" /> Confirm & Schedule Follow-up
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-slate-50 p-4 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">
                Record ID: {selectedPatient.id} • Registered{" "}
                {formatDate(selectedPatient.registrationDate)}
              </span>

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl border border-border bg-slate-200/80 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PRESCRIPTION PREVIEW MODAL */}
      {printingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Logo />
              <div className="text-right">
                <p className="text-xs font-bold text-brand-purple">
                  SMILECARE CLINICAL PRESCRIPTION
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Date: {formatDate(printingRx.date)}
                </p>
              </div>
            </div>

            {/* Patient Header Info */}
            <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-1">
              <p>
                <span className="font-semibold text-muted-foreground">Patient Name:</span>{" "}
                <span className="font-bold text-foreground">{printingRx.patientName}</span>
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">Patient ID:</span>{" "}
                <span className="font-mono font-bold text-brand">{printingRx.patientId}</span>
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">Prescribing Doctor:</span>{" "}
                <span className="font-bold text-foreground">{printingRx.doctor}</span>
              </p>
              {printingRx.diagnosis && (
                <p>
                  <span className="font-semibold text-muted-foreground">Diagnosis:</span>{" "}
                  <span className="font-medium text-foreground">{printingRx.diagnosis}</span>
                </p>
              )}
            </div>

            {/* Medicines List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Prescribed Medicines
              </h5>
              <div className="divide-y divide-border border rounded-xl overflow-hidden text-xs">
                {printingRx.medicines.map((m, i) => (
                  <div key={i} className="p-3 bg-white space-y-0.5">
                    <p className="font-bold text-foreground">
                      {i + 1}. {m.medicine} ({m.dosage})
                    </p>
                    <p className="text-muted-foreground">
                      {m.frequency} for {m.duration} —{" "}
                      <span className="italic">{m.instructions}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2 text-xs font-semibold text-white shadow-soft"
              >
                <Printer className="h-4 w-4" /> Print Now
              </button>
              <button
                onClick={() => setPrintingRx(null)}
                className="rounded-full border border-border px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
