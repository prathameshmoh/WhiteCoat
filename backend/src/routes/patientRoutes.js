const express = require("express");
const router = express.Router();

const checkPlan = require("../middlewares/planMiddleware");

const {
  addPatient,
  getPatients,
  searchPatients,
  mergePatients,
  getPatientTimeline,
  getPatientById,
} = require("../controllers/patientController");

/* ================= PATIENT ROUTES ================= */

// ➕ Add patient (ENFORCE PLAN LIMIT)
router.post(
  "/",
  checkPlan("patients_limit"),
  addPatient
);

// 📋 Get all patients
router.get("/", getPatients);

// 🔍 Search patients
router.get("/search", searchPatients);

// 🔀 Merge duplicate patients
router.post("/merge", mergePatients);

// 🧾 Patient timeline
router.get("/:patient_id/timeline", getPatientTimeline);

// 👤 Get single patient
router.get("/:id", getPatientById);

module.exports = router;