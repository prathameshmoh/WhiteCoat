const pool = require("../config/db");
const { getDoctorFeatures } = require("../utils/featureService");

/* ===============================
   ADD PATIENT (UPDATED WITH LIMIT)
=============================== */
const addPatient = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const { full_name, age, gender, phone, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        error: "full_name and email are required",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // 🔥 FEATURE CHECK (IMPORTANT)
    const features = await getDoctorFeatures(doctor_id);

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM patients WHERE doctor_id = $1",
      [doctor_id]
    );

    const count = parseInt(countResult.rows[0].count);

    if (
      features.patients_limit !== -1 &&
      count >= features.patients_limit
    ) {
      return res.status(403).json({
        error: "Patient limit reached. Upgrade your plan.",
      });
    }

    // Optional duplicate check
    const existing = await pool.query(
      `SELECT patient_id FROM patients 
       WHERE doctor_id = $1 AND phone = $2`,
      [doctor_id, phone]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Patient with this phone already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO patients
      (doctor_id, full_name, age, gender, phone, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING patient_id, full_name, email
      `,
      [doctor_id, full_name, age, gender, phone, email]
    );

    return res.status(201).json({
      message: "Patient added successfully",
      patient: result.rows[0],
    });

  } catch (error) {
    console.error("ADD PATIENT ERROR:", error);
    return res.status(500).json({
      error: "Failed to add patient",
    });
  }
};

/* ===============================
   GET ALL PATIENTS
=============================== */
const getPatients = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT
        p.patient_id,
        p.full_name,
        p.phone,
        p.email,
        p.age,
        p.gender,
        COUNT(v.visit_id)::int AS total_visits,

        MIN(a.appointment_date) FILTER (
          WHERE a.appointment_date >= CURRENT_DATE
        ) AS next_appointment_date,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'type', pa.type,
              'label', pa.label,
              'severity', pa.severity
            )
          ) FILTER (WHERE pa.alert_id IS NOT NULL),
          '[]'
        ) AS alerts

      FROM patients p
      LEFT JOIN visits v
        ON v.patient_id = p.patient_id
        AND v.doctor_id = p.doctor_id

      LEFT JOIN appointments a
        ON a.patient_id = p.patient_id
        AND a.doctor_id = p.doctor_id

      LEFT JOIN patient_alerts pa
        ON pa.patient_id = p.patient_id

      WHERE p.doctor_id = $1
      GROUP BY p.patient_id
      ORDER BY p.created_at DESC
      `,
      [doctor_id]
    );

    return res.json({
      total: result.rows.length,
      patients: result.rows,
    });

  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);
    return res.status(500).json({
      error: "Failed to fetch patients",
    });
  }
};

/* ===============================
   SEARCH PATIENTS
=============================== */
const searchPatients = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { q } = req.query;

    if (!q) {
      return res.json({ patients: [] });
    }

    const result = await pool.query(
      `
      SELECT
        p.patient_id,
        p.full_name,
        p.age,
        p.gender,
        p.phone,
        p.email,
        MAX(v.visit_date) AS last_visit_date,
        COUNT(v.visit_id)::int AS total_visits
      FROM patients p
      LEFT JOIN visits v
        ON v.patient_id = p.patient_id
        AND v.doctor_id = $1
      WHERE p.doctor_id = $1
        AND (
          p.full_name ILIKE '%' || $2 || '%'
          OR p.phone ILIKE '%' || $2 || '%'
          OR p.email ILIKE '%' || $2 || '%'
        )
      GROUP BY p.patient_id
      ORDER BY last_visit_date DESC NULLS LAST
      LIMIT 10
      `,
      [doctor_id, q]
    );

    res.json({ patients: result.rows });

  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({
      error: "Patient search failed",
    });
  }
};

/* ===============================
   MERGE PATIENTS
=============================== */
const mergePatients = async (req, res) => {
  const client = await pool.connect();

  try {
    const doctor_id = req.doctor_id;
    const { source_patient_id, target_patient_id } = req.body;

    if (!source_patient_id || !target_patient_id) {
      return res.status(400).json({ error: "Both patient IDs required" });
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE visits SET patient_id = $1 WHERE patient_id = $2 AND doctor_id = $3`,
      [target_patient_id, source_patient_id, doctor_id]
    );

    await client.query(
      `UPDATE appointments SET patient_id = $1 WHERE patient_id = $2 AND doctor_id = $3`,
      [target_patient_id, source_patient_id, doctor_id]
    );

    await client.query(
      `UPDATE patient_alerts SET patient_id = $1 WHERE patient_id = $2`,
      [target_patient_id, source_patient_id]
    );

    await client.query(
      `DELETE FROM patients WHERE patient_id = $1 AND doctor_id = $2`,
      [source_patient_id, doctor_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Patients merged successfully" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("MERGE ERROR:", error);
    res.status(500).json({ error: "Merge failed" });
  } finally {
    client.release();
  }
};

/* ===============================
   PATIENT TIMELINE
=============================== */
const getPatientTimeline = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { patient_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        v.visit_date,
        v.condition_name,
        v.notes,
        a.appointment_date,
        a.appointment_time
      FROM visits v
      LEFT JOIN appointments a 
        ON v.appointment_id = a.appointment_id
      WHERE v.patient_id = $1
        AND v.doctor_id = $2
      ORDER BY v.visit_date DESC
      `,
      [patient_id, doctor_id]
    );

    res.json({
      patient_id,
      timeline: result.rows,
    });

  } catch (error) {
    console.error("TIMELINE ERROR:", error);
    res.status(500).json({ error: "Failed to load timeline" });
  }
};

/* ===============================
   GET SINGLE PATIENT
=============================== */
const getPatientById = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.patient_id,
        p.full_name,
        p.phone,
        p.email,
        p.age,
        p.gender,
        COUNT(v.visit_id)::int AS total_visits,
        MIN(v.visit_date) AS first_visit_date,
        MAX(v.visit_date) AS last_visit_date,

        COALESCE(
          json_agg(
            json_build_object(
              'alert_id', a.alert_id,
              'type', a.type,
              'label', a.label,
              'severity', a.severity
            )
          ) FILTER (WHERE a.alert_id IS NOT NULL),
          '[]'
        ) AS alerts

      FROM patients p
      LEFT JOIN visits v ON v.patient_id = p.patient_id
      LEFT JOIN patient_alerts a ON a.patient_id = p.patient_id

      WHERE p.patient_id = $1
        AND p.doctor_id = $2

      GROUP BY p.patient_id
      `,
      [id, doctor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ patient: result.rows[0] });

  } catch (error) {
    console.error("GET PATIENT ERROR:", error);
    res.status(500).json({ error: "Failed to fetch patient details" });
  }
};

module.exports = {
  addPatient,
  getPatients,
  searchPatients,
  mergePatients,
  getPatientTimeline,
  getPatientById,
};