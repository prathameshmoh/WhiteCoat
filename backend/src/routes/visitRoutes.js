const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  addVisit,
  getTodaysVisits,
  createVisitFromAppointment,
} = require("../controllers/visitController");

/* ================= VISIT ROUTES ================= */

// 🔐 Protect ALL visit routes
router.use(authMiddleware);

// ➕ Create a new visit (manual visit)
router.post("/", addVisit);

// 📅 Get today's visits (dashboard)
router.get("/today", getTodaysVisits);

// 🔁 Create visit from an appointment
router.post(
  "/from-appointment/:appointment_id",
  createVisitFromAppointment
);

module.exports = router;
