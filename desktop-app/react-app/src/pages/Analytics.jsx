import { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  /* ================= API CALLS ================= */

  const fetchSummary = useCallback(async () => {
    const res = await api.get("/analytics/summary");
    setSummary(res.data);
  }, []);

  const fetchAvailableYears = useCallback(async () => {
    const res = await api.get("/analytics/years");
    setYears(res.data);
  }, []);

  const fetchMonthlyAnalytics = useCallback(async () => {
    const res = await api.get(`/analytics/monthly?year=${selectedYear}`);
    setMonthlyData(res.data);
  }, [selectedYear]);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchSummary(), fetchAvailableYears()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [fetchSummary, fetchAvailableYears]);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    fetchMonthlyAnalytics();
  }, [fetchMonthlyAnalytics]);

  /* ================= STATES ================= */

  if (loading) {
    return <div style={styles.center}>Loading analytics…</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!summary) {
    return <div style={styles.center}>No analytics data</div>;
  }

  const chartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: "Visits",
        data: monthlyData.map((m) => m.count),
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        barThickness: 26,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} visits`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div style={styles.page}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Analytics Overview</h2>
          <p style={styles.pageSub}>
            Insights into clinic performance
          </p>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Time</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div style={styles.grid}>
        <StatCard
          title="Today's Visits"
          value={summary.todayVisits}
          color="#2563eb"
        />
        <StatCard
          title="Total Patients"
          value={summary.totalPatients}
          color="#16a34a"
        />
        <StatCard
          title="This Month Visits"
          value={summary.monthVisits}
          color="#f59e0b"
        />
        <StatCard
          title="Upcoming Appointments"
          value={summary.upcomingAppointments}
          color="#ef4444"
        />
      </div>

      {/* ===== CHART ===== */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>
          Monthly Visits (
          {selectedYear === "all" ? "All Time" : selectedYear})
        </h3>

        {monthlyData.length === 0 ? (
          <p style={styles.empty}>
            No data available for this period
          </p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

/* ================= KPI CARD ================= */

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <p style={styles.cardTitle}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 28,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  pageSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },
  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 32,
  },
  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 13,
    color: "#64748b",
  },
  cardValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: 700,
  },
  chartCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  chartTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 600,
  },
  empty: {
    fontSize: 13,
    color: "#64748b",
  },
  center: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
  },
  error: {
    padding: 24,
    color: "#dc2626",
  },
};

export default Analytics;
