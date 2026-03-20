import { useEffect, useState } from "react";
import api from "../services/api";

function PatientTimeline({ patientId: externalPatientId, refreshKey }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(
    externalPatientId || ""
  );
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PATIENT LIST ================= */
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.get("/patients");
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error("Failed to load patients", err);
      }
    };

    loadPatients();
  }, []);

  /* ================= SYNC FROM DASHBOARD ================= */
  useEffect(() => {
    if (externalPatientId) {
      setSelectedPatientId(externalPatientId);
    }
  }, [externalPatientId]);

  /* ================= LOAD TIMELINE ================= */
  useEffect(() => {
    if (!selectedPatientId) return;

    const loadTimeline = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/patients/${selectedPatientId}/timeline`
        );
        setTimeline(res.data.timeline || []);
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [selectedPatientId, refreshKey]);

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={styles.title}>Patient Timeline</h3>

        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          style={styles.select}
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* STATES */}
      {!selectedPatientId && (
        <div style={styles.empty}>
          👤 Select a patient to view visit history
        </div>
      )}

      {loading && (
        <div style={styles.loading}>Loading timeline…</div>
      )}

      {!loading && selectedPatientId && timeline.length === 0 && (
        <div style={styles.empty}>No visits recorded yet</div>
      )}

      {/* TIMELINE */}
      {!loading && selectedPatientId && timeline.length > 0 && (
        <div style={styles.timeline}>
          {timeline.map((v, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.dot} />

              <div style={styles.content}>
                <div style={styles.row}>
                  <span style={styles.condition}>
                    {v.condition_name}
                  </span>

                  {/* ✅ CLEAN DATE */}
                  <span style={styles.date}>
                    {formatDate(v.visit_date)}
                  </span>
                </div>

                {v.notes && (
                  <div style={styles.notes}>{v.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "white",
    padding: 18,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    height: 380,                 // ✅ fixed height
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
  },

  select: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13,
    background: "#f9fafb",
  },

  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#64748b",
  },

  loading: {
    padding: "16px 10px",
    fontSize: 14,
    color: "#64748b",
  },

  timeline: {
    flex: 1,
    overflowY: "auto",          // ✅ scrollbar only here
    paddingRight: 6,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  item: {
    display: "flex",
    gap: 14,
  },

  dot: {
    width: 10,
    height: 10,
    background: "#3b82f6",
    borderRadius: "50%",
    marginTop: 6,
    flexShrink: 0,
  },

  content: {
    background: "#f8fafc",
    padding: "10px 12px",
    borderRadius: 8,
    flex: 1,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 10,
  },

  condition: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },

  date: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  notes: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.4,
  },
};

export default PatientTimeline;
