const pool = require("../config/db");
const createAppointmentReminders = require("../utils/createAppointmentReminders");

/* ======================================================
   CREATE APPOINTMENT
====================================================== */
const createAppointment = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const {
      patient_id,
      appointment_date,
      appointment_time,
      appointment_source = "patient_page",
    } = req.body;

    if (!patient_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        error:
          "patient_id, appointment_date and appointment_time are required",
      });
    }

    /* ================= GET DOCTOR PLAN ================= */
    const planResult = await pool.query(
      "SELECT plan FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );

    const doctor_plan = planResult.rows[0]?.plan || "free";

    /* ================= INSERT APPOINTMENT ================= */
    const result = await pool.query(
      `
      INSERT INTO appointments
      (doctor_id, patient_id, appointment_date, appointment_time, appointment_source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        appointment_id,
        appointment_date::text AS appointment_date,
        appointment_time::text AS appointment_time,
        appointment_source,
        status
      `,
      [
        doctor_id,
        patient_id,
        appointment_date,
        appointment_time,
        appointment_source,
      ]
    );

    const appointment = result.rows[0];

    /* ================= 🔒 REMINDER CONTROL ================= */
    if (doctor_plan === "free") {
      console.log("🚫 Reminders disabled for FREE plan");
    } else {
      try {
        await createAppointmentReminders({
          doctor_id,
          patient_id,
          appointment_id: appointment.appointment_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          appointment_source: appointment.appointment_source,
        });
      } catch (reminderError) {
        console.error("❌ Reminder creation failed:", reminderError);
      }
    }

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment,
      plan: doctor_plan, // useful for frontend
    });

  } catch (error) {
    console.error("❌ CREATE APPOINTMENT ERROR:", error);
    return res.status(500).json({
      error: "Failed to create appointment",
    });
  }
};

/* ======================================================
   LIST ALL APPOINTMENTS
====================================================== */
const getAppointments = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT 
        a.appointment_id,
        a.appointment_date::text AS appointment_date,
        a.appointment_time::text AS appointment_time,
        a.status,
        a.appointment_source,
        p.full_name AS patient_name,
        p.phone AS patient_phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.doctor_id = $1
      ORDER BY a.appointment_date, a.appointment_time
      `,
      [doctor_id]
    );

    res.json({
      total: result.rows.length,
      appointments: result.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch appointments",
    });
  }
};

/* ======================================================
   TODAY'S APPOINTMENTS
====================================================== */
const getTodaysAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        a.appointment_id,
        p.full_name AS patient_name,
        a.appointment_date::text AS appointment_date,
        a.appointment_time::text AS appointment_time,
        a.status
      FROM appointments a
      JOIN patients p ON p.patient_id = a.patient_id
      WHERE a.doctor_id = $1
        AND a.appointment_date = CURRENT_DATE
      ORDER BY a.appointment_time
      `,
      [req.doctor_id]
    );

    res.json({ appointments: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch today's appointments",
    });
  }
};

/* ======================================================
   UPCOMING APPOINTMENTS
====================================================== */
const getUpcomingAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        a.appointment_id,
        p.full_name AS patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status
      FROM appointments a
      JOIN patients p ON p.patient_id = a.patient_id
      WHERE a.doctor_id = $1
        AND a.appointment_date::date > CURRENT_DATE
      ORDER BY a.appointment_date::date, a.appointment_time
      LIMIT 5
      `,
      [req.doctor_id]
    );

    res.json({ appointments: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch upcoming appointments",
    });
  }
};

/* ======================================================
   NEXT 7 DAYS APPOINTMENTS
====================================================== */
const getNext7DaysAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        a.appointment_id,
        p.full_name AS patient_name,
        a.appointment_date,
        a.appointment_time,
        a.status
      FROM appointments a
      JOIN patients p ON p.patient_id = a.patient_id
      WHERE a.doctor_id = $1
        AND a.appointment_date::date >= CURRENT_DATE
        AND a.appointment_date::date <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY a.appointment_date::date, a.appointment_time
      `,
      [req.doctor_id]
    );

    res.json({ appointments: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch next 7 days appointments",
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getTodaysAppointments,
  getUpcomingAppointments,
  getNext7DaysAppointments,
};