const pool = require("../config/db");

/**
 * ADD VISIT (MANUAL)
 * Used when doctor creates a visit directly
 */
const addVisit = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { patient_id, appointment_id = null, condition_name, notes = null } = req.body;

    if (!patient_id || !condition_name) {
      return res.status(400).json({
        error: "patient_id and condition_name are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO visits (
        doctor_id,
        patient_id,
        appointment_id,
        condition_name,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING visit_id, visit_date
      `,
      [doctor_id, patient_id, appointment_id, condition_name, notes]
    );

    res.status(201).json({
      message: "Visit recorded successfully",
      visit: result.rows[0],
    });
  } catch (error) {
    console.error("ADD VISIT ERROR:", error);
    res.status(500).json({
      error: "Failed to record visit",
    });
  }
};

/**
 * GET TODAY'S VISITS
 */
const getTodaysVisits = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT
        v.visit_id,
        v.visit_date,
        v.condition_name,
        p.patient_id,
        p.full_name,
        a.appointment_time
      FROM visits v
      JOIN patients p ON p.patient_id = v.patient_id
      LEFT JOIN appointments a ON a.appointment_id = v.appointment_id
      WHERE v.doctor_id = $1
        AND v.visit_date = CURRENT_DATE
      ORDER BY a.appointment_time NULLS LAST
      `,
      [doctor_id]
    );

    res.json({ visits: result.rows });
  } catch (error) {
    console.error("GET TODAY VISITS ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch today's visits",
    });
  }
};

/**
 * CREATE VISIT FROM APPOINTMENT
 * Analytics-safe version (NO empty condition_name)
 */
const createVisitFromAppointment = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { appointment_id } = req.params;

    // 1. Fetch appointment (doctor ownership enforced)
    const appointmentResult = await pool.query(
      `
      SELECT appointment_id, patient_id
      FROM appointments
      WHERE appointment_id = $1
        AND doctor_id = $2
      `,
      [appointment_id, doctor_id]
    );

    if (appointmentResult.rowCount === 0) {
      return res.status(404).json({
        error: "Appointment not found",
      });
    }

    // 2. Prevent duplicate visit
    const visitCheck = await pool.query(
      `
      SELECT visit_id
      FROM visits
      WHERE appointment_id = $1
      `,
      [appointment_id]
    );

    if (visitCheck.rowCount > 0) {
      return res.status(400).json({
        error: "Visit already exists for this appointment",
      });
    }

    const { patient_id } = appointmentResult.rows[0];

    // 3. Create visit (DEFAULT condition_name)
    const visitResult = await pool.query(
      `
      INSERT INTO visits (
        doctor_id,
        patient_id,
        appointment_id,
        condition_name,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING visit_id, visit_date
      `,
      [
        doctor_id,
        patient_id,
        appointment_id,
        "General Consultation",
        null,
      ]
    );

    // 4. Mark appointment as completed
    await pool.query(
      `
      UPDATE appointments
      SET status = 'completed'
      WHERE appointment_id = $1
      `,
      [appointment_id]
    );

    res.status(201).json({
      message: "Visit created from appointment",
      visit: visitResult.rows[0],
    });
  } catch (error) {
    console.error("CREATE VISIT FROM APPOINTMENT ERROR:", error);
    res.status(500).json({
      error: "Failed to create visit from appointment",
    });
  }
};

module.exports = {
  addVisit,
  getTodaysVisits,
  createVisitFromAppointment,
};
