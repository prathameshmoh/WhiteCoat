import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "doctor",
        JSON.stringify(res.data.doctor)
      );

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          className="primary"
          onClick={login}
          disabled={loading}
          style={styles.primaryBtn}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={styles.linkBtn}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={styles.linkBtn}
          >
            Create Account
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
    display: "flex",
    justifyContent: "space-between",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 13,
  },
};

export default Login;
