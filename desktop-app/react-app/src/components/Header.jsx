function Header() {
  let doctor = null;

  try {
    doctor = JSON.parse(localStorage.getItem("doctor"));
  } catch {
    doctor = null;
  }

  const clinicName = doctor?.clinic_name || "Clinic Dashboard";
  const doctorName = doctor?.full_name || "";

  return (
    <header style={styles.header}>
      <div>
        <h2 style={styles.title}>{clinicName}</h2>
        <div style={styles.subtitle}>
          {doctorName ? `Welcome Dr. ${doctorName}` : "Welcome"}
        </div>
      </div>
    </header>
  );
}

/* ================= STYLES ================= */

const styles = {
  header: {
    height: 70,
    background: "linear-gradient(90deg, #0f4c81, #2b78c5)",
    color: "#fff",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    flexShrink: 0, // 🔑 prevents collapse in layouts
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },

  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    marginTop: 2,
  },
};

export default Header;
