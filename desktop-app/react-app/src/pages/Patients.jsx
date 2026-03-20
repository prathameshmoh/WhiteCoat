import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PatientAlerts from "../components/PatientAlerts";

/* ================= UTILITIES ================= */

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitial = (name = "") => name.charAt(0).toUpperCase();

/* ================= COMPONENT ================= */

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  /* ================= LOAD PATIENTS ================= */

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data.patients || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD PATIENT ================= */

  const savePatient = async () => {
    if (!fullName.trim()) {
      alert("Patient name is required");
      return;
    }

    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    try {
      const res = await api.post("/patients", {
        full_name: fullName.trim(),
        phone: phone || null,
        email: email.trim(),
        age: age || null,
        gender: gender || null,
      });

      const patientId = res.data.patient.patient_id;

      if (apptDate && apptTime) {
        await api.post("/appointments", {
          patient_id: patientId,
          appointment_date: apptDate,
          appointment_time: apptTime,
        });
      }

      // Reset
      setFullName("");
      setPhone("");
      setEmail("");
      setAge("");
      setGender("");
      setApptDate("");
      setApptTime("");
      setShowAddPatient(false);

      fetchPatients();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to add patient");
    }
  };

  /* ================= FILTER ================= */

  const filtered = patients.filter((p) =>
    `${p.full_name} ${p.phone || ""} ${p.email || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <div style={styles.leftHeader}>
          <input
            placeholder="Search by name, phone or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.search}
          />
          <button className="primary" onClick={() => setShowAddPatient(true)}>
            + Add Patient
          </button>
        </div>

        <div style={styles.patientList}>
          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={styles.muted}>No patients found</p>
          ) : (
            filtered.map((p) => (
              <div
                key={p.patient_id}
                style={styles.patientCard}
                onClick={() => navigate(`/patients/${p.patient_id}`)}
              >
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {getInitial(p.full_name)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.patientName}>
                      {p.full_name}
                    </div>
                    <div style={styles.meta}>
                      {p.phone || "—"} • {p.age || "—"} yrs •{" "}
                      {p.gender || "—"} <br />
                      {p.email || "No email"}
                    </div>

                    <PatientAlerts alerts={p.alerts || []} compact />
                  </div>
                </div>

                {p.next_appointment_date && (
                  <span style={styles.badgeBlue}>
                    Appointment: {formatDate(p.next_appointment_date)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showAddPatient && (
        <Modal onClose={() => setShowAddPatient(false)}>
          <h3>Add Patient</h3>

          <input
            placeholder="Full name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={styles.input}
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={styles.input}
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <hr />

          <p style={{ fontSize: 13, color: "#64748b" }}>
            Optional appointment
          </p>

          <input
            type="date"
            value={apptDate}
            onChange={(e) => setApptDate(e.target.value)}
            style={styles.input}
          />

          <input
            type="time"
            value={apptTime}
            onChange={(e) => setApptTime(e.target.value)}
            style={styles.input}
          />

          <div style={styles.modalActions}>
            <button className="primary" onClick={savePatient}>
              Save Patient
            </button>
            <button onClick={() => setShowAddPatient(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: { height: "100%" },
  leftPanel: {
    background: "#f9fafb",
    borderRadius: 14,
    padding: 16,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  leftHeader: { display: "flex", gap: 10, marginBottom: 12 },
  search: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" },
  patientList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 },
  patientCard: { background: "white", borderRadius: 12, padding: 14, cursor: "pointer" },
  cardTop: { display: "flex", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" },
  patientName: { fontWeight: 600 },
  meta: { fontSize: 13, color: "#64748b" },
  badgeBlue: { marginTop: 8, padding: "4px 10px", background: "#2563eb", color: "#fff", borderRadius: 999, fontSize: 12 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: 22, borderRadius: 14, width: 400 },
  input: { width: "100%", padding: 10, marginBottom: 10 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  muted: { color: "#64748b" },
};

export default Patients;