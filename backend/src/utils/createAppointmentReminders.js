const pool = require("../config/db");

const createAppointmentReminders = async (appointment) => {
  try {
    const appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.appointment_time}`
    );

    const remind24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const remind2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO reminders
       (doctor_id, patient_id, appointment_id, reminder_type, remind_at, channel, status, message)
       VALUES
       ($1, $2, $3, '24h_before', $4, 'email', 'pending', $6),
       ($1, $2, $3, '2h_before', $5, 'in_app', 'pending', $6)`,
      [
        appointment.doctor_id,
        appointment.patient_id,
        appointment.appointment_id,
        remind24h,
        remind2h,
        `Reminder for appointment on ${appointment.appointment_date}`
      ]
    );

    console.log("✅ Reminders created for appointment:", appointment.appointment_id);

  } catch (error) {
    console.error("❌ Reminder creation failed:", error);
  }
};

module.exports = createAppointmentReminders;