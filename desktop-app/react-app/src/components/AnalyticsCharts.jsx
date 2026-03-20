import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

/* ================= UTIL ================= */

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y.toString());
  }
  return years;
};

function AnalyticsCharts({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(""); // "" = All Time
  const [range, setRange] = useState("12m");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
  let mounted = true;

  const fetchData = async () => {
    try {
      const res = await api.get("/analytics/monthly-visits", {
        params: {
          year: year || undefined,
          range,
        },
      });

      if (mounted) {
        setData(res.data?.data || []);
      }
    } catch {
      if (mounted) {
        setData([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    mounted = false;
  };
}, [year, range, refreshKey]);


  /* ================= CHART DATA ================= */

  const chartData = {
    labels: data.length
      ? data.map((d) => d.month)
      : ["No Data"],
    datasets: [
      {
        label: "Visits",
        data: data.length ? data.map((d) => d.count) : [0],
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  /* ================= RENDER ================= */

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>Monthly Visits</div>

        <div style={styles.filters}>
          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => {
              const val = e.target.value;
              setYear(val);
              if (val === "") setRange("12m");
            }}
          >
            <option value="">All Time</option>
            {getYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* RANGE */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            disabled={year === ""}
          >
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
        </div>
      </div>

      <div style={styles.chartBox}>
        {loading ? (
          <div style={styles.empty}>Loading chart…</div>
        ) : (
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
  },

  filters: {
    display: "flex",
    gap: 8,
  },

  chartBox: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    fontSize: 14,
    color: "#64748b",
  },
};

export default AnalyticsCharts;
