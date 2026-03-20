-- ===============================
-- CLINIC MANAGEMENT DATABASE
-- ===============================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- DOCTORS
-- ===============================
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  clinic_name VARCHAR(150),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- PATIENTS
-- ===============================
CREATE TABLE IF NOT EXISTS patients (
  patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  age INT,
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- ===============================
-- PATIENT ALERTS (ALLERGIES / ALERTS)
-- ===============================
CREATE TABLE IF NOT EXISTS patient_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,

  -- allergy | alert (non-diagnostic flags)
  type VARCHAR(20) NOT NULL CHECK (type IN ('allergy', 'alert')),

  -- e.g. "Penicillin", "Diabetic – monitor sugar"
  label VARCHAR(100) NOT NULL,

  -- visual importance only
  severity VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high')),

  created_at TIMESTAMP DEFAULT NOW(),

  -- prevent duplicate same alert
  UNIQUE (patient_id, type, label)
);

CREATE INDEX IF NOT EXISTS idx_patient_alerts_patient
  ON patient_alerts(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_alerts_doctor
  ON patient_alerts(doctor_id);

CREATE INDEX IF NOT EXISTS idx_patient_alerts_severity
  ON patient_alerts(severity);

-- ===============================
-- APPOINTMENTS
-- ===============================
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'UPCOMING',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor
  ON appointments(doctor_id);

CREATE INDEX IF NOT EXISTS idx_appointments_date
  ON appointments(appointment_date);

-- ===============================
-- VISITS
-- ===============================
CREATE TABLE IF NOT EXISTS visits (
  visit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(appointment_id),
  visit_date DATE DEFAULT CURRENT_DATE,
  condition_name VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_condition ON visits(condition_name);
