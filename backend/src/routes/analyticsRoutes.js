const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getAnalyticsSummary,
  getAvailableYears,
  getMonthlyAnalytics,
  getVisitTrend,
  getTopConditions,
} = require("../controllers/analyticsController");

router.use(authMiddleware);

router.get("/summary", getAnalyticsSummary);
router.get("/years", getAvailableYears);
router.get("/monthly", getMonthlyAnalytics);
router.get("/visit-trend", getVisitTrend);
router.get("/top-conditions", getTopConditions);

module.exports = router;
