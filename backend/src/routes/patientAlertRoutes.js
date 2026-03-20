const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  addAlert,
  deleteAlert,
} = require("../controllers/patientAlertController");

router.post("/", auth, addAlert);
router.delete("/:alert_id", auth, deleteAlert);

module.exports = router;
