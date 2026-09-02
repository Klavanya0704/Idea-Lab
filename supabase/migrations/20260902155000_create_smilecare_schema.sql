-- SmileCare Dental Hospital Database Migration Schema
-- Generated: 2026-09-02

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    specialization TEXT DEFAULT 'Chief Dental Surgeon',
    role TEXT DEFAULT 'Doctor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    registration_date DATE DEFAULT CURRENT_DATE,
    registration_time TEXT DEFAULT TO_CHAR(NOW(), 'HH12:MI AM'),
    patient_type TEXT DEFAULT 'New Patient',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    treatment TEXT NOT NULL,
    reason_for_visit TEXT,
    status TEXT DEFAULT 'Confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TREATMENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.treatment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    treatment TEXT,
    clinical_findings TEXT,
    treatment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLINICAL NOTES TABLE
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    findings TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    instructions TEXT,
    prescription_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRESCRIPTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEDICAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL,
    report_title TEXT,
    report_date DATE DEFAULT CURRENT_DATE,
    report_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FOLLOW UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    follow_up_date DATE NOT NULL,
    follow_up_time TEXT,
    purpose TEXT,
    status TEXT DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC WEBSITE POLICIES (Allows patient registration & booking)
CREATE POLICY "Public insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select patients by phone/email" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select appointments" ON public.appointments FOR SELECT USING (true);

-- 2. AUTHENTICATED DOCTOR POLICIES
CREATE POLICY "Authenticated doctor doctors access" ON public.doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor patients access" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor appointments access" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor treatments access" ON public.treatment_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor clinical notes access" ON public.clinical_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor prescriptions access" ON public.prescriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor prescription items access" ON public.prescription_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor medical reports access" ON public.medical_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated doctor follow ups access" ON public.follow_ups FOR ALL USING (auth.role() = 'authenticated');

-- SEED INITIAL DEMO DATA FOR SMILECARE
INSERT INTO public.doctors (full_name, email, phone, specialization, role)
VALUES ('Dr. Anaya Sharma', 'doctor@smilecare.com', '+91 98765 00000', 'Chief Dental Surgeon', 'Doctor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.patients (patient_code, full_name, age, gender, phone, email, address, medical_history, allergies, registration_date, patient_type, status)
VALUES
('P001', 'Priya Sharma', '28', 'Female', '+91 98765 43210', 'priya@gmail.com', 'Block B, Greater Kailash, New Delhi', 'None reported', 'Penicillin', '2026-09-02', 'New Patient', 'Active'),
('P002', 'Rahul Mehta', '35', 'Male', '+91 98765 43121', 'rahul@gmail.com', 'Sector 15, Gurgaon, Haryana', 'Mild Hypertension', 'None', '2026-08-28', 'New Patient', 'Active'),
('P003', 'Sneha Reddy', '24', 'Female', '+91 98765 43876', 'sneha@gmail.com', 'Vasant Kunj, New Delhi', 'Asthma', 'Dust, Pollen', '2026-08-25', 'New Patient', 'Active'),
('P004', 'Arjun Kumar', '42', 'Male', '+91 98765 43456', 'arjun@gmail.com', 'Noida Sector 62, Uttar Pradesh', 'Type 2 Diabetes (Controlled)', 'Sulfa drugs', '2026-08-20', 'Returning Patient', 'Follow-up'),
('P005', 'Anjali Rao', '31', 'Female', '+91 98765 43987', 'anjali@gmail.com', 'Saket, New Delhi', 'None', 'None', '2026-08-18', 'New Patient', 'Active')
ON CONFLICT (patient_code) DO NOTHING;
