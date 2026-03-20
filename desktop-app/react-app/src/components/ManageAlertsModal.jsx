import { useState } from "react";
import api from "../services/api";
import PatientAlerts from "./PatientAlerts";

function ManageAlertsModal({ patient, onClose, onSaved }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("allergy");
  const [severity, setSeverity] = useState("medium");
  const [loading, setLoading] = useState(false);

  /* ================= ADD ALERT ================= */
  const addAlert = async () => {
    if (loading) return; // 🚫 prevents double add

    if (!label.trim()) {
      alert("Alert label is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/patient-alerts", {
        patient_id: patient.patient_id,
        type,
        label: label.trim(),
        severity,
      });

      setLabel("");
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Failed to add alert");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ALERT ================= */
  const removeAlert = async (alert_id) => {
    if (!alert_id) return;

    if (!window.confirm("Remove this alert?")) return;

    try {
      await api.delete(`/patient-alerts/${alert_id}`);
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Failed to remove alert");
    }
  };

  return (
    <div>
      <h3>Patient Alerts / Allergies</h3>

      {/* EXISTING ALERTS */}
      {patient.alerts?.length > 0 ? (
        patient.alerts.map((a) => (
          <div key={a.alert_id} style={styles.alertRow}>
            <PatientAlerts alerts={[a]} />
            <button
              type="button"
              style={styles.removeBtn}
              onClick={() => removeAlert(a.alert_id)}
            >
              ✕
            </button>
          </div>
        ))
      ) : (
        <p style={styles.muted}>No alerts added</p>
      )}

      <hr />

      {/* ADD NEW ALERT */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={styles.input}
      >
        <option value="allergy">Allergy</option>
        <option value="alert">Alert</option>
      </select>

      <input
        type="text"
        placeholder="Alert label (e.g. Penicillin)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        style={styles.input}
        autoFocus
      />

      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        style={styles.input}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <div style={styles.actions}>
        <button
          className="primary"
          onClick={addAlert}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Alert"}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  alertRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  removeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 16,
    cursor: "pointer",
    color: "#dc2626",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  muted: {
    fontSize: 13,
    color: "#64748b",
  },
};

export default ManageAlertsModal;
