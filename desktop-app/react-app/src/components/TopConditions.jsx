import { useEffect, useState } from "react";
import api from "../services/api";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#3b82f6",
];

function TopConditions({ refreshKey = 0 }) {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConditions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics/top-conditions");
        setConditions(res.data);
      } catch (err) {
        console.error("Top conditions error", err);
      } finally {
        setLoading(false);
      }
    };

    loadConditions();
  }, [refreshKey]);

  if (loading) {
    return <div style={styles.card}>Loading conditions…</div>;
  }

  if (!conditions.length) {
    return <div style={styles.card}>No condition data</div>;
  }

  const max = Math.max(...conditions.map((c) => c.count));

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Top Conditions</h3>
        <span style={styles.subtitle}>Most frequent diagnoses</span>
      </div>

      {conditions.map((item, index) => {
        const width = (item.count / max) * 100;

        return (
          <div key={item.condition_name} style={styles.row}>
            {/* 🔹 Label + Count */}
            <div style={styles.labelRow}>
              <span style={styles.label}>
                {item.condition_name}
              </span>
              <span style={styles.countBadge}>
                {item.count}
              </span>
            </div>

            {/* 🔹 Progress Bar */}
            <div style={styles.barBg}>
              <div
                style={{
                  ...styles.bar,
                  width: `${width}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =======================
   PREMIUM STYLES
======================= */
const styles = {
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "20px 22px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  row: {
    marginBottom: 16,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "#334155",
  },
  countBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#0f172a",
  },
  barBg: {
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.6s ease",
  },
};

export default TopConditions;
