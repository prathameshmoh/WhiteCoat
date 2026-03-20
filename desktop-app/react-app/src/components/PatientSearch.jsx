import { useState } from "react";
import api from "../services/api";

function PatientSearch({ onVisitSaved, onPatientSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

  // New patient
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("");

  // Optional appointment
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [saving, setSaving] = useState(false);

  /* ================= SEARCH ================= */

  const searchPatients = async (value) => {
    const trimmed = value.trim();
    setQuery(value);

    if (!trimmed) {
      setResults([]);
      return;
    }

    try {
      const res = await api.get(`/patients/search?q=${trimmed}`);
      setResults(res.data.patients || []);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  /* ================= SAVE VISIT ================= */

  const saveVisit = async () => {
    if (!condition.trim()) {
      alert("Condition is required");
      return;
    }

    try {
      setSaving(true);

      await api.post("/visits", {
        patient_id: selectedPatient.patient_id,
        condition_name: condition.trim(),
        notes: notes.trim(),
      });

      onVisitSaved?.();
      onPatientSelect?.(selectedPatient.patient_id);

      resetAll();
    } catch (err) {
      console.error(err);
      alert("Failed to save visit");
    } finally {
      setSaving(false);
    }
  };

  /* ================= EMAIL VALIDATION ================= */

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /* ================= SAVE NEW PATIENT ================= */

  const saveNewPatient = async () => {
    const name = newPatientName.trim();
    const email = newPatientEmail.trim();

    if (!name) {
      alert("Patient name is required");
      return;
    }

    if (!email) {
      alert("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Enter a valid email");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/patients", {
        full_name: name,
        phone: newPatientPhone.trim() || null,
        email: email,
        age: newPatientAge || null,
        gender: newPatientGender || null,
      });

      const patient = res.data.patient;

      // Optional appointment
      if (appointmentDate && appointmentTime) {
        await api.post("/appointments", {
          patient_id: patient.patient_id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
        });
      }

      onVisitSaved?.();
      onPatientSelect?.(patient.patient_id);

      resetAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add patient");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RESET ================= */

  const resetAll = () => {
    setShowNewPatientForm(false);
    setSelectedPatient(null);

    setNewPatientName("");
    setNewPatientPhone("");
    setNewPatientEmail("");
    setNewPatientAge("");
    setNewPatientGender("");
    setAppointmentDate("");
    setAppointmentTime("");

    setCondition("");
    setNotes("");
    setQuery("");
    setResults([]);
  };

  /* ================= UI ================= */

  return (
    <div style={styles.wrapper}>
      <input
        placeholder="Search patient by name, phone or email"
        value={query}
        onChange={(e) => searchPatients(e.target.value)}
        style={styles.searchInput}
      />

      {/* ➕ Add New Patient */}
      {query && results.length === 0 && (
        <button
          style={styles.addPatientBtn}
          onClick={() => setShowNewPatientForm(true)}
        >
          <div style={styles.addIcon}>+</div>
          <div>
            <div style={styles.addTitle}>Add New Patient</div>
            <div style={styles.addSub}>
              No patient found for this search
            </div>
          </div>
        </button>
      )}

      {/* Existing patients */}
      {results.map((p) => (
        <div key={p.patient_id} style={styles.resultCard}>
          <b>{p.full_name}</b> ({p.phone || "No phone"})
          <br />

          <span style={{ fontSize: 12, color: "#64748b" }}>
            {p.email || "No email"}
          </span>

          <br />

          {p.total_visits > 0 ? (
            <span style={{ color: "green" }}>
              ✔ Existing | Last visit: {p.last_visit_date || "—"}
            </span>
          ) : (
            <span style={{ color: "blue" }}>➕ New patient</span>
          )}

          {p.total_visits > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                className="primary"
                onClick={() => {
                  setSelectedPatient(p);
                  onPatientSelect?.(p.patient_id);
                }}
              >
                Add Visit
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 🩺 Add Visit */}
      {selectedPatient && (
        <div style={styles.modal}>
          <h3>Add Visit – {selectedPatient.full_name}</h3>

          <input
            placeholder="Condition / Complaint"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.textarea}
          />

          <button className="primary" disabled={saving} onClick={saveVisit}>
            {saving ? "Saving..." : "Save Visit"}
          </button>

          <button onClick={resetAll}>Cancel</button>
        </div>
      )}

      {/* 👤 Add New Patient */}
      {showNewPatientForm && (
        <div style={styles.modal}>
          <h3>Add New Patient</h3>

          <input
            placeholder="Full Name"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Phone"
            value={newPatientPhone}
            onChange={(e) => setNewPatientPhone(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email *"
            value={newPatientEmail}
            onChange={(e) => setNewPatientEmail(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Age"
            value={newPatientAge}
            onChange={(e) => setNewPatientAge(e.target.value)}
            style={styles.input}
          />

          <select
            value={newPatientGender}
            onChange={(e) => setNewPatientGender(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <hr />

          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            style={styles.input}
          />

          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            style={styles.input}
          />

          <p style={{ fontSize: 12, color: "#64748b" }}>
            (Optional) Schedule first appointment
          </p>

          <button
            className="primary"
            disabled={saving}
            onClick={saveNewPatient}
          >
            {saving ? "Saving..." : "Save Patient"}
          </button>

          <button onClick={resetAll}>Cancel</button>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    background: "white",
    padding: 16,
    borderRadius: 10,
  },
  searchInput: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
  },
  addPatientBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: 12,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 600,
  },
  addTitle: { fontSize: 15, fontWeight: 600 },
  addSub: { fontSize: 12, opacity: 0.9 },
  resultCard: {
    border: "1px solid #e5e7eb",
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  modal: {
    marginTop: 20,
    padding: 15,
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: 8,
  },
  input: {
    width: "100%",
    marginBottom: 8,
    padding: 8,
  },
  textarea: {
    width: "100%",
    marginBottom: 8,
    padding: 8,
    minHeight: 60,
  },
};

export default PatientSearch;