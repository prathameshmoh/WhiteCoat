import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    // 🔒 Required fields
    if (!fullName || !email || !password) {
      alert("Name, email and password are required");
      return;
    }

    // 📧 Basic email validation
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        full_name: fullName,
        clinic_name: clinicName || null,
        specialization: specialization || null,
        email,
        phone: phone || null,
        password,
      });

      alert("Account created successfully. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <p style={styles.subtitle}>
          Register to manage your clinic professionally
        </p>

        <input
          placeholder="Full name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Clinic name (optional)"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Specialization (e.g. Dentist, Physician)"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          style={styles.input}
        />

        <input
          type="email"
          placeholder="Email address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Phone number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          className="primary"
          onClick={signup}
          disabled={loading}
          style={styles.primaryBtn}
          type="button"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.linkBtn}
          >
            Already have an account? Login
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
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
  },

  card: {
    width: 420,
    background: "#ffffff",
    padding: "28px 26px",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 600,
    color: "#0f172a",
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
    outline: "none",
  },

  primaryBtn: {
    width: "100%",
    height: 42,
    marginTop: 6,
    fontWeight: 600,
    fontSize: 14,
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
    padding: 0,
  },
};

export default Signup;
