import { useState, useMemo, useEffect, useRef } from "react";
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
  Edit3,
  MessageSquare,
  Menu,
  History,
  Check,
  Printer,
  Loader2,
  Upload,
  Download,
  ExternalLink,
  FileUp,
  Bell,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import clinicBg from "@/assets/clinic-background.jpg";
import doctorCutout from "@/assets/doctor-cutout.png";
import { Logo, ToothIcon } from "@/components/site/Logo";
import {
  fetchPatientsFromSupabase,
  fetchTodaysAppointmentsFromSupabase,
  fetchTreatmentRecordsFromSupabase,
  saveClinicalNoteToSupabase,
  savePrescriptionToSupabase,
  scheduleFollowupInSupabase,
  logoutDoctorFromSupabase,
  fetchClinicalNotesFromSupabase,
  saveTreatmentRecordToSupabase,
  fetchPrescriptionHistoryFromSupabase,
  fetchFollowupsFromSupabase,
  fetchAppointmentHistoryFromSupabase,
  fetchMedicalReportsFromSupabase,
  uploadMedicalReportToSupabase,
  getSignedUrlForMedicalReport,
  deleteMedicalReportFromSupabase,
  fetchPatientTimelineFromSupabase,
  updateAppointmentStatusInSupabase,
  type DetailedMedicalReport,
} from "@/lib/clinicalService";
import {
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

  // Main Data States
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [treatments, setTreatments] = useState<TreatmentHistoryRecord[]>([]);
  const [reports, setReports] = useState<DetailedMedicalReport[]>([]);
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
  const [activeModalTab, setActiveModalTab] = useState<
    "overview" | "clinical" | "treatment" | "rx" | "apts" | "reports" | "followup" | "timeline"
  >("overview");

  // Patient Detail Collections
  const [patientNotesList, setPatientNotesList] = useState<ClinicalNoteRecord[]>([]);
  const [patientTreatmentsList, setPatientTreatmentsList] = useState<TreatmentHistoryRecord[]>([]);
  const [patientRxList, setPatientRxList] = useState<PrescriptionRecord[]>([]);
  const [patientAptsList, setPatientAptsList] = useState<AppointmentRecord[]>([]);
  const [patientReportsList, setPatientReportsList] = useState<DetailedMedicalReport[]>([]);
  const [patientFollowupsList, setPatientFollowupsList] = useState<Record<string, unknown>[]>([]);
  const [patientTimelineList, setPatientTimelineList] = useState<TimelineEvent[]>([]);

  // Form Loading States
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);
  const [isSavingRx, setIsSavingRx] = useState(false);
  const [isSchedulingFollowup, setIsSchedulingFollowup] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  // Clinical Notes Form
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Treatment Entry Form
  const [trtName, setTrtName] = useState("");
  const [trtDiagnosis, setTrtDiagnosis] = useState("");
  const [trtDate, setTrtDate] = useState("2026-09-02");
  const [trtStatus, setTrtStatus] = useState("Completed");
  const [trtNotes, setTrtNotes] = useState("");

  // Prescription Form
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([]);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("Twice daily");
  const [medDuration, setMedDuration] = useState("5 days");
  const [medInstructions, setMedInstructions] = useState("After meals");

  // Follow-up Form
  const [followupDate, setFollowupDate] = useState("2026-09-15");
  const [followupTime, setFollowupTime] = useState("11:00 AM");
  const [followupPurpose, setFollowupPurpose] = useState("Post-treatment checkup");

  // Report Upload Form
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<MedicalReportRecord["reportType"]>("Dental X-Ray");
  const [reportDate, setReportDate] = useState("2026-09-02");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Report Preview Modal State
  const [viewingReport, setViewingReport] = useState<{
    report: DetailedMedicalReport;
    signedUrl: string | null;
  } | null>(null);

  // Print Preview State
  const [printingRx, setPrintingRx] = useState<PrescriptionRecord | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Main Dashboard Data on Mount
  const loadData = async () => {
    setLoadingData(true);
    try {
      const [pData, aData, tData, rData] = await Promise.all([
        fetchPatientsFromSupabase(),
        fetchTodaysAppointmentsFromSupabase(),
        fetchTreatmentRecordsFromSupabase(),
        fetchMedicalReportsFromSupabase(),
      ]);

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

  // Dashboard Visual Hierarchy Counts
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const todayStr = "2026-09-02";
    const todaysApts = appointments.filter((a) => a.date === todayStr);

    const waitingCount = todaysApts.filter((a) => a.status === "Waiting").length;
    const inConsultationCount = todaysApts.filter((a) => a.status === "In Consultation").length;
    const completedTodayCount = todaysApts.filter((a) => a.status === "Completed").length;
    const upcomingFollowupsCount = appointments.filter((a) => a.status === "Follow-up").length + 2;

    return {
      totalPatients,
      todaysAptsCount: todaysApts.length,
      waitingCount,
      inConsultationCount,
      completedTodayCount,
      upcomingFollowupsCount,
    };
  }, [patients, appointments]);

  // Today's Appointments
  const todaysSchedule = useMemo(() => {
    const todayStr = "2026-09-02";
    return appointments
      .filter((a) => a.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

  // Recently Registered Patients
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

  // OPEN PATIENT CLINICAL PROFILE MODAL & LOAD ALL SUPABASE COLLECTIONS
  const handleOpenPatientModal = async (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setActiveModalTab("overview");

    const [cNotes, tRecs, rxRecs, aptRecs, repRecs, fUps, tLine] = await Promise.all([
      fetchClinicalNotesFromSupabase(patient.id),
      fetchTreatmentRecordsFromSupabase(patient.id),
      fetchPrescriptionHistoryFromSupabase(patient.id),
      fetchAppointmentHistoryFromSupabase(patient.id),
      fetchMedicalReportsFromSupabase(patient.id),
      fetchFollowupsFromSupabase(patient.id),
      fetchPatientTimelineFromSupabase(patient.id),
    ]);

    setPatientNotesList(cNotes);
    setPatientTreatmentsList(tRecs);
    setPatientRxList(rxRecs);
    setPatientAptsList(aptRecs);
    setPatientReportsList(repRecs);
    setPatientFollowupsList(fUps);
    setPatientTimelineList(tLine);

    if (cNotes.length > 0) {
      setDiagnosis(cNotes[0].diagnosis);
      setTreatmentNotes(cNotes[0].treatmentNotes);
      setObservations(cNotes[0].observations);
      setIsEditingNote(false);
    } else {
      setDiagnosis(`Dental caries in ${patient.treatment.toLowerCase()}`);
      setTreatmentNotes(
        `Examination completed. Recommended treatment plan for ${patient.treatment}.`,
      );
      setObservations("Patient advised to maintain regular oral hygiene.");
      setIsEditingNote(true);
    }

    if (rxRecs.length > 0 && rxRecs[0].medicines.length > 0) {
      setMedicines(rxRecs[0].medicines);
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
    setIsSavingNote(true);

    try {
      await saveClinicalNoteToSupabase({
        patientId: selectedPatient.id,
        diagnosis,
        treatmentNotes,
        observations,
      });

      const updatedNotes = await fetchClinicalNotesFromSupabase(selectedPatient.id);
      setPatientNotesList(updatedNotes);
      setIsEditingNote(false);
      showToast(`Clinical Note saved successfully for ${selectedPatient.name}`);
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // SAVE NEW TREATMENT RECORD
  const handleSaveTreatment = async () => {
    if (!selectedPatient) return;
    if (!trtName.trim()) {
      alert("Please enter a treatment name");
      return;
    }
    setIsSavingTreatment(true);

    try {
      await saveTreatmentRecordToSupabase({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        treatment: trtName,
        diagnosis: trtDiagnosis || diagnosis || "General Consultation",
        treatmentDate: trtDate,
        status: trtStatus,
        notes: trtNotes,
      });

      const updatedTrts = await fetchTreatmentRecordsFromSupabase(selectedPatient.id);
      setPatientTreatmentsList(updatedTrts);
      setTrtName("");
      setTrtNotes("");
      showToast(`Treatment record saved successfully for ${selectedPatient.name}`);
    } catch (err) {
      console.error("Save treatment error:", err);
    } finally {
      setIsSavingTreatment(false);
    }
  };

  // ADD MEDICINE TO DRAFT PRESCRIPTION
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
    setIsSavingRx(true);

    try {
      await savePrescriptionToSupabase({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        medicines,
        diagnosis,
        notes: observations,
      });

      const updatedRx = await fetchPrescriptionHistoryFromSupabase(selectedPatient.id);
      setPatientRxList(updatedRx);
      showToast(`Prescription saved successfully for ${selectedPatient.name}`);
    } catch (err) {
      console.error("Save prescription error:", err);
    } finally {
      setIsSavingRx(false);
    }
  };

  // UPDATE APPOINTMENT STATUS WORKFLOW
  const handleUpdateAppointmentStatus = async (
    aptId: string,
    newStatus: AppointmentRecord["status"],
  ) => {
    await updateAppointmentStatusInSupabase(aptId, newStatus);

    const updatedApts = appointments.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a));
    setAppointments(updatedApts);

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
    }

    showToast(`Status updated to "${newStatus}"`);
  };

  // SCHEDULE FOLLOW-UP
  const handleScheduleFollowup = async () => {
    if (!selectedPatient) return;
    setIsSchedulingFollowup(true);

    try {
      await scheduleFollowupInSupabase({
        patientId: selectedPatient.id,
        date: followupDate,
        time: followupTime,
        purpose: followupPurpose,
      });

      const updatedFups = await fetchFollowupsFromSupabase(selectedPatient.id);
      setPatientFollowupsList(updatedFups);
      showToast(`Follow-up scheduled successfully for ${selectedPatient.name}`);
    } catch (err) {
      console.error("Schedule followup error:", err);
    } finally {
      setIsSchedulingFollowup(false);
    }
  };

  // UPLOAD MEDICAL REPORT TO SUPABASE STORAGE
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!reportTitle.trim()) {
      alert("Please enter a report title.");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file to upload (PDF, JPG, JPEG, PNG).");
      return;
    }

    setIsUploadingReport(true);

    try {
      const res = await uploadMedicalReportToSupabase({
        patientCode: selectedPatient.id,
        file: selectedFile,
        reportTitle,
        reportType,
        reportDate,
        description: reportDescription || reportTitle,
      });

      if (res.success) {
        showToast(res.message);
        setReportTitle("");
        setReportDescription("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        const [updatedReps, updatedTline, updatedAllReps] = await Promise.all([
          fetchMedicalReportsFromSupabase(selectedPatient.id),
          fetchPatientTimelineFromSupabase(selectedPatient.id),
          fetchMedicalReportsFromSupabase(),
        ]);

        setPatientReportsList(updatedReps);
        setPatientTimelineList(updatedTline);
        setReports(updatedAllReps);
      } else {
        alert(res.message);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert("Unable to upload medical report: " + errorObj.message);
    } finally {
      setIsUploadingReport(false);
    }
  };

  // VIEW MEDICAL REPORT (SIGNED URL PREVIEW)
  const handleViewReport = async (rep: DetailedMedicalReport) => {
    let signedUrl: string | null = null;

    if (rep.filePath) {
      signedUrl = await getSignedUrlForMedicalReport(rep.filePath);
    }

    setViewingReport({
      report: rep,
      signedUrl,
    });
  };

  // DOWNLOAD MEDICAL REPORT SECURELY
  const handleDownloadReport = async (rep: DetailedMedicalReport) => {
    let downloadUrl: string | null = null;

    if (rep.filePath) {
      downloadUrl = await getSignedUrlForMedicalReport(rep.filePath);
    }

    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.download = rep.fileName || `${rep.reportTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloading report: ${rep.reportTitle}`);
    } else {
      alert(`Report file notice: ${rep.details}`);
    }
  };

  // DELETE MEDICAL REPORT
  const handleDeleteReport = async (rep: DetailedMedicalReport) => {
    if (!confirm(`Are you sure you want to delete "${rep.details || rep.reportType}"?`)) {
      return;
    }

    const res = await deleteMedicalReportFromSupabase(rep.id, rep.filePath);

    if (res.success) {
      showToast("Report deleted successfully.");
      if (selectedPatient) {
        const updatedReps = await fetchMedicalReportsFromSupabase(selectedPatient.id);
        setPatientReportsList(updatedReps);
      }
      const updatedAllReps = await fetchMedicalReportsFromSupabase();
      setReports(updatedAllReps);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#f4f7ff_0%,#edf2ff_40%,#f8fbff_100%)] font-sans antialiased text-slate-800 relative overflow-x-hidden">
      {/* Background Atmospheric Lighting Blobs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-[650px] w-[650px] rounded-full bg-purple-400/10 blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-10 left-1/4 h-[500px] w-[500px] rounded-full bg-pink-300/10 blur-3xl z-0" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-brand/30 bg-white/95 backdrop-blur-md p-4 shadow-xl text-xs font-semibold text-brand transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. PREMIUM FLOATING GLASS SIDEBAR */}
      <aside className="hidden lg:flex w-68 flex-col border-r border-blue-100/80 bg-white/80 backdrop-blur-2xl shadow-[8px_0_35px_rgba(49,88,232,0.04)] p-6 justify-between shrink-0 sticky top-0 h-screen z-20 rounded-r-[28px]">
        <div>
          <Link to="/" className="flex items-center gap-2 px-1 transition-opacity hover:opacity-90">
            <Logo href="" />
          </Link>

          <div className="mt-4 rounded-full border border-blue-200/60 bg-blue-50/70 px-3.5 py-1.5 text-center shadow-2xs">
            <span className="text-[10px] font-extrabold tracking-widest text-[#315FEA] uppercase">
              DOCTOR CLINICAL PORTAL
            </span>
          </div>

          <nav className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "patients"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="h-4 w-4" /> Patient Registry
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  activeTab === "patients" ? "bg-white/20 text-white" : "bg-blue-100 text-[#315FEA]"
                }`}
              >
                {stats.totalPatients}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "appointments"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Calendar className="h-4 w-4" /> Today's Schedule
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  activeTab === "appointments"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {stats.todaysAptsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "records"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <ToothIcon className="h-4 w-4" /> Treatment Records
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "reports"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <FileCheck2 className="h-4 w-4" /> Medical Reports
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition-all ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-[#315FEA] via-[#6638E8] to-[#C83BE8] text-white shadow-[0_10px_25px_-5px_rgba(49,95,234,0.4)]"
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-slate-900"
              }`}
            >
              <Settings className="h-4 w-4" /> Clinic Settings
            </button>
          </nav>

          {/* 3. SIDEBAR DECORATIVE DENTAL CLINIC SECTION */}
          <div className="my-3 pt-2 space-y-2">
            <p className="font-signature text-2xl text-[#315FEA] leading-tight font-normal text-center -rotate-2">
              Healthy Smiles
              <br />
              Happier Lives ♡
            </p>
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-md h-24 group">
              <img
                src={clinicBg}
                alt="SmileCare Dental Clinic Interior"
                className="w-full h-full object-cover filter blur-[1px] opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 text-center">
                <span className="text-[9.5px] font-extrabold text-white tracking-widest uppercase drop-shadow-xs">
                  SMILECARE FACILITIES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DOCTOR PROFILE CARD AT BOTTOM OF SIDEBAR */}
        <div className="rounded-2xl border border-blue-100/90 bg-white/90 backdrop-blur-md p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-3">
            <img
              src={doctorCutout}
              alt="Dr. Anaya Sharma"
              className="h-10 w-10 rounded-full object-cover object-top border-2 border-[#315FEA]/50 bg-blue-50 shadow-2xs"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-extrabold text-slate-900 truncate">Dr. Anaya Sharma</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate">
                Chief Dental Surgeon
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-extrabold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* 5. FLOATING TOP HEADER */}
        <header className="sticky top-0 z-30 border-b border-blue-100/70 bg-white/80 backdrop-blur-xl px-5 py-3 lg:px-8 shadow-xs">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="lg:hidden">
                <Logo href="" />
              </Link>
              <h1 className="hidden sm:block text-sm font-extrabold text-slate-900 tracking-tight">
                SmileCare Clinical Management Portal
              </h1>
            </div>

            {/* ELEGANT SEARCH FIELD */}
            <div className="hidden md:flex flex-1 max-w-md items-center relative">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients, appointments, records..."
                className="w-full rounded-full border border-blue-200/80 bg-slate-50/90 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#315FEA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#315FEA]/20 shadow-2xs"
              />
            </div>

            {/* RIGHT HEADER USER & ACTION CONTROLS */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                className="relative grid h-9.5 w-9.5 place-items-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-2xs">
                  3
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1 shadow-2xs">
                <img
                  src={doctorCutout}
                  alt="Dr. Anaya Sharma"
                  className="h-7 w-7 rounded-full object-cover object-top border border-[#315FEA]/40 bg-blue-50"
                />
                <div className="text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900">Dr. Anaya Sharma</p>
                  <p className="text-[9.5px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                    Online
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-extrabold text-[#315FEA] hover:bg-[#315FEA] hover:text-white transition-all shadow-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Visit Website
              </Link>
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md p-4 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("patients");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Users className="h-4 w-4" /> Patient Registry ({stats.totalPatients})
            </button>
            <button
              onClick={() => {
                setActiveTab("appointments");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Calendar className="h-4 w-4" /> Today's Schedule ({stats.todaysAptsCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("records");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <ToothIcon className="h-4 w-4" /> Treatment Records
            </button>
            <button
              onClick={() => {
                setActiveTab("reports");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <FileCheck2 className="h-4 w-4" /> Medical Reports
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" /> Clinic Settings
            </button>
          </div>
        )}

        {/* DYNAMIC MAIN CONTENT VIEW */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 space-y-7 max-w-[1400px] mx-auto w-full">
          {loadingData && (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#315FEA]" />
              <p className="text-xs font-semibold text-slate-500">
                Loading clinical database records...
              </p>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {!loadingData && activeTab === "dashboard" && (
            <>
              {/* 6, 7, 8, 9, 10, 11. GRAND MAIN HERO SECTION WITH LOGIN DOCTOR CUTOUT */}
              <div className="relative rounded-[32px] border border-blue-100/90 bg-gradient-to-r from-[#315FEA]/10 via-[#6638E8]/10 to-[#C83BE8]/10 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[360px] sm:min-h-[410px] flex flex-col justify-between">
                {/* Real Dental Clinic Background Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={clinicBg}
                    alt="SmileCare Modern Dental Hospital"
                    className="w-full h-full object-cover filter blur-[3px] opacity-40 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-blue-50/75" />
                </div>

                <div className="relative z-10 p-6 sm:p-9 flex items-start justify-between gap-6">
                  {/* Left Side Hero Text & Decorative Script */}
                  <div className="max-w-[560px]">
                    <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#315FEA] uppercase">
                      G O O D &nbsp; D E N T I S T R Y &nbsp; B R I G H T E R &nbsp; F U T U R E S
                    </span>
                    <h1 className="mt-2.5 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                      Good Morning,
                      <br />
                      Dr. Anaya 👋
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-[440px]">
                      Here's your clinical workspace summary and patient schedules for today.
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                      <p className="font-signature text-2xl sm:text-3xl text-[#315FEA] font-normal -rotate-1 drop-shadow-xs">
                        Empowering Dentists for Healthier Smiles ♡
                      </p>
                    </div>
                  </div>

                  {/* 7. EXACT SAME DOCTOR CUTOUT FROM /DOCTOR-LOGIN */}
                  <div className="relative h-full w-full max-w-[460px] hidden md:flex items-end justify-center self-end z-10">
                    <img
                      src={doctorCutout}
                      alt="Dr. Anaya Sharma"
                      className="absolute bottom-0 right-6 sm:right-16 lg:right-24 h-[310px] sm:h-[370px] lg:h-[430px] w-auto object-contain object-bottom pointer-events-none drop-shadow-[0_25px_50px_rgba(49,95,234,0.35)]"
                    />

                    {/* 9. Floating Glass Feature Cards around Doctor */}
                    <div className="absolute bottom-16 -left-6 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md p-3 shadow-xl text-slate-900">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-xs">
                        <Users className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold leading-tight text-slate-900">
                          Patient Care
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Manage patient history
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-16 right-2 z-20 hidden lg:flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md p-3 shadow-xl text-slate-900">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-600 text-white shadow-xs">
                        <Calendar className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold leading-tight text-slate-900">
                          Today's Schedule
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          {stats.todaysAptsCount} appointments today
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 10. Floating Glass Date Card (Top Right) */}
                  <div className="relative z-20 hidden sm:flex items-center gap-3.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg shrink-0">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#315FEA]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">02 September 2026</p>
                      <p className="text-[10px] font-semibold text-slate-500">
                        Tuesday • Today's Clinical Overview
                      </p>
                    </div>
                  </div>
                </div>

                {/* 9. Floating Quote Badge */}
                <div className="relative z-20 px-6 sm:px-9 pb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-slate-900 shadow-md">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#315FEA] text-white shadow-xs">
                      <ToothIcon className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-bold text-slate-900">
                      “A Healthier Tomorrow, One Smile at a Time.”
                    </p>
                  </div>
                </div>

                {/* 11. INTEGRATED HERO BOTTOM TRANSLUCENT STATS STRIP */}
                <div className="relative z-20 border-t border-white/60 bg-white/60 backdrop-blur-md px-6 sm:px-9 py-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/15 text-[#315FEA] font-bold">
                      <Users className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {stats.totalPatients} Patients
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">Registered in DB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/15 text-[#6638E8] font-bold">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {stats.todaysAptsCount} Today
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">Scheduled Visit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-700 font-bold">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-amber-700">
                        {stats.waitingCount} Waiting
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">In Reception</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/15 text-purple-700 font-bold">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-purple-700">
                        {stats.inConsultationCount} Active
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">In Surgery</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-700">500+ Happy</p>
                      <p className="text-[10px] font-semibold text-slate-500">Smile Patients</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-500/15 text-pink-700 font-bold">
                      <Activity className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-pink-700">Modern</p>
                      <p className="text-[10px] font-semibold text-slate-500">Dental Facilities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 13. CLINICAL CONTENT AREA (2-COLUMN VISUAL SPLIT) */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* LEFT: RECENTLY REGISTERED PATIENTS TABLE CARD */}
                <div className="lg:col-span-7 rounded-[28px] border border-blue-100/90 bg-white/85 backdrop-blur-xl p-6.5 shadow-[0_15px_40px_rgba(49,95,234,0.04)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-[#315FEA] shadow-2xs">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-extrabold text-slate-900">
                          Recently Registered Patients
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Sorted by registration date
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("patients")}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#315FEA] hover:underline"
                    >
                      View Registry <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    {recentlyRegistered.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100/90 bg-white/95 p-4 transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="grid h-10.5 w-10.5 place-items-center rounded-2xl bg-gradient-to-br from-[#315FEA] to-[#6638E8] text-white text-xs font-extrabold shadow-xs">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-extrabold text-slate-900">
                                {patient.name}
                              </p>
                              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#315FEA]">
                                #{patient.id}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                              {formatDate(patient.registrationDate)} •{" "}
                              <span className="font-semibold text-slate-800">
                                {patient.treatment}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
                              patient.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-purple-500/10 text-purple-700"
                            }`}
                          >
                            {patient.status}
                          </span>
                          <button
                            onClick={() => handleOpenPatientModal(patient)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-[#315FEA] hover:text-white hover:border-[#315FEA] transition-all shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Patient
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: TODAY'S SCHEDULE CLINICAL TIMELINE CARD */}
                <div className="lg:col-span-5 rounded-[28px] border border-blue-100/90 bg-white/85 backdrop-blur-xl p-6.5 shadow-[0_15px_40px_rgba(49,95,234,0.04)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-[#6638E8] shadow-2xs">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-extrabold text-slate-900">
                          Today's Schedule
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">02 September 2026</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("appointments")}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#315FEA] hover:underline"
                    >
                      Full Schedule <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-6 space-y-3.5 max-h-[410px] overflow-y-auto pr-1">
                    {todaysSchedule.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/90 bg-white/95 p-4 transition-all duration-200 hover:bg-white hover:shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                            <Clock className="h-3.5 w-3.5 text-[#315FEA]" />
                            {apt.time}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {apt.patientName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {apt.treatment}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, "In Consultation")}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Appointment Options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FOOTER INFO BAR */}
              <footer className="mt-6 rounded-[24px] border border-blue-100/80 bg-white/80 backdrop-blur-xl p-4.5 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#315FEA]" /> Tadepalligudem
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#315FEA]" /> +91 98765 43210
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#315FEA]" /> support@smilecare.com
                  </span>
                </div>
                <div className="tracking-widest text-[11px] font-extrabold text-[#315FEA] uppercase">
                  CARE &nbsp;|&nbsp; COMPASSION &nbsp;|&nbsp; CONFIDENCE
                </div>
              </footer>
            </>
          )}

          {/* TAB 2: PATIENT REGISTRY */}
          {!loadingData && activeTab === "patients" && (
            <section className="rounded-[24px] border border-white/90 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_35px_rgba(40,50,120,0.06)]">
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-slate-50/70 py-2.5 px-3.5 text-xs font-semibold text-foreground focus:border-brand focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="follow-up">Follow-up Needed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="sm:col-span-3 relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-slate-50/70 py-2.5 px-3.5 text-xs font-semibold text-foreground focus:border-brand focus:bg-white focus:outline-none"
                  >
                    <option value="all">Registration: All Time</option>
                    <option value="today">Registered Today</option>
                    <option value="week">Registered This Week</option>
                    <option value="month">Registered This Month</option>
                  </select>
                </div>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="mt-6 space-y-3 md:hidden">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="rounded-2xl border border-border/80 bg-slate-50/70 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand text-xs">{patient.id}</span>
                        <h3 className="font-bold text-foreground text-sm">{patient.name}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        {patient.status}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Age/Gender:{" "}
                        <span className="font-semibold text-foreground">
                          {patient.age} yrs / {patient.gender}
                        </span>
                      </p>
                      <p>
                        Phone:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {patient.phone}
                        </span>
                      </p>
                      <p>
                        Treatment:{" "}
                        <span className="font-semibold text-foreground">{patient.treatment}</span>
                      </p>
                      <p>
                        Reg Date:{" "}
                        <span className="font-semibold text-foreground">
                          {formatDate(patient.registrationDate)}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenPatientModal(patient)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-semibold text-white shadow-soft"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Clinical Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="mt-6 hidden md:block overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Patient ID</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Age / Gender</th>
                      <th className="py-3.5 px-4">Phone Number</th>
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
                            <p className="font-bold text-foreground group-hover:text-brand transition-colors">
                              {patient.name}
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {patient.age} yrs / {patient.gender}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {patient.phone}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {formatDate(patient.registrationDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-muted-foreground">
                          {formatDate(patient.lastVisit)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
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
          {!loadingData && activeTab === "appointments" && (
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
                  {todaysSchedule.length} Scheduled
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Time</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Patient Code</th>
                      <th className="py-3.5 px-4">Treatment</th>
                      <th className="py-3.5 px-4 max-w-[260px]">Reason for Visit</th>
                      <th className="py-3.5 px-4">Status Workflow</th>
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
                            "
                            {apt.reasonForVisit ||
                              "Tooth pain in lower right molar for past 3 days."}
                            "
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
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors shadow-xs"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Patient Profile
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
          {!loadingData && activeTab === "records" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Treatment Records
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Historical record of completed procedures & clinical treatments
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
          {!loadingData && activeTab === "reports" && (
            <section className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Medical Reports Repository
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Radiology scans, clinical reports, and medical attachments
                  </p>
                </div>
                <span className="rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-bold text-brand-purple">
                  {reports.length} Uploaded Reports
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
                          <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                if (pRecord) handleOpenPatientModal(pRecord);
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Profile
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
          {!loadingData && activeTab === "settings" && (
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

      {/* ELECTRONIC CLINICAL RECORD MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[92vh]">
            {/* Modal Header Bar */}
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
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-border bg-slate-50 px-6 pt-3 gap-1 text-xs font-semibold overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveModalTab("overview")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "overview"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </button>

              <button
                onClick={() => setActiveModalTab("clinical")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "clinical"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" /> Clinical Notes
              </button>

              <button
                onClick={() => setActiveModalTab("treatment")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "treatment"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderHeart className="h-3.5 w-3.5" /> Treatment
              </button>

              <button
                onClick={() => setActiveModalTab("rx")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "rx"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Prescriptions
              </button>

              <button
                onClick={() => setActiveModalTab("apts")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "apts"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-3.5 w-3.5" /> Appointments
              </button>

              <button
                onClick={() => setActiveModalTab("reports")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "reports"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" /> Reports ({patientReportsList.length})
              </button>

              <button
                onClick={() => setActiveModalTab("followup")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "followup"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" /> Follow-ups
              </button>

              <button
                onClick={() => setActiveModalTab("timeline")}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all ${
                  activeModalTab === "timeline"
                    ? "border-brand text-brand font-bold bg-white rounded-t-xl"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> Timeline
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* TAB 1: OVERVIEW */}
              {activeModalTab === "overview" && (
                <div className="space-y-6">
                  {/* PROMINENT REASON FOR VISIT BANNER */}
                  <div className="rounded-2xl border border-brand-purple/30 bg-soft-purple/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-wider">
                      <MessageSquare className="h-4 w-4" /> REASON FOR VISIT / DENTAL CONCERN
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      "
                      {selectedPatient.reasonForVisit ||
                        "Tooth pain in lower right molar for the past 3 days."}
                      "
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Patient Information */}
                    <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4 space-y-2 text-xs">
                      <h4 className="font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Demographics
                      </h4>
                      <div className="space-y-1.5 pt-1">
                        <p>
                          <span className="text-muted-foreground">Full Name:</span>{" "}
                          <span className="font-bold text-foreground">{selectedPatient.name}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Code:</span>{" "}
                          <span className="font-mono font-bold text-brand">
                            {selectedPatient.id}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Age / Gender:</span>{" "}
                          <span className="font-medium text-foreground">
                            {selectedPatient.age} yrs / {selectedPatient.gender}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          <span className="font-mono font-medium text-foreground">
                            {selectedPatient.phone}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <span className="font-medium text-foreground">
                            {selectedPatient.email || "No email"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Medical History & Allergies */}
                    <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4 space-y-2 text-xs">
                      <h4 className="font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Clinical Alerts
                      </h4>
                      <div className="space-y-1.5 pt-1">
                        <p>
                          <span className="text-muted-foreground">Medical History:</span>{" "}
                          <span className="font-semibold text-foreground">
                            {selectedPatient.medicalHistory || "No records available"}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Allergies:</span>{" "}
                          <span className="font-semibold text-rose-600">
                            {selectedPatient.allergies || "None reported"}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Registration Date:</span>{" "}
                          <span className="font-medium text-foreground">
                            {formatDate(selectedPatient.registrationDate)}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Latest Diagnosis:</span>{" "}
                          <span className="font-medium text-foreground">
                            {patientNotesList[0]?.diagnosis || "No records available"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Reports Summary Card */}
                    <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4 space-y-2 text-xs">
                      <h4 className="font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5" /> Medical Reports Summary
                      </h4>
                      <div className="space-y-1.5 pt-1">
                        <p className="font-bold text-foreground text-sm">
                          {patientReportsList.length > 0
                            ? `${patientReportsList.length} report${patientReportsList.length > 1 ? "s" : ""} available`
                            : "No medical reports available."}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Radiology X-Rays, treatment notes, and lab diagnostic files stored in
                          Supabase.
                        </p>
                        <button
                          onClick={() => setActiveModalTab("reports")}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                        >
                          Manage Reports <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLINICAL NOTES */}
              {activeModalTab === "clinical" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border/80 bg-white p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Stethoscope className="h-4 w-4 text-brand" /> DOCTOR CLINICAL NOTES &
                        DIAGNOSIS
                      </h4>
                      <button
                        onClick={() => setIsEditingNote(!isEditingNote)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />{" "}
                        {isEditingNote ? "Cancel Edit" : "Edit Note"}
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor="diagnosis-input"
                        className="block text-xs font-semibold text-foreground mb-1"
                      >
                        Diagnosis / Clinical Findings
                      </label>
                      <textarea
                        id="diagnosis-input"
                        rows={2}
                        value={diagnosis}
                        disabled={!isEditingNote}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis details..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand disabled:opacity-80 resize-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="treatment-notes-input"
                        className="block text-xs font-semibold text-foreground mb-1"
                      >
                        Treatment Notes & Recommended Plan
                      </label>
                      <textarea
                        id="treatment-notes-input"
                        rows={2}
                        value={treatmentNotes}
                        disabled={!isEditingNote}
                        onChange={(e) => setTreatmentNotes(e.target.value)}
                        placeholder="Enter treatment plan..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand disabled:opacity-80 resize-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="obs-input"
                        className="block text-xs font-semibold text-foreground mb-1"
                      >
                        Additional Observations
                      </label>
                      <input
                        id="obs-input"
                        type="text"
                        value={observations}
                        disabled={!isEditingNote}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Observations..."
                        className="w-full rounded-xl border border-border bg-slate-50 p-3 text-xs font-medium text-foreground outline-none focus:border-brand disabled:opacity-80"
                      />
                    </div>

                    {isEditingNote && (
                      <button
                        onClick={handleSaveClinicalNotes}
                        disabled={isSavingNote}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-brand-dark transition-all disabled:opacity-70"
                      >
                        {isSavingNote ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Save Clinical Note</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Saved Clinical Notes History */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Clinical Notes History
                    </h5>
                    {patientNotesList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No records available</p>
                    ) : (
                      patientNotesList.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-border/80 bg-slate-50/70 p-4 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-bold text-foreground">
                            <span>{note.diagnosis}</span>
                            <span className="text-muted-foreground font-normal">
                              {formatDate(note.date)}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{note.treatmentNotes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TREATMENT HISTORY */}
              {activeModalTab === "treatment" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-4 space-y-3 text-xs">
                    <h4 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-brand" /> Record New Treatment
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="trt-name-input"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Treatment Name
                        </label>
                        <input
                          id="trt-name-input"
                          type="text"
                          value={trtName}
                          onChange={(e) => setTrtName(e.target.value)}
                          placeholder="e.g. Dental Implant Placement"
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="trt-diag-input"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Diagnosis
                        </label>
                        <input
                          id="trt-diag-input"
                          type="text"
                          value={trtDiagnosis}
                          onChange={(e) => setTrtDiagnosis(e.target.value)}
                          placeholder="e.g. Edentulous space in #30"
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="trt-date-input"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Treatment Date
                        </label>
                        <input
                          id="trt-date-input"
                          type="date"
                          value={trtDate}
                          onChange={(e) => setTrtDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="trt-status-input"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Status
                        </label>
                        <select
                          id="trt-status-input"
                          value={trtStatus}
                          onChange={(e) => setTrtStatus(e.target.value)}
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Planned">Planned</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveTreatment}
                      disabled={isSavingTreatment}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-soft disabled:opacity-75"
                    >
                      {isSavingTreatment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Save Treatment Record</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Treatment History Table */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Completed Procedure History
                    </h5>
                    {patientTreatmentsList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No records available</p>
                    ) : (
                      <div className="rounded-2xl border border-border/80 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-muted-foreground uppercase font-semibold">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3">Treatment</th>
                              <th className="p-3">Diagnosis</th>
                              <th className="p-3">Doctor</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-white">
                            {patientTreatmentsList.map((t) => (
                              <tr key={t.id}>
                                <td className="p-3 font-medium text-foreground">
                                  {formatDate(t.treatmentDate)}
                                </td>
                                <td className="p-3 font-bold text-foreground">{t.treatment}</td>
                                <td className="p-3 text-muted-foreground">{t.diagnosis}</td>
                                <td className="p-3 font-medium text-foreground">{t.doctor}</td>
                                <td className="p-3">
                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PRESCRIPTIONS */}
              {activeModalTab === "rx" && (
                <div className="space-y-6">
                  {/* ADD MEDICINE FORM */}
                  <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-brand" /> Add Medication to Prescription
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="med-name-input"
                          className="block text-[11px] font-semibold text-muted-foreground"
                        >
                          Medicine Name
                        </label>
                        <input
                          id="med-name-input"
                          type="text"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="med-dosage-input"
                          className="block text-[11px] font-semibold text-muted-foreground"
                        >
                          Dosage
                        </label>
                        <input
                          id="med-dosage-input"
                          type="text"
                          value={medDosage}
                          onChange={(e) => setMedDosage(e.target.value)}
                          placeholder="e.g. 1 Capsule"
                          className="mt-1 w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="med-freq-input"
                          className="block text-[11px] font-semibold text-muted-foreground"
                        >
                          Frequency
                        </label>
                        <select
                          id="med-freq-input"
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
                        <label
                          htmlFor="med-dur-input"
                          className="block text-[11px] font-semibold text-muted-foreground"
                        >
                          Duration
                        </label>
                        <select
                          id="med-dur-input"
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

                    <button
                      onClick={handleAddMedicine}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> + Add Medicine
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
                                className="text-rose-600 p-1"
                                aria-label={`Remove ${m.medicine}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleSavePrescription}
                      disabled={isSavingRx}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-xs font-semibold text-white shadow-soft disabled:opacity-75"
                    >
                      {isSavingRx ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>Save Prescription</span>
                        </>
                      )}
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

              {/* TAB 5: APPOINTMENTS HISTORY */}
              {activeModalTab === "apts" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <History className="h-4 w-4 text-brand" /> APPOINTMENT HISTORY
                  </h4>

                  {patientAptsList.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No records available</p>
                  ) : (
                    <div className="rounded-2xl border border-border/80 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-muted-foreground font-semibold uppercase">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Treatment</th>
                            <th className="p-3">Reason for Visit</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 bg-white">
                          {patientAptsList.map((a) => (
                            <tr key={a.id}>
                              <td className="p-3 font-medium text-foreground">
                                {formatDate(a.date)}
                              </td>
                              <td className="p-3 font-bold text-brand-purple">{a.time}</td>
                              <td className="p-3 font-semibold text-foreground">{a.treatment}</td>
                              <td className="p-3 text-muted-foreground">"{a.reasonForVisit}"</td>
                              <td className="p-3">
                                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: MEDICAL REPORTS (SUPABASE STORAGE INTEGRATED) */}
              {activeModalTab === "reports" && (
                <div className="space-y-6">
                  {/* UPLOAD REPORT FORM */}
                  <form
                    onSubmit={handleUploadReport}
                    className="rounded-2xl border border-border/80 bg-slate-50/80 p-5 space-y-4"
                  >
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileUp className="h-4 w-4 text-brand" /> Upload Medical Report to Supabase
                      Storage
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="rep-title"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Report Title *
                        </label>
                        <input
                          id="rep-title"
                          type="text"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          placeholder="e.g. Panoramic X-Ray Scan"
                          required
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="rep-type"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Report Type
                        </label>
                        <select
                          id="rep-type"
                          value={reportType}
                          onChange={(e) =>
                            setReportType(e.target.value as MedicalReportRecord["reportType"])
                          }
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none"
                        >
                          <option value="Dental X-Ray">Dental X-Ray</option>
                          <option value="Clinical Report">Clinical Report</option>
                          <option value="Treatment Report">Treatment Report</option>
                          <option value="Prescription">Prescription Scan</option>
                          <option value="Other">Other Document</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="rep-date"
                          className="block text-[11px] font-semibold text-muted-foreground mb-1"
                        >
                          Report Date
                        </label>
                        <input
                          id="rep-date"
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="rep-desc"
                        className="block text-[11px] font-semibold text-muted-foreground mb-1"
                      >
                        Description / Clinical Summary
                      </label>
                      <input
                        id="rep-desc"
                        type="text"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Brief summary of findings or lab details..."
                        className="w-full rounded-xl border border-border bg-white p-2.5 text-xs font-medium text-foreground outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rep-file"
                        className="block text-[11px] font-semibold text-muted-foreground mb-1"
                      >
                        Select File (PDF, JPG, JPEG, PNG • Max 15MB) *
                      </label>
                      <input
                        id="rep-file"
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                        className="w-full text-xs font-medium text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-brand/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand hover:file:bg-brand/20 cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingReport}
                      className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-soft disabled:opacity-75"
                    >
                      {isUploadingReport ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Upload Medical Report</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* REPORT REPOSITORY LIST */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck2 className="h-4 w-4 text-brand" /> STORED PATIENT MEDICAL REPORTS
                    </h4>

                    {patientReportsList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No medical reports available.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {patientReportsList.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-2xl border border-border/80 bg-white p-4 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs hover:border-brand/30 transition-all"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm">
                                  {r.details || r.reportType}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-foreground text-[10px]">
                                  {r.reportType}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                Date:{" "}
                                <span className="font-medium text-foreground">
                                  {formatDate(r.reportDate)}
                                </span>{" "}
                                • Doctor: {r.doctor}
                              </p>
                              {r.fileName && (
                                <p className="font-mono text-[11px] text-brand-purple">
                                  File: {r.fileName} (
                                  {r.fileSize ? Math.round(r.fileSize / 1024) + " KB" : "Attached"})
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewReport(r)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:text-white transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button
                                onClick={() => handleDownloadReport(r)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-200 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </button>
                              <button
                                onClick={() => handleDeleteReport(r)}
                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                aria-label="Delete report"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: FOLLOW-UPS */}
              {activeModalTab === "followup" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border/80 bg-slate-50/80 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-brand" /> SCHEDULE NEXT FOLLOW-UP
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fup-date-input"
                          className="block text-xs font-semibold text-foreground mb-1"
                        >
                          Follow-up Date
                        </label>
                        <input
                          id="fup-date-input"
                          type="date"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="fup-time-input"
                          className="block text-xs font-semibold text-foreground mb-1"
                        >
                          Follow-up Time
                        </label>
                        <input
                          id="fup-time-input"
                          type="text"
                          value={followupTime}
                          onChange={(e) => setFollowupTime(e.target.value)}
                          placeholder="e.g. 11:00 AM"
                          className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="fup-purpose-input"
                        className="block text-xs font-semibold text-foreground mb-1"
                      >
                        Purpose of Follow-up
                      </label>
                      <input
                        id="fup-purpose-input"
                        type="text"
                        value={followupPurpose}
                        onChange={(e) => setFollowupPurpose(e.target.value)}
                        placeholder="e.g. Post-op checkup"
                        className="w-full rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground outline-none focus:border-brand"
                      />
                    </div>

                    <button
                      onClick={handleScheduleFollowup}
                      disabled={isSchedulingFollowup}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-xs font-semibold text-white shadow-soft disabled:opacity-75"
                    >
                      {isSchedulingFollowup ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          <span>Schedule Follow-up</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 8: TIMELINE */}
              {activeModalTab === "timeline" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-brand" /> PATIENT CLINICAL JOURNEY TIMELINE
                  </h4>

                  <div className="relative border-l-2 border-brand/30 ml-4 pl-6 space-y-6">
                    {patientTimelineList.map((t, idx) => (
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

      {/* REPORT VIEW PREVIEW MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {viewingReport.report.details || viewingReport.report.reportType}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Patient Code: {viewingReport.report.patientId} • Date:{" "}
                  {formatDate(viewingReport.report.reportDate)}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-foreground hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[250px] bg-slate-100 rounded-2xl p-4 flex items-center justify-center">
              {viewingReport.signedUrl ? (
                viewingReport.report.fileType?.includes("pdf") ? (
                  <iframe
                    src={viewingReport.signedUrl}
                    className="w-full h-[380px] rounded-xl border-none"
                    title="PDF Medical Report Preview"
                  />
                ) : (
                  <img
                    src={viewingReport.signedUrl}
                    alt={viewingReport.report.reportTitle}
                    className="max-h-[380px] rounded-xl object-contain shadow-md"
                  />
                )
              ) : (
                <div className="text-center space-y-2 text-xs text-muted-foreground p-6">
                  <FileText className="h-10 w-10 mx-auto text-brand" />
                  <p className="font-semibold text-foreground">{viewingReport.report.details}</p>
                  <p>Document stored securely in Supabase clinical repository.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDownloadReport(viewingReport.report)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-soft"
              >
                <Download className="h-4 w-4" /> Secure Download
              </button>
              <button
                onClick={() => setViewingReport(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PRESCRIPTION PREVIEW MODAL */}
      {printingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-8 shadow-2xl space-y-6">
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
