import { useEffect, useState } from "react";
import api from "../services/api";

function TodayPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get("/appointments/today").then((res) => {
      setPatients(res.data.appointments || []);
    });
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.header}>Today’s Patients</div>

      {patients.length === 0 ? (
        <p style={styles.empty}>No patients today</p>
      ) : (
        patients.map((p, i) => (
          <div key={i} style={styles.row}>
            <div style={styles.left}>
              <span
                style={{
                  ...styles.dot,
                  background:
                    p.type === "walk-in" ? "#10b981" : "#3b82f6",
                }}
              />
              <div>
                <div style={styles.name}>{p.patient_name}</div>
                {p.type === "walk-in" && (
                  <div style={styles.sub}>Walk-in</div>
                )}
              </div>
            </div>

            <div style={styles.time}>{p.time}</div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  header: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },

  name: {
    fontSize: 14,
    fontWeight: 500,
  },

  sub: {
    fontSize: 12,
    color: "#64748b",
  },

  time: {
    fontSize: 13,
    color: "#475569",
  },

  empty: {
    fontSize: 13,
    color: "#64748b",
  },
};

export default TodayPatients;
