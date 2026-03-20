import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PatientTimeline from "../components/PatientTimeline";
import PatientAlerts from "../components/PatientAlerts";
import ManageAlertsModal from "../components/ManageAlertsModal";

function PatientDetails() {
  const { id } = useParams(); // ✅ route param
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptNotes, setApptNotes] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  /* ================= LOAD PATIENT ================= */

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data.patient);
      } catch (error) {
        console.error(error);
        alert("Failed to load patient");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, refreshKey]);

  /* ================= FORMAT DATE ================= */

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ================= SAVE VISIT ================= */

  const saveVisit = async () => {
    if (!condition.trim()) {
      alert("Condition is required");
      return;
    }

    await api.post("/visits", {
      patient_id: id,
      condition_name: condition.trim(),
      notes,
    });

    setCondition("");
    setNotes("");
    setShowVisitModal(false);
    setRefreshKey((k) => k + 1);
  };

  /* ================= SAVE APPOINTMENT ================= */

  const saveAppointment = async () => {
    if (!apptDate || !apptTime) {
      alert("Date & time required");
      return;
    }

    await api.post("/appointments", {
      patient_id: id,
      appointment_date: apptDate,
      appointment_time: apptTime,
      notes: apptNotes,
    });

    setApptDate("");
    setApptTime("");
    setApptNotes("");
    setShowApptModal(false);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading patient details…</p>;
  }

  if (!patient) {
    return <p style={{ padding: 20 }}>Patient not found</p>;
  }

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <button onClick={() => navigate("/patients")} style={styles.backBtn}>
          ← Back
        </button>

        <div style={styles.identity}>
          <div style={styles.avatar}>
            {patient.full_name?.[0] || "P"}
          </div>

          <div>
            <h2 style={styles.name}>{patient.full_name}</h2>
            <div style={styles.sub}>
              {patient.age || "—"} yrs • {patient.gender || "—"}
            </div>
            <div style={styles.sub}>{patient.phone || "—"}</div>

            {patient.alerts?.length > 0 && (
              <PatientAlerts alerts={patient.alerts} />
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={() => setShowAlertsModal(true)}>
            ⚠️ Manage Alerts
          </button>
          <button onClick={() => setShowApptModal(true)}>
            📅 Schedule Appointment
          </button>
          <button className="primary" onClick={() => setShowVisitModal(true)}>
            + Add Visit
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div style={styles.stats}>
        <StatCard label="Total Visits" value={patient.total_visits || 0} />
        <StatCard label="First Visit" value={formatDate(patient.first_visit_date)} />
        <StatCard label="Last Visit" value={formatDate(patient.last_visit_date)} />
      </div>

      {/* ================= TIMELINE ================= */}
      <div style={styles.timelineCard}>
        <PatientTimeline patientId={id} refreshKey={refreshKey} />
      </div>

      {/* ================= VISIT MODAL ================= */}
      {showVisitModal && (
        <Modal onClose={() => setShowVisitModal(false)}>
          <h3>Add Visit</h3>

          {patient.alerts?.length > 0 && (
            <>
              <strong>⚠️ Patient Alerts</strong>
              <PatientAlerts alerts={patient.alerts} />
            </>
          )}

          <input
            placeholder="Condition"
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

          <div style={styles.modalActions}>
            <button className="primary" onClick={saveVisit}>
              Save
            </button>
            <button onClick={() => setShowVisitModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ================= APPOINTMENT MODAL ================= */}
      {showApptModal && (
        <Modal onClose={() => setShowApptModal(false)}>
          <h3>Schedule Appointment</h3>

          <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} style={styles.input} />
          <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} style={styles.input} />

          <textarea
            placeholder="Notes"
            value={apptNotes}
            onChange={(e) => setApptNotes(e.target.value)}
            style={styles.textarea}
          />

          <div style={styles.modalActions}>
            <button className="primary" onClick={saveAppointment}>
              Schedule
            </button>
            <button onClick={() => setShowApptModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ================= ALERTS MODAL ================= */}
      {showAlertsModal && (
        <ManageAlertsModal
          patient={patient}
          onClose={() => setShowAlertsModal(false)}
          onSaved={() => {
            setShowAlertsModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: { background: "#fff", padding: 28, borderRadius: 14, height: "100%", overflow: "auto" },
  header: { display: "flex", gap: 16, marginBottom: 28, alignItems: "center" },
  backBtn: { border: "1px solid #e5e7eb", padding: "6px 12px", borderRadius: 8 },
  identity: { display: "flex", gap: 14, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  name: { margin: 0, fontSize: 22 },
  sub: { fontSize: 13, color: "#64748b" },
  actions: { display: "flex", gap: 8 },
  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 },
  statCard: { border: "1px solid #e5e7eb", padding: 16, borderRadius: 12 },
  statLabel: { fontSize: 13, color: "#64748b" },
  statValue: { fontSize: 22, fontWeight: 600 },
  timelineCard: { border: "1px solid #e5e7eb", padding: 18, borderRadius: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: 22, borderRadius: 14, width: 420 },
  input: { width: "100%", padding: 10, marginBottom: 10 },
  textarea: { width: "100%", minHeight: 80, padding: 10 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },
};

export default PatientDetails;
