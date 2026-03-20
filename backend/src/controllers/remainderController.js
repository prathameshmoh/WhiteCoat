const pool = require("../config/db");

const getTodayReminders = async (req, res) => {
  const doctor_id = req.doctor_id;

  const { rows } = await pool.query(
    `
    SELECT
      r.reminder_id,
      r.remind_at,
      r.message,
      p.full_name
    FROM reminders r
    LEFT JOIN patients p ON p.patient_id = r.patient_id
    WHERE r.doctor_id = $1
      AND r.channel = 'in_app'
      AND r.status = 'pending'
      AND DATE(r.remind_at) = CURRENT_DATE
    ORDER BY r.remind_at
    `,
    [doctor_id]
  );

  res.json(rows);
};

module.exports = { getTodayReminders };
