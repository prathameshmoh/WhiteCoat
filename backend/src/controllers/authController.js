const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/email");


/* ================= REGISTER ================= */

const registerDoctor = async (req, res) => {
  try {
    const {
      full_name,
      clinic_name,
      specialization,
      phone,
      email,
      password,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "full_name, email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // check existing email
    const existing = await pool.query(
      "SELECT doctor_id FROM doctors WHERE email = $1",
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Doctor already registered with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO doctors
      (full_name, clinic_name, specialization, phone, email, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING doctor_id, full_name, clinic_name
      `,
      [
        full_name.trim(),
        clinic_name?.trim() || null,
        specialization?.trim() || null,
        phone?.trim() || null,
        cleanEmail,
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: result.rows[0],
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/* ================= LOGIN ================= */

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Doctor not found" });
    }

    const doctor = result.rows[0];

    const isMatch = await bcrypt.compare(password, doctor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { doctor_id: doctor.doctor_id },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      doctor: {
        doctor_id: doctor.doctor_id,
        full_name: doctor.full_name,
        clinic_name: doctor.clinic_name,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

/* ================= REQUEST PASSWORD RESET (EMAIL LINK) ================= */

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const doctorRes = await pool.query(
      "SELECT doctor_id FROM doctors WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    // Always return success message (security)
    if (doctorRes.rows.length === 0) {
      return res.json({
        message:
          "If this email exists, a password reset link has been sent.",
      });
    }

    const doctor_id = doctorRes.rows[0].doctor_id;

    // delete old tokens
    await pool.query(
      "DELETE FROM password_reset_tokens WHERE doctor_id = $1",
      [doctor_id]
    );

    // generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      `
      INSERT INTO password_reset_tokens
      (doctor_id, token, expires_at)
      VALUES ($1, $2, $3)
      `,
      [doctor_id, token, expiresAt]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await sendResetEmail(
      email.trim().toLowerCase(),
      resetLink
    );


    res.json({
      message:
        "If this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("REQUEST RESET ERROR:", error);
    res.status(500).json({ error: "Failed to send reset link" });
  }
};

/* ================= RESET PASSWORD USING TOKEN ================= */

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT * FROM password_reset_tokens
      WHERE token = $1
        AND expires_at > NOW()
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired reset link",
      });
    }

    const doctor_id = result.rows[0].doctor_id;
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE doctors SET password_hash = $1 WHERE doctor_id = $2",
      [hashedPassword, doctor_id]
    );

    await pool.query(
      "DELETE FROM password_reset_tokens WHERE doctor_id = $1",
      [doctor_id]
    );

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

/* ================= EXPORTS ================= */

module.exports = {
  registerDoctor,
  loginDoctor,
  requestPasswordReset,
  resetPassword,
};
