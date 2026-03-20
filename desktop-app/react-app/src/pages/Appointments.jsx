import { useEffect, useState } from "react";
import api from "../services/api";

/* ================= UTIL ================= */

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (time) =>
  time ? time.slice(0, 5) : "—";

/* ================= COMPONENT ================= */

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming"); // upcoming | today | all

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      setAppointments(res.data.appointments || []);
    } catch {
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = appointments.filter((a) => {
    if (filter === "today") return a.appointment_date === todayStr;
    if (filter === "upcoming") return a.appointment_date >= todayStr;
    return true;
  });

  return (
    <div style={styles.wrapper}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <h2 style={styles.title}>Appointments</h2>

        <div style={styles.filters}>
          <FilterButton
            label="Upcoming"
            active={filter === "upcoming"}
            onClick={() => setFilter("upcoming")}
          />
          <FilterButton
            label="Today"
            active={filter === "today"}
            onClick={() => setFilter("today")}
          />
          <FilterButton
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div style={styles.list}>
        {loading ? (
          <p style={styles.muted}>Loading appointments…</p>
        ) : filtered.length === 0 ? (
          <p style={styles.muted}>No appointments found</p>
        ) : (
          filtered.map((a) => (
            <div key={a.appointment_id} style={styles.card}>
              <div>
                <div style={styles.name}>
                  {a.patient_name}
                </div>
                <div style={styles.meta}>
                  📅 {formatDate(a.appointment_date)} • ⏰{" "}
                  {formatTime(a.appointment_time)}
                </div>
              </div>

              <span
                style={{
                  ...styles.badge,
                  ...(a.appointment_date === todayStr
                    ? styles.today
                    : styles.upcoming),
                }}
              >
                {a.appointment_date === todayStr
                  ? "Today"
                  : "Upcoming"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= FILTER BTN ================= */

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.filterBtn,
        ...(active ? styles.filterActive : {}),
      }}
    >
      {label}
    </button>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    maxWidth: 900,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
  },

  filters: {
    display: "flex",
    gap: 8,
  },

  filterBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },

  filterActive: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e5e7eb",
  },

  name: {
    fontWeight: 600,
    fontSize: 15,
  },

  meta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  today: {
    background: "#dcfce7",
    color: "#166534",
  },

  upcoming: {
    background: "#eff6ff",
    color: "#1d4ed8",
  },

  muted: {
    color: "#64748b",
    fontSize: 14,
  },
};

export default Appointments;



