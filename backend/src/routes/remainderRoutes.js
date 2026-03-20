const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Reminder route working" });
});

module.exports = router;