const pool = require("../config/db");

/* ================= ADD ALERT ================= */
const addAlert = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { patient_id, type, label, severity } = req.body;

    if (!patient_id || !type || !label) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔒 Ensure patient belongs to logged-in doctor
    const patientCheck = await pool.query(
      `
      SELECT 1 FROM patients
      WHERE patient_id = $1 AND doctor_id = $2
      `,
      [patient_id, doctor_id]
    );

    if (patientCheck.rowCount === 0) {
      return res.status(403).json({ error: "Unauthorized patient access" });
    }

    const result = await pool.query(
      `
      INSERT INTO patient_alerts (patient_id, type, label, severity)
      VALUES ($1, $2, $3, $4)
      RETURNING alert_id, patient_id, type, label, severity, created_at
      `,
      [patient_id, type, label, severity || "medium"]
    );

    res.status(201).json({
      message: "Alert added successfully",
      alert: result.rows[0],
    });
  } catch (error) {
    console.error("ADD ALERT ERROR:", error);
    res.status(500).json({ error: "Failed to add alert" });
  }
};

/* ================= DELETE ALERT ================= */
const deleteAlert = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { alert_id } = req.params;

    if (!alert_id) {
      return res.status(400).json({ error: "Alert ID required" });
    }

    // 🔒 Ensure alert belongs to this doctor's patient
    const result = await pool.query(
      `
      DELETE FROM patient_alerts pa
      USING patients p
      WHERE pa.alert_id = $1
        AND pa.patient_id = p.patient_id
        AND p.doctor_id = $2
      RETURNING pa.alert_id
      `,
      [alert_id, doctor_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert removed successfully" });
  } catch (error) {
    console.error("DELETE ALERT ERROR:", error);
    res.status(500).json({ error: "Failed to delete alert" });
  }
};

module.exports = {
  addAlert,
  deleteAlert,
};
