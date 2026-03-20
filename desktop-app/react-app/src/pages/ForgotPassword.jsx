import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetLink = async () => {
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/request-password-reset", {
        email,
      });

      alert(
        "If this email exists, a password reset link has been sent."
      );

      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>

        <p style={styles.subtitle}>
          Enter your registered email address to receive a password reset link
        </p>

        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button
          className="primary"
          onClick={sendResetLink}
          disabled={loading}
          style={styles.primaryBtn}
          type="button"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.linkBtn}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
  },
  card: {
    width: 380,
    background: "#fff",
    padding: 26,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 600,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 22,
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    height: 42,
    fontWeight: 600,
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 13,
  },
};

export default ForgotPassword;
