import { useState } from "react";
import api from "../services/api";

function Settings() {
  const storedDoctor = JSON.parse(localStorage.getItem("doctor")) || {};

  /* ================= PROFILE STATE ================= */
  const [fullName, setFullName] = useState(storedDoctor.full_name || "");
  const [clinicName, setClinicName] = useState(storedDoctor.clinic_name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  /* ================= PASSWORD STATE ================= */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = async () => {
    if (!fullName.trim()) {
      alert("Doctor name is required");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await api.put("/auth/update-profile", {
        full_name: fullName,
        clinic_name: clinicName,
      });

      localStorage.setItem("doctor", JSON.stringify(res.data.doctor));
      alert("Profile updated successfully");
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= UPDATE PASSWORD ================= */
  const updatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("All password fields required");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setSavingPassword(true);

      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to update password"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Settings</h2>

      {/* ================= PROFILE CARD ================= */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Clinic Profile</h3>

        <label style={styles.label}>Doctor Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Clinic Name</label>
        <input
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={updateProfile}
          disabled={savingProfile}
          style={styles.primaryBtn}
        >
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* ================= PASSWORD CARD ================= */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Change Password</h3>

        <label style={styles.label}>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={updatePassword}
          disabled={savingPassword}
          style={styles.primaryBtn}
        >
          {savingPassword ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 20,
    color: "#0f172a",
  },

  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 22,
    border: "1px solid #e5e7eb",
    marginBottom: 24,
  },

  cardTitle: {
    marginBottom: 14,
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
  },

  label: {
    display: "block",
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    marginBottom: 14,
    fontSize: 14,
  },

  primaryBtn: {
    marginTop: 6,
    padding: "10px 16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default Settings;
