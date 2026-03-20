const pool = require("../config/db");

/* ===============================
   SUBSCRIPTION EXPIRY WORKER
=============================== */
const runSubscriptionWorker = async () => {
  try {
    console.log("🔄 Checking expired subscriptions...");

    // ✅ ONLY check ACTIVE subscription of doctor
    const result = await pool.query(`
      SELECT s.subscription_id, s.doctor_id
      FROM subscriptions s
      JOIN doctors d
        ON d.current_subscription_id = s.subscription_id
      WHERE s.end_date IS NOT NULL
      AND s.end_date < NOW()
    `);

    if (result.rows.length === 0) {
      console.log("✅ No expired subscriptions");
      return;
    }

    console.log(`⚠️ Found ${result.rows.length} expired subscriptions`);

    for (const sub of result.rows) {
      const { subscription_id, doctor_id } = sub;

      // 🔹 Downgrade doctor
      await pool.query(
        `
        UPDATE doctors
        SET current_subscription_id = NULL,
            plan = 'free'
        WHERE doctor_id = $1
        `,
        [doctor_id]
      );

      // 🔹 Remove expired subscription
      await pool.query(
        `
        DELETE FROM subscriptions
        WHERE subscription_id = $1
        `,
        [subscription_id]
      );

      console.log(`⬇️ Doctor ${doctor_id} downgraded & cleaned`);
    }

  } catch (error) {
    console.error("❌ SUBSCRIPTION WORKER ERROR:", error);
  }
};

/* ===============================
   SAFE START (NO INSTANT DOWNGRADE)
=============================== */

// ❌ DO NOT run immediately
// runSubscriptionWorker();

setTimeout(() => {
  runSubscriptionWorker(); // first run after delay
  setInterval(runSubscriptionWorker, 60 * 1000); // every 1 min
}, 10000); // 10 sec delay after server start