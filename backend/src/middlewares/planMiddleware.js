const { getDoctorFeatures, hasFeature } = require("../utils/featureService");

/* ===============================
   PLAN / FEATURE MIDDLEWARE
=============================== */
const checkPlan = (featureKey) => {
  return async (req, res, next) => {
    try {
      const doctor_id = req.doctor_id;

      const features = await getDoctorFeatures(doctor_id);

      /* ===== BOOLEAN FEATURES ===== */
      if (featureKey === "email_reminders") {
        if (!hasFeature(features, "email_reminders")) {
          return res.status(403).json({
            error: "Upgrade required to use email reminders",
          });
        }
      }

      /* ===== PATIENT LIMIT ===== */
      if (featureKey === "patients_limit") {
        const result = await require("../config/db").query(
          "SELECT COUNT(*) FROM patients WHERE doctor_id = $1",
          [doctor_id]
        );

        const count = parseInt(result.rows[0].count);

        if (
          features.patients_limit !== -1 &&
          count >= features.patients_limit
        ) {
          return res.status(403).json({
            error: "Patient limit reached. Upgrade your plan.",
          });
        }
      }

      next();

    } catch (err) {
      console.error("PLAN MIDDLEWARE ERROR:", err);
      res.status(500).json({
        error: "Plan check failed",
      });
    }
  };
};

module.exports = checkPlan;