import { useEffect, useState } from "react";
import api, { createVisitFromAppointment } from "../services/api";

function UpcomingAppointments({ refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/next7days");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to load upcoming appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  /* ================= START VISIT ================= */

  const startVisit = async (appointmentId) => {
    try {
      await createVisitFromAppointment(appointmentId);
      alert("Visit started successfully");
      fetchAppointments(); // refresh list
    } catch (error) {
      alert(
        error.response?.data?.error ||
        "Failed to start visit"
      );
    }
  };

  /* ================= DATE FORMATTER ================= */

  const formatDateTime = (date, time) => {
    const d = new Date(date);

    const formattedDate = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedTime = time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    return `${formattedDate} • ${formattedTime}`;
  };

  /* ================= UI ================= */

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Next 7 Days</h3>

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : appointments.length === 0 ? (
        <p style={styles.empty}>No upcoming appointments</p>
      ) : (
        <div style={styles.scrollArea}>
          {appointments.map((a) => (
            <div key={a.appointment_id} style={styles.item}>
              <div>
                <div style={styles.name}>{a.patient_name}</div>

                {/* ✅ CLEAN DATE + TIME */}
                <div style={styles.sub}>
                  {formatDateTime(
                    a.appointment_date,
                    a.appointment_time
                  )}
                </div>
              </div>

              {a.status !== "completed" && (
                <button
                  onClick={() => startVisit(a.appointment_id)}
                  style={styles.button}
                >
                  Start Visit
                </button>
              )}
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
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    height: 380,              // ✅ fixed card height
    display: "flex",
    flexDirection: "column",
  },

  title: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },

  scrollArea: {
    flex: 1,
    overflowY: "auto",        // ✅ scrollbar only here
    paddingRight: 6,
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    gap: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },

  sub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  empty: {
    fontSize: 13,
    color: "#64748b",
  },
};

export default UpcomingAppointments;
