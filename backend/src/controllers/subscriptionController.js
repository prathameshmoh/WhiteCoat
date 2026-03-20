const pool = require("../config/db");

/* ===============================
   UPGRADE PLAN (NEW SYSTEM)
=============================== */
const upgradePlan = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        error: "Plan ID is required",
      });
    }

    // 1. Get plan details
    const planResult = await pool.query(
      "SELECT * FROM plans WHERE plan_id = $1",
      [planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        error: "Plan not found",
      });
    }

    const plan = planResult.rows[0];

    // 2. Create subscription with expiry
    const subResult = await pool.query(
      `
      INSERT INTO subscriptions (doctor_id, plan_id, start_date, end_date)
      VALUES ($1, $2, NOW(), NOW() + ($3 || ' days')::interval)
      RETURNING subscription_id
      `,
      [doctor_id, plan.plan_id, plan.duration_days]
    );

    const subscription_id = subResult.rows[0].subscription_id;

    // 3. Update doctor
    await pool.query(
      `
      UPDATE doctors
      SET current_subscription_id = $1,
          plan = $2
      WHERE doctor_id = $3
      `,
      [subscription_id, plan.name, doctor_id]
    );

    res.json({
      message: "Plan upgraded successfully",
      plan: plan.name,
    });

  } catch (error) {
    console.error("UPGRADE ERROR:", error);
    res.status(500).json({
      error: "Failed to upgrade plan",
    });
  }
};

module.exports = { upgradePlan };