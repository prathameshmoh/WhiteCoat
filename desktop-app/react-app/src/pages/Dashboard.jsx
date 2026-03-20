import { useState, useEffect } from "react";
import api from "../services/api";

import PatientSearch from "../components/PatientSearch";
import DashboardCards from "../components/DashboardCards";
import VisitTrend from "../components/VisitTrend";
import TodayPatients from "../components/TodayPatients";
import TopConditions from "../components/TopConditions";
import PatientTimeline from "../components/PatientTimeline";
import UpcomingAppointments from "../components/UpcomingAppointments";

function Dashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [plan, setPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  /* ================= FETCH PLAN ================= */

  const fetchPlan = async () => {
    try {
      const res = await api.get("/protected");
      setPlan(res.data.plan || "free");
    } catch (err) {
      console.error("Failed to fetch plan", err);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  /* ================= HANDLE UPGRADE ================= */

  const handleUpgrade = async () => {
    try {
      await api.post("/subscription/upgrade", {
        plan: "starter",
      });

      alert("🎉 Plan upgraded successfully!");
      fetchPlan(); // refresh plan

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upgrade failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      {/* ================= PLAN HEADER ================= */}
      <div style={styles.planBar}>
        <div>
          Plan:{" "}
          <span
            style={{
              fontWeight: 700,
              color: plan === "free" ? "#ef4444" : "#16a34a",
            }}
          >
            {loadingPlan ? "Loading..." : plan.toUpperCase()}
          </span>
        </div>

        {plan === "free" && (
          <button style={styles.upgradeBtn} onClick={handleUpgrade}>
            Upgrade 🚀
          </button>
        )}
      </div>

      {/* ================= PATIENT SEARCH ================= */}
      <div style={styles.section}>
        <PatientSearch
          onVisitSaved={() => setRefreshKey((v) => v + 1)}
          onPatientSelect={(id) => setSelectedPatientId(id)}
        />
      </div>

      {/* ================= DASHBOARD CARDS ================= */}
      <div style={styles.section}>
        <DashboardCards refreshKey={refreshKey} />
      </div>

      {/* ================= ROW 1 ================= */}
      <div style={styles.threeColGrid}>
        <TodayPatients refreshKey={refreshKey} />

        <VisitTrend refreshKey={refreshKey} />

        <TopConditions refreshKey={refreshKey} />
      </div>

      {/* ================= ROW 2 ================= */}
      <div style={styles.twoColGrid}>
        <PatientTimeline
          patientId={selectedPatientId}
          refreshKey={refreshKey}
        />

        {/* 🔒 LOCK FEATURE FOR FREE USERS */}
        {plan === "free" ? (
          <div style={styles.lockedCard}>
            🔒 Upcoming Appointments (Premium Feature)
            <br />
            <button style={styles.upgradeBtn} onClick={handleUpgrade}>
              Upgrade to Unlock
            </button>
          </div>
        ) : (
          <UpcomingAppointments refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  section: {
    marginBottom: 28,
  },

  planBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: "12px 16px",
    background: "#f1f5f9",
    borderRadius: 10,
  },

  upgradeBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  lockedCard: {
    background: "#fff1f2",
    border: "1px solid #fecaca",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
  },

  threeColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24,
    marginBottom: 28,
  },

  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 24,
  },
};

export default Dashboard;