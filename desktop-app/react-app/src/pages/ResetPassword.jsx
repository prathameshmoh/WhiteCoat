import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 🔑 Get token from URL
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚫 If token is missing, block access
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h3>Invalid or expired link</h3>
          <p>Please request a new password reset.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            style={styles.btn}
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  const resetPassword = async () => {
    if (!password || !confirm) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      alert("Password reset successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={styles.input}
        />

        <button
          className="primary"
          onClick={resetPassword}
          disabled={loading}
          style={styles.btn}
          type="button"
        >
          {loading ? "Saving..." : "Save New Password"}
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
  },
  card: {
    width: 380,
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  btn: {
    width: "100%",
    height: 40,
    marginTop: 6,
  },
};

export default ResetPassword;
