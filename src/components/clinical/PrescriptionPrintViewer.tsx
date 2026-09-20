import React, { useState, useRef } from "react";
import { Printer, X, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import type { PrescriptionRecord, PatientRecord } from "@/lib/clinicalStore";

interface PrescriptionPrintViewerProps {
  prescription: PrescriptionRecord;
  patient?: PatientRecord | null;
  onClose: () => void;
}

export function PrescriptionPrintViewer({
  prescription,
  patient,
  onClose,
}: PrescriptionPrintViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    const target =
      prescriptionRef.current || document.getElementById("smilecare-prescription-document");
    if (!target) {
      window.print();
      return;
    }

    // Clean up any pre-existing print root
    const existingPrintRoot = document.getElementById("smilecare-print-root");
    if (existingPrintRoot) {
      existingPrintRoot.remove();
    }

    // Create top-level print root outside fixed overlay wrappers
    const printRoot = document.createElement("div");
    printRoot.id = "smilecare-print-root";
    const clone = target.cloneNode(true) as HTMLElement;
    printRoot.appendChild(clone);

    document.body.appendChild(printRoot);
    document.body.classList.add("body-printing-prescription");

    const cleanup = () => {
      document.body.classList.remove("body-printing-prescription");
      if (document.body.contains(printRoot)) {
        document.body.removeChild(printRoot);
      }
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);

    // Fallback cleanup timer in case afterprint event is delayed
    setTimeout(cleanup, 2000);

    window.print();
  };

  const handleDownloadPDF = async () => {
    const element =
      prescriptionRef.current || document.getElementById("smilecare-prescription-document");
    if (!element) {
      toast.error("Unable to generate the PDF. Please try again.");
      return;
    }

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("smilecare-prescription-document");
          if (clonedElement) {
            clonedElement.style.maxHeight = "none";
            clonedElement.style.height = "auto";
            clonedElement.style.overflow = "visible";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const totalPages = Math.ceil(imgHeight / pdfHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yPosition = -(i * pdfHeight);
        pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
      }

      const rawId = prescription.id || prescription.patientId || "RX";
      const safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `SmileCare-Prescription-${safeId}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF document:", err);
      toast.error("Unable to generate the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print-bg animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL CONTROL BAR (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              SmileCare Clinical Prescription Preview
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand/90 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print Prescription
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 PRESCRIPTION CONTAINER */}
        <div
          ref={prescriptionRef}
          id="smilecare-prescription-document"
          className="printable-prescription-area overflow-y-auto p-8 sm:p-10 bg-white text-slate-900 font-sans text-xs leading-normal select-text flex-1"
        >
          {/* 1. HEADER */}
          <div className="flex items-start justify-between border-b-2 border-brand/80 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <div className="text-right">
              <h1 className="text-sm font-extrabold text-brand uppercase tracking-wider">
                SMILECARE CLINICAL PRESCRIPTION
              </h1>
              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                Prescription Date:{" "}
                <span className="font-bold text-slate-900">{formatDate(prescription.date)}</span>
              </p>
              <p className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                Prescription ID: <span className="font-bold text-brand">{prescription.id}</span>
              </p>
            </div>
          </div>

          {/* 2. PATIENT INFORMATION */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-5">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200/80 pb-1">
              PATIENT DEMOGRAPHICS & VISIT INFORMATION
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Patient Name:</span>{" "}
                <span className="font-extrabold text-slate-900">
                  {prescription.patientName || patient?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Patient Code:</span>{" "}
                <span className="font-mono font-bold text-brand">{prescription.patientId}</span>
              </div>
              {patient?.age && (
                <div>
                  <span className="text-slate-500 font-medium">Age / Gender:</span>{" "}
                  <span className="font-bold text-slate-900">
                    {patient.age} Yrs / {patient.gender}
                  </span>
                </div>
              )}
              {patient?.phone && (
                <div>
                  <span className="text-slate-500 font-medium">Phone:</span>{" "}
                  <span className="font-mono font-medium text-slate-900">{patient.phone}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 font-medium">Visit Date:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {formatDate(prescription.date)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Prescribing Doctor:</span>{" "}
                <span className="font-bold text-slate-900">
                  {prescription.doctor || "Dr. Anaya Sharma"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. CLINICAL INFORMATION */}
          <div className="space-y-3 mb-5 text-xs">
            {/* Chief Complaints / Problems */}
            {prescription.problems && prescription.problems.length > 0 && (
              <div className="rounded-lg border border-slate-200/90 bg-white p-3">
                <h3 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  CHIEF COMPLAINTS / CLINICAL PROBLEMS
                </h3>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                  {prescription.problems.map((prob, idx) => (
                    <li key={idx}>{prob}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Findings */}
            {prescription.clinicalFindings && (
              <div className="rounded-lg border border-slate-200/90 bg-white p-3">
                <h3 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  CLINICAL FINDINGS & OBSERVATIONS
                </h3>
                <p className="text-slate-800 font-medium">{prescription.clinicalFindings}</p>
              </div>
            )}

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <h3 className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand mb-0.5">
                  CONFIRMED DIAGNOSIS
                </h3>
                <p className="text-slate-900 font-extrabold">{prescription.diagnosis}</p>
              </div>
            )}
          </div>

          {/* 4. RX MARKER & MEDICATION TABLE */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif text-3xl font-black text-brand leading-none">Rx</span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                PRESCRIBED MEDICATIONS & DOSAGE SCHEDULE
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-300 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-300 text-[10.5px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">S.No</th>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Strength / Dosage</th>
                    <th className="py-2.5 px-3">Frequency & Timing</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {prescription.medicines && prescription.medicines.length > 0 ? (
                    prescription.medicines.map((m, idx) => (
                      <tr key={m.id || idx} className="align-top">
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{m.medicine}</p>
                          {m.genericName && (
                            <p className="text-[10.5px] text-slate-500 font-medium italic">
                              ({m.genericName})
                            </p>
                          )}
                          {m.route && (
                            <span className="inline-block mt-1 text-[9.5px] font-bold text-slate-600 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                              Route: {m.route}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {m.strength ? `${m.strength} (${m.dosage})` : m.dosage}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900">{m.frequency}</p>
                          {m.timing && m.timing.length > 0 && (
                            <p className="text-[10.5px] text-brand font-bold mt-0.5">
                              Timing: {m.timing.join(" + ")}
                            </p>
                          )}
                          {m.mealInstruction && (
                            <p className="text-[10.5px] text-slate-600 font-medium">
                              {m.mealInstruction}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {m.duration}
                          {m.quantity && (
                            <p className="text-[10.5px] text-slate-500 font-medium">
                              Qty: {m.quantity}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium italic">
                          {m.instructions || "As directed"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 px-3 text-center text-slate-500 italic">
                        No medications prescribed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. DOCTOR'S INSTRUCTIONS */}
          {prescription.notes && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 mb-5 text-xs">
              <h3 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                DOCTOR'S SPECIAL INSTRUCTIONS
              </h3>
              <p className="text-slate-800 font-medium whitespace-pre-line">{prescription.notes}</p>
            </div>
          )}

          {/* 6. FOLLOW-UP */}
          {(prescription.followupDate || patient?.nextAppointment) && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 mb-6 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-purple">
                  NEXT FOLLOW-UP VISIT:
                </span>{" "}
                <span className="font-bold text-slate-900 ml-1">
                  {formatDate(prescription.followupDate || patient?.nextAppointment)}
                </span>
              </div>
              {prescription.followupReason && (
                <span className="text-slate-600 font-medium text-[11px]">
                  Reason: {prescription.followupReason}
                </span>
              )}
            </div>
          )}

          {/* 7. DOCTOR INFORMATION & CLEAN SIGNATURE AREA (NO FAKE SIGNATURE IMAGES) */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-200 mt-auto">
            <div className="text-[10px] text-slate-500 font-medium space-y-0.5">
              <p className="font-bold text-slate-700 uppercase tracking-wider">
                CLINICAL PRESCRIBING NOTICE:
              </p>
              <p>
                This prescription document is issued by an authorized dental surgeon at SmileCare
                Hospital.
              </p>
              <p>Please present this document to the clinic pharmacist for medicine fulfillment.</p>
            </div>

            <div className="text-right min-w-[220px]">
              <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-8">
                PRESCRIBING DOCTOR
              </p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {prescription.doctor || "Dr. Anaya Sharma"}
              </p>
              <p className="text-[11px] font-bold text-brand leading-tight">
                BDS, MDS — Chief Dental Surgeon
              </p>
              <p className="text-[10px] text-slate-600 font-medium">Oral & Maxillofacial Surgery</p>
              <p className="text-[9.5px] font-mono text-slate-500 mt-0.5">Reg No: DL-38492 / DCI</p>
            </div>
          </div>

          {/* 8. FOOTER */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[9.5px] text-slate-500 font-medium space-y-0.5">
            <p className="font-bold text-slate-700">
              SmileCare Dental Hospital • Greater Kailash & Connaught Place, New Delhi
            </p>
            <p>
              Phone: +91 98765 43210 | Email: support@smilecare.com | Website: www.smilecare.com
            </p>
            <p className="text-[8.5px] text-slate-400 uppercase tracking-widest pt-1">
              Computer-generated clinical prescription document
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
