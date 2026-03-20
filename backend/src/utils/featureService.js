const pool = require("../config/db");

/* ===============================
   GET FEATURES
=============================== */
const getDoctorFeatures = async (doctor_id) => {
  const result = await pool.query(`
    SELECT p.features
    FROM doctors d
    LEFT JOIN subscriptions s 
      ON d.current_subscription_id = s.subscription_id
    LEFT JOIN plans p 
      ON s.plan_id = p.plan_id
    WHERE d.doctor_id = $1
  `, [doctor_id]);

  if (!result.rows.length || !result.rows[0].features) {
    return { patients_limit: 50 }; // fallback free plan
  }

  return result.rows[0].features;
};

/* ===============================
   FEATURE CHECK
=============================== */
const hasFeature = (features, key) => {
  return (
    features[key] === true ||
    features[key] === -1 ||
    features[key] > 0
  );
};

module.exports = {
  getDoctorFeatures,
  hasFeature,
};