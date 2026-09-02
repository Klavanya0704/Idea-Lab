export interface PatientRecord {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string; // YYYY-MM-DD
  registrationTime: string; // e.g. "10:30 AM"
  patientType: string; // "New Patient" | "Returning Patient"
  treatment: string;
  reasonForVisit: string;
  medicalHistory: string;
  allergies: string;
  lastVisit: string;
  nextAppointment: string;
  status: "Active" | "Follow-up" | "Completed" | "Waiting" | "In Consultation" | "Cancelled";
  isNew?: boolean;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  treatment: string;
  reasonForVisit: string;
  status: "Confirmed" | "Waiting" | "In Consultation" | "Completed" | "Follow-up" | "Cancelled";
  doctor: string;
  notes?: string;
}

export interface ClinicalNoteRecord {
  id: string;
  patientId: string;
  date: string;
  diagnosis: string;
  treatmentNotes: string;
  observations: string;
  doctor: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  doctor: string;
  medicines: PrescriptionItem[];
  diagnosis?: string;
  notes?: string;
}

export interface TreatmentHistoryRecord {
  id: string;
  patientId: string;
  patientName: string;
  treatment: string;
  diagnosis: string;
  treatmentDate: string;
  doctor: string;
  status: string;
}

export interface MedicalReportRecord {
  id: string;
  patientId: string;
  patientName: string;
  reportType: "Dental X-Ray" | "Treatment Report" | "Clinical Notes" | "Prescription";
  reportDate: string;
  doctor: string;
  status: "Completed" | "Pending Review" | "Finalized";
  details?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time: string;
  event: string;
  doctor: string;
  notes: string;
}

// STORAGE KEYS
const PATIENTS_KEY = "smilecare_patients";
const APPOINTMENTS_KEY = "smilecare_appointments";
const CLINICAL_NOTES_KEY = "smilecare_clinical_notes";
const PRESCRIPTIONS_KEY = "smilecare_prescriptions";
const TREATMENTS_KEY = "smilecare_treatment_records";
const REPORTS_KEY = "smilecare_medical_reports";
const TIMELINES_KEY = "smilecare_timelines";

// SEED INITIAL DATA
const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: "P001",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43210",
    email: "priya@gmail.com",
    address: "Block B, Greater Kailash, New Delhi",
    registrationDate: "2026-09-02",
    registrationTime: "09:15 AM",
    patientType: "New Patient",
    treatment: "General Checkup",
    reasonForVisit: "Tooth pain in lower right molar for the past 3 days.",
    medicalHistory: "None reported",
    allergies: "Penicillin",
    lastVisit: "2026-09-02",
    nextAppointment: "2026-09-16",
    status: "Active",
    isNew: true,
  },
  {
    id: "P002",
    name: "Rahul Mehta",
    age: 35,
    gender: "Male",
    phone: "+91 98765 43121",
    email: "rahul@gmail.com",
    address: "Sector 15, Gurgaon, Haryana",
    registrationDate: "2026-08-28",
    registrationTime: "10:30 AM",
    patientType: "New Patient",
    treatment: "Dental Implant",
    reasonForVisit: "Missing lower tooth replacement consultation.",
    medicalHistory: "Mild Hypertension",
    allergies: "None",
    lastVisit: "2026-08-30",
    nextAppointment: "2026-09-10",
    status: "Active",
    isNew: true,
  },
  {
    id: "P003",
    name: "Sneha Reddy",
    age: 24,
    gender: "Female",
    phone: "+91 98765 43876",
    email: "sneha@gmail.com",
    address: "Vasant Kunj, New Delhi",
    registrationDate: "2026-08-25",
    registrationTime: "11:00 AM",
    patientType: "New Patient",
    treatment: "Orthodontics",
    reasonForVisit: "Braces consultation and alignment assessment.",
    medicalHistory: "Asthma",
    allergies: "Dust, Pollen",
    lastVisit: "2026-08-29",
    nextAppointment: "2026-09-20",
    status: "Active",
    isNew: true,
  },
  {
    id: "P004",
    name: "Arjun Kumar",
    age: 42,
    gender: "Male",
    phone: "+91 98765 43456",
    email: "arjun@gmail.com",
    address: "Noida Sector 62, Uttar Pradesh",
    registrationDate: "2026-08-20",
    registrationTime: "02:15 PM",
    patientType: "Returning Patient",
    treatment: "Root Canal",
    reasonForVisit: "Severe sensitivity and sharp pain when drinking cold liquids.",
    medicalHistory: "Type 2 Diabetes (Controlled)",
    allergies: "Sulfa drugs",
    lastVisit: "2026-08-27",
    nextAppointment: "2026-09-05",
    status: "Follow-up",
    isNew: false,
  },
  {
    id: "P005",
    name: "Anjali Rao",
    age: 31,
    gender: "Female",
    phone: "+91 98765 43987",
    email: "anjali@gmail.com",
    address: "Saket, New Delhi",
    registrationDate: "2026-08-18",
    registrationTime: "04:00 PM",
    patientType: "New Patient",
    treatment: "Cosmetic Dentistry",
    reasonForVisit: "Smile design and teeth whitening evaluation.",
    medicalHistory: "None",
    allergies: "None",
    lastVisit: "2026-08-25",
    nextAppointment: "2026-09-12",
    status: "Active",
    isNew: false,
  },
];

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "APT-101",
    patientId: "P001",
    patientName: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya@gmail.com",
    date: "2026-09-02",
    time: "10:00 AM",
    treatment: "General Checkup",
    reasonForVisit: "Routine dental examination and minor tooth pain.",
    status: "Confirmed",
    doctor: "Dr. Anaya Sharma",
  },
  {
    id: "APT-102",
    patientId: "P002",
    patientName: "Rahul Mehta",
    phone: "+91 98765 43121",
    email: "rahul@gmail.com",
    date: "2026-09-02",
    time: "10:30 AM",
    treatment: "Dental Implant",
    reasonForVisit: "Missing tooth replacement consultation.",
    status: "Confirmed",
    doctor: "Dr. Anaya Sharma",
  },
  {
    id: "APT-103",
    patientId: "P003",
    patientName: "Sneha Reddy",
    phone: "+91 98765 43876",
    email: "sneha@gmail.com",
    date: "2026-09-02",
    time: "11:00 AM",
    treatment: "Orthodontics",
    reasonForVisit: "Braces consultation.",
    status: "Waiting",
    doctor: "Dr. Anaya Sharma",
  },
  {
    id: "APT-104",
    patientId: "P004",
    patientName: "Arjun Kumar",
    phone: "+91 98765 43456",
    email: "arjun@gmail.com",
    date: "2026-09-02",
    time: "02:15 PM",
    treatment: "Root Canal",
    reasonForVisit: "Follow-up check after root canal treatment.",
    status: "In Consultation",
    doctor: "Dr. Anaya Sharma",
  },
  {
    id: "APT-105",
    patientId: "P005",
    patientName: "Anjali Rao",
    phone: "+91 98765 43987",
    email: "anjali@gmail.com",
    date: "2026-09-02",
    time: "04:00 PM",
    treatment: "Cosmetic Dentistry",
    reasonForVisit: "Consultation for porcelain veneers.",
    status: "Confirmed",
    doctor: "Dr. Anaya Sharma",
  },
];

const INITIAL_TREATMENTS: TreatmentHistoryRecord[] = [
  {
    id: "TRT-201",
    patientId: "P001",
    patientName: "Priya Sharma",
    treatment: "General Checkup",
    diagnosis: "Dental caries in lower right molar.",
    treatmentDate: "2026-09-02",
    doctor: "Dr. Anaya Sharma",
    status: "Completed",
  },
  {
    id: "TRT-202",
    patientId: "P002",
    patientName: "Rahul Mehta",
    treatment: "Dental Implant",
    diagnosis: "Bone density evaluation completed for mandibular molar implant.",
    treatmentDate: "2026-08-30",
    doctor: "Dr. Anaya Sharma",
    status: "In Progress",
  },
  {
    id: "TRT-203",
    patientId: "P004",
    patientName: "Arjun Kumar",
    treatment: "Root Canal",
    diagnosis: "Pulpitis in tooth #19. Canal cleaned and sealed.",
    treatmentDate: "2026-08-27",
    doctor: "Dr. Anaya Sharma",
    status: "Completed",
  },
];

const INITIAL_REPORTS: MedicalReportRecord[] = [
  {
    id: "REP-301",
    patientId: "P001",
    patientName: "Priya Sharma",
    reportType: "Dental X-Ray",
    reportDate: "2026-09-02",
    doctor: "Dr. Anaya Sharma",
    status: "Completed",
    details: "Bitewing X-Ray showing interproximal caries on tooth #30.",
  },
  {
    id: "REP-302",
    patientId: "P002",
    patientName: "Rahul Mehta",
    reportType: "Treatment Report",
    reportDate: "2026-08-30",
    doctor: "Dr. Anaya Sharma",
    status: "Finalized",
    details: "Pre-implant 3D CBCT Scan and surgical guide planning.",
  },
  {
    id: "REP-303",
    patientId: "P004",
    patientName: "Arjun Kumar",
    reportType: "Prescription",
    reportDate: "2026-08-27",
    doctor: "Dr. Anaya Sharma",
    status: "Completed",
    details: "Amoxicillin 500mg and Paracetamol 650mg prescribed post-root canal.",
  },
];

const INITIAL_TIMELINES: Record<string, TimelineEvent[]> = {
  P001: [
    {
      id: "TL-001",
      patientId: "P001",
      date: "2026-09-02",
      time: "09:15 AM",
      event: "Registration",
      doctor: "SmileCare Desk",
      notes: "Patient registered online via website portal.",
    },
    {
      id: "TL-002",
      patientId: "P001",
      date: "2026-09-02",
      time: "10:00 AM",
      event: "Appointment",
      doctor: "Dr. Anaya Sharma",
      notes: "Consultation for lower right molar tooth pain.",
    },
  ],
  P002: [
    {
      id: "TL-010",
      patientId: "P002",
      date: "2026-08-28",
      time: "10:30 AM",
      event: "Registration",
      doctor: "SmileCare Desk",
      notes: "Patient registered for implant consultation.",
    },
    {
      id: "TL-011",
      patientId: "P002",
      date: "2026-08-30",
      time: "11:00 AM",
      event: "Diagnosis",
      doctor: "Dr. Anaya Sharma",
      notes: "3D CBCT scan completed for implant placement.",
    },
  ],
};

// STORAGE UTILITY HELPERS
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getStoredPatients(): PatientRecord[] {
  if (!isBrowser()) return INITIAL_PATIENTS;
  try {
    const data = localStorage.getItem(PATIENTS_KEY);
    if (!data) {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading patients from localStorage:", err);
    return INITIAL_PATIENTS;
  }
}

export function saveStoredPatients(patients: PatientRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error("Error saving patients to localStorage:", err);
  }
}

export function getStoredAppointments(): AppointmentRecord[] {
  if (!isBrowser()) return INITIAL_APPOINTMENTS;
  try {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    if (!data) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading appointments from localStorage:", err);
    return INITIAL_APPOINTMENTS;
  }
}

export function saveStoredAppointments(appointments: AppointmentRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error("Error saving appointments to localStorage:", err);
  }
}

export function getStoredClinicalNotes(patientId: string): ClinicalNoteRecord | null {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(CLINICAL_NOTES_KEY);
    if (!data) return null;
    const notesMap: Record<string, ClinicalNoteRecord> = JSON.parse(data);
    return notesMap[patientId] || null;
  } catch (err) {
    console.error("Error reading clinical notes from localStorage:", err);
    return null;
  }
}

export function saveStoredClinicalNote(note: ClinicalNoteRecord): void {
  if (!isBrowser()) return;
  try {
    const data = localStorage.getItem(CLINICAL_NOTES_KEY);
    const notesMap: Record<string, ClinicalNoteRecord> = data ? JSON.parse(data) : {};
    notesMap[note.patientId] = note;
    localStorage.setItem(CLINICAL_NOTES_KEY, JSON.stringify(notesMap));

    // Also append Timeline event
    addStoredTimelineEvent({
      id: "TL-" + Date.now(),
      patientId: note.patientId,
      date: note.date,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      event: "Diagnosis & Notes",
      doctor: note.doctor,
      notes: `Diagnosis: ${note.diagnosis}`,
    });
  } catch (err) {
    console.error("Error saving clinical note:", err);
  }
}

export function getStoredPrescription(patientId: string): PrescriptionRecord | null {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!data) return null;
    const rxMap: Record<string, PrescriptionRecord> = JSON.parse(data);
    return rxMap[patientId] || null;
  } catch (err) {
    console.error("Error reading prescription from localStorage:", err);
    return null;
  }
}

export function saveStoredPrescription(prescription: PrescriptionRecord): void {
  if (!isBrowser()) return;
  try {
    const data = localStorage.getItem(PRESCRIPTIONS_KEY);
    const rxMap: Record<string, PrescriptionRecord> = data ? JSON.parse(data) : {};
    rxMap[prescription.patientId] = prescription;
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(rxMap));

    // Also add to Medical Reports
    const reports = getStoredMedicalReports();
    reports.unshift({
      id: "REP-" + Date.now().toString().slice(-4),
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      reportType: "Prescription",
      reportDate: prescription.date,
      doctor: prescription.doctor,
      status: "Completed",
      details: `${prescription.medicines.length} medicine(s) prescribed: ${prescription.medicines
        .map((m) => m.medicine)
        .join(", ")}`,
    });
    saveStoredMedicalReports(reports);

    // Append Timeline event
    addStoredTimelineEvent({
      id: "TL-" + Date.now(),
      patientId: prescription.patientId,
      date: prescription.date,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      event: "Prescription Saved",
      doctor: prescription.doctor,
      notes: `${prescription.medicines.length} medicine(s) prescribed.`,
    });
  } catch (err) {
    console.error("Error saving prescription:", err);
  }
}

export function getStoredTreatmentRecords(): TreatmentHistoryRecord[] {
  if (!isBrowser()) return INITIAL_TREATMENTS;
  try {
    const data = localStorage.getItem(TREATMENTS_KEY);
    if (!data) {
      localStorage.setItem(TREATMENTS_KEY, JSON.stringify(INITIAL_TREATMENTS));
      return INITIAL_TREATMENTS;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_TREATMENTS;
  }
}

export function saveStoredTreatmentRecords(records: TreatmentHistoryRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TREATMENTS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Error saving treatment records:", err);
  }
}

export function getStoredMedicalReports(): MedicalReportRecord[] {
  if (!isBrowser()) return INITIAL_REPORTS;
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    if (!data) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_REPORTS;
  }
}

export function saveStoredMedicalReports(reports: MedicalReportRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Error saving medical reports:", err);
  }
}

export function getStoredTimeline(patientId: string): TimelineEvent[] {
  if (!isBrowser()) return INITIAL_TIMELINES[patientId] || [];
  try {
    const data = localStorage.getItem(TIMELINES_KEY);
    const timelinesMap: Record<string, TimelineEvent[]> = data
      ? JSON.parse(data)
      : INITIAL_TIMELINES;
    return timelinesMap[patientId] || [];
  } catch (err) {
    return INITIAL_TIMELINES[patientId] || [];
  }
}

export function addStoredTimelineEvent(event: TimelineEvent): void {
  if (!isBrowser()) return;
  try {
    const data = localStorage.getItem(TIMELINES_KEY);
    const timelinesMap: Record<string, TimelineEvent[]> = data
      ? JSON.parse(data)
      : INITIAL_TIMELINES;
    const existing = timelinesMap[event.patientId] || [];
    timelinesMap[event.patientId] = [...existing, event];
    localStorage.setItem(TIMELINES_KEY, JSON.stringify(timelinesMap));
  } catch (err) {
    console.error("Error adding timeline event:", err);
  }
}

/**
 * SHARED DATA ENTRY FROM PUBLIC WEBSITE FORM
 */
export function registerPublicAppointment(formData: {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  patientType: string;
  age: string;
  gender: string;
  reasonForVisit: string;
  medicalHistory: string;
}): { patient: PatientRecord; appointment: AppointmentRecord } {
  const patients = getStoredPatients();
  const appointments = getStoredAppointments();

  const todayIso = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Generate ID e.g. P011
  const maxIdNum = patients.reduce((max, p) => {
    const num = parseInt(p.id.replace(/\D/g, ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 10);
  const newPatientId = `P${String(maxIdNum + 1).padStart(3, "0")}`;

  // Check if patient with same phone exists
  const existing = patients.find((p) => p.phone.trim() === formData.phone.trim());

  let targetPatient: PatientRecord;

  if (existing) {
    existing.treatment = formData.service;
    existing.reasonForVisit = formData.reasonForVisit || existing.reasonForVisit;
    existing.lastVisit = todayIso;
    existing.nextAppointment = formData.date;
    existing.status = "Active";
    targetPatient = existing;
  } else {
    targetPatient = {
      id: newPatientId,
      name: formData.name,
      age: formData.age === "Under 18" ? 16 : formData.age === "18 - 30" ? 25 : 34,
      gender: (formData.gender === "Female" || formData.gender === "Male"
        ? formData.gender
        : "Female") as PatientRecord["gender"],
      phone: formData.phone.startsWith("+91") ? formData.phone : `+91 ${formData.phone}`,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      address: "New Delhi, India",
      registrationDate: todayIso,
      registrationTime: nowTime,
      patientType: formData.patientType || "New Patient",
      treatment: formData.service,
      reasonForVisit: formData.reasonForVisit || "General dental consultation and examination.",
      medicalHistory: formData.medicalHistory || "None reported",
      allergies: "None",
      lastVisit: todayIso,
      nextAppointment: formData.date,
      status: "Active",
      isNew: true,
    };
    patients.unshift(targetPatient);
    saveStoredPatients(patients);
  }

  // Create Appointment
  const newAptId = `APT-${Date.now().toString().slice(-4)}`;
  const newAppointment: AppointmentRecord = {
    id: newAptId,
    patientId: targetPatient.id,
    patientName: targetPatient.name,
    phone: targetPatient.phone,
    email: targetPatient.email,
    date: formData.date || todayIso,
    time: formData.time || "10:30 AM",
    treatment: formData.service,
    reasonForVisit: formData.reasonForVisit || "Routine consultation",
    status: "Confirmed",
    doctor: "Dr. Anaya Sharma",
  };

  appointments.unshift(newAppointment);
  saveStoredAppointments(appointments);

  // Timeline events
  addStoredTimelineEvent({
    id: "TL-" + Date.now(),
    patientId: targetPatient.id,
    date: todayIso,
    time: nowTime,
    event: "Registration",
    doctor: "Public Website",
    notes: `Registered via online appointment form. Reason: ${formData.reasonForVisit || "General consultation"}`,
  });

  addStoredTimelineEvent({
    id: "TL-" + (Date.now() + 1),
    patientId: targetPatient.id,
    date: formData.date || todayIso,
    time: formData.time || "10:30 AM",
    event: "Appointment Booked",
    doctor: "Dr. Anaya Sharma",
    notes: `Booked for ${formData.service}`,
  });

  return { patient: targetPatient, appointment: newAppointment };
}
