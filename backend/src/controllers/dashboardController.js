const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    /* ================= TOTAL PATIENTS ================= */
    const totalPatientsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM patients 
      WHERE doctor_id = $1
      `,
      [doctor_id]
    );

    /* ================= NEW PATIENTS (TODAY) ================= */
    // 🔥 TIMEZONE-SAFE (IMPORTANT)
    const newPatientsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM patients
      WHERE doctor_id = $1
        AND created_at >= CURRENT_DATE
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
      `,
      [doctor_id]
    );

    /* ================= TOTAL APPOINTMENTS ================= */
    const totalAppointmentsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM appointments 
      WHERE doctor_id = $1
      `,
      [doctor_id]
    );

    /* ================= TODAY'S APPOINTMENTS ================= */
    const todaysAppointmentsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date = CURRENT_DATE
        AND status = 'scheduled'
      `,
      [doctor_id]
    );

    /* ================= UPCOMING APPOINTMENTS ================= */
    const upcomingAppointmentsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date > CURRENT_DATE
        AND status = 'scheduled'
      `,
      [doctor_id]
    );

    /* ================= CANCELLED APPOINTMENTS ================= */
    const cancelledAppointmentsResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM appointments
      WHERE doctor_id = $1
        AND status = 'cancelled'
      `,
      [doctor_id]
    );

    return res.json({
      total_patients: Number(totalPatientsResult.rows[0].count),
      new_patients: Number(newPatientsResult.rows[0].count),
      total_appointments: Number(totalAppointmentsResult.rows[0].count),
      todays_appointments: Number(todaysAppointmentsResult.rows[0].count),
      upcoming_appointments: Number(upcomingAppointmentsResult.rows[0].count),
      cancelled_appointments: Number(cancelledAppointmentsResult.rows[0].count),
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({
      error: "Failed to load dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};
