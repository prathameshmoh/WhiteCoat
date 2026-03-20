const express = require("express");
const router = express.Router();

const {
  registerDoctor,
  loginDoctor,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

/* ================= AUTH ================= */

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);

/* ================= PASSWORD RESET (EMAIL LINK) ================= */

// Step 1 → Request password reset link (email)
router.post("/request-password-reset", requestPasswordReset);

// Step 2 → Reset password using token
router.post("/reset-password", resetPassword);

module.exports = router;
