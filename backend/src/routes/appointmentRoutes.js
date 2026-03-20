const express = require("express");
const router = express.Router();

const checkPlan = require("../middlewares/planMiddleware");

const {
  createAppointment,
  getAppointments,
  getTodaysAppointments,
  getUpcomingAppointments,
  getNext7DaysAppointments,
} = require("../controllers/appointmentController");

/* ================= APPOINTMENT ROUTES ================= */

// ➕ Create appointment (requires email reminders feature)
router.post(
  "/",
  checkPlan("email_reminders"),
  createAppointment
);

// 📋 Get all appointments
router.get("/", getAppointments);

// 📅 Today's appointments
router.get("/today", getTodaysAppointments);

// ⏳ Upcoming appointments
router.get("/upcoming", getUpcomingAppointments);

// 📆 Next 7 days appointments
router.get("/next7days", getNext7DaysAppointments);

module.exports = router;