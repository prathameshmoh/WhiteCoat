const express = require("express");
const router = express.Router();

const { upgradePlan } = require("../controllers/subscriptionController");

// Upgrade plan using planId
router.post("/upgrade/:planId", upgradePlan);

module.exports = router;