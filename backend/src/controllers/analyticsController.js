const pool = require("../config/db");

/* =========================
   DASHBOARD SUMMARY (DOCTOR)
========================= */
const getAnalyticsSummary = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const todayVisits = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM visits
      WHERE doctor_id = $1
        AND visit_date = CURRENT_DATE
      `,
      [doctor_id]
    );

    const totalPatients = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM patients
      WHERE doctor_id = $1
      `,
      [doctor_id]
    );

    const monthVisits = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM visits
      WHERE doctor_id = $1
        AND date_trunc('month', visit_date) =
            date_trunc('month', CURRENT_DATE)
      `,
      [doctor_id]
    );

    const upcomingAppointments = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date >= CURRENT_DATE
      `,
      [doctor_id]
    );

    res.json({
      todayVisits: todayVisits.rows[0].count,
      totalPatients: totalPatients.rows[0].count,
      monthVisits: monthVisits.rows[0].count,
      upcomingAppointments: upcomingAppointments.rows[0].count,
    });
  } catch (error) {
    console.error("ANALYTICS SUMMARY ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch analytics summary",
    });
  }
};

/* =========================
   AVAILABLE YEARS (DOCTOR)
========================= */
const getAvailableYears = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT DISTINCT EXTRACT(YEAR FROM visit_date)::int AS year
      FROM visits
      WHERE doctor_id = $1
      ORDER BY year DESC
      `,
      [doctor_id]
    );

    res.json(result.rows.map((r) => r.year));
  } catch (error) {
    console.error("AVAILABLE YEARS ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch years",
    });
  }
};

/* =========================
   MONTHLY VISIT TREND (DOCTOR)
========================= */
const getMonthlyAnalytics = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;
    const { year } = req.query;

    let query;
    let params;

    if (!year || year === "all") {
      query = `
        SELECT
          TO_CHAR(date_trunc('month', visit_date), 'Mon') AS month,
          EXTRACT(MONTH FROM visit_date)::int AS month_index,
          COUNT(*)::int AS count
        FROM visits
        WHERE doctor_id = $1
        GROUP BY month, month_index
        ORDER BY month_index
      `;
      params = [doctor_id];
    } else {
      query = `
        SELECT
          TO_CHAR(date_trunc('month', visit_date), 'Mon') AS month,
          EXTRACT(MONTH FROM visit_date)::int AS month_index,
          COUNT(*)::int AS count
        FROM visits
        WHERE doctor_id = $1
          AND EXTRACT(YEAR FROM visit_date) = $2
        GROUP BY month, month_index
        ORDER BY month_index
      `;
      params = [doctor_id, year];
    }

    const result = await pool.query(query, params);

    res.json(
      result.rows.map((r) => ({
        month: r.month,
        count: r.count,
      }))
    );
  } catch (error) {
    console.error("MONTHLY ANALYTICS ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch monthly analytics",
    });
  }
};

const getVisitTrend = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT
        TO_CHAR(date_trunc('month', visit_date), 'Mon') AS month,
        COUNT(*)::int AS count
      FROM visits
      WHERE doctor_id = $1
      GROUP BY month, date_trunc('month', visit_date)
      ORDER BY date_trunc('month', visit_date)
      `,
      [doctor_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("VISIT TREND ERROR:", error);
    res.status(500).json({ error: "Failed to fetch visit trend" });
  }
};

const getTopConditions = async (req, res) => {
  try {
    const doctor_id = req.doctor_id;

    const result = await pool.query(
      `
      SELECT
        condition_name,
        COUNT(*)::int AS count
      FROM visits
      WHERE doctor_id = $1
        AND condition_name IS NOT NULL
        AND condition_name <> ''
      GROUP BY condition_name
      ORDER BY count DESC
      LIMIT 5
      `,
      [doctor_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("TOP CONDITIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch top conditions" });
  }
};


module.exports = {
  getAnalyticsSummary,
  getAvailableYears,
  getMonthlyAnalytics,
  getVisitTrend,
  getTopConditions,
};
