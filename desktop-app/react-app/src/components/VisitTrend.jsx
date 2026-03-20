import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function VisitTrend({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics/visit-trend");
        setData(res.data);
      } catch (err) {
        console.error("Visit trend error", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrend();
  }, [refreshKey]);

  if (loading) {
    return <div style={styles.card}>Loading visit trend…</div>;
  }

  if (!data.length) {
    return <div style={styles.card}>No visit data available</div>;
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Visits",
        data: data.map((d) => d.count),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Visit Trend</h3>
      <Line data={chartData} />
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  title: {
    marginBottom: 14,
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
  },
};

export default VisitTrend;
