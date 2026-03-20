import { useEffect, useState } from "react";
import api from "../services/api";

function DashboardCards({ refreshKey = 0 }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError(false);
        const res = await api.get("/dashboard/summary");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError(true);
      }
    };

    loadStats();
  }, [refreshKey]); // ✅ correct dependency

  /* ---------- STATES ---------- */

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.error}>Failed to load dashboard stats</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading dashboard stats…</div>
      </div>
    );
  }

  /* ---------- DATA ---------- */

  const items = [
    {
      label: "Total Patients",
      value: stats.total_patients,
      color: "#2563eb",
    },
    {
      label: "New Patients",
      value: stats.new_patients || 0,
      color: "#06b6d4",
    },
    {
      label: "Today’s Appointments",
      value: stats.todays_appointments,
      color: "#f59e0b",
    },
    {
      label: "Upcoming",
      value: stats.upcoming_appointments,
      color: "#f97316",
    },
    {
      label: "Cancelled",
      value: stats.cancelled_appointments || 0,
      color: "#ef4444",
    },
  ];

  /* ---------- UI ---------- */

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        {items.map((item, index) => (
          <div key={index} style={styles.stat}>
            <span
              style={{
                ...styles.dot,
                backgroundColor: item.color,
              }}
            />
            <div style={styles.value}>{item.value}</div>
            <div style={styles.label}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "white",
    borderRadius: 14,
    padding: "18px 22px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    marginBottom: 24,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 28,
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginBottom: 10,
  },

  value: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.1,
  },

  label: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  loading: {
    fontSize: 14,
    color: "#64748b",
  },

  error: {
    fontSize: 14,
    color: "#dc2626",
  },
};

export default DashboardCards;
