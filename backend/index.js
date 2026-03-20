const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* ================= DB ================= */
const pool = require("./src/config/db");

/* ================= ROUTES ================= */
const authRoutes = require("./src/routes/authRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const visitRoutes = require("./src/routes/visitRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const patientAlertRoutes = require("./src/routes/patientAlertRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");

/* ================= MIDDLEWARE ================= */
const authMiddleware = require("./src/middlewares/authMiddleware");

const app = express();

/* ================= GLOBAL MIDDLEWARE ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ================= PUBLIC ROUTES ================= */
app.use("/auth", authRoutes);

/* ================= PROTECTED ROUTES ================= */
app.use("/patients", authMiddleware, patientRoutes);
app.use("/appointments", authMiddleware, appointmentRoutes);
app.use("/visits", authMiddleware, visitRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);
app.use("/analytics", authMiddleware, analyticsRoutes);
app.use("/patient-alerts", authMiddleware, patientAlertRoutes);
app.use("/subscription", authMiddleware, subscriptionRoutes);

/* ================= 🔥 GET USER PLAN (UPDATED) ================= */
app.get("/protected", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.doctor_id,
        COALESCE(p.name, 'free') AS plan,
        s.end_date
      FROM doctors d
      LEFT JOIN subscriptions s 
        ON d.current_subscription_id = s.subscription_id
      LEFT JOIN plans p 
        ON s.plan_id = p.plan_id
      WHERE d.doctor_id = $1
    `, [req.doctor_id]);

    res.json({
      message: "You are authorized",
      doctor_id: req.doctor_id,
      plan: result.rows[0]?.plan || "free",
      expiry: result.rows[0]?.end_date || null,
    });

  } catch (error) {
    console.error("PROTECTED ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch user info",
    });
  }
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Clinic App Backend Running 🚀");
});

/* ================= START REMINDER WORKER ================= */
require("./src/workers/reminderWorker");


/* ================= START SUBSCRIPTION WORKER ================= */
require("./src/workers/subscriptionWorker");

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});