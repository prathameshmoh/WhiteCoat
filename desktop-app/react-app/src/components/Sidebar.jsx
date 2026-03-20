import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = JSON.parse(localStorage.getItem("doctor"));

  const logout = () => {
    if (!window.confirm("Logout from this account?")) return;
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <aside style={styles.sidebar}>
      {/* ================= CLINIC BRAND ================= */}
      <div style={styles.brand}>
        <div style={styles.logo}>🏥</div>
        <div>
          <div style={styles.clinic}>
            {doctor?.clinic_name || "Clinic"}
          </div>
          <div style={styles.doctor}>
            Dr. {doctor?.full_name || ""}
          </div>
        </div>
      </div>

      {/* ================= NAV ================= */}
      <nav style={styles.menu}>
        <NavItem
          icon="📊"
          label="Dashboard"
          to="/dashboard"
          active={location.pathname === "/dashboard"}
        />
        <NavItem
          icon="🧑‍🤝‍🧑"
          label="Patients"
          to="/patients"
          active={location.pathname.startsWith("/patients")}
        />
        <NavItem
          icon="📅"
          label="Appointments"
          to="/appointments"
          active={location.pathname === "/appointments"}
        />
        <NavItem
          icon="📈"
          label="Analytics"
          to="/analytics"
          active={location.pathname === "/analytics"}
        />
        <NavItem
          icon="⚙️"
          label="Settings"
          to="/settings"
          active={location.pathname === "/settings"}
        />
      </nav>

      {/* ================= FOOTER ================= */}
      <button onClick={logout} style={styles.logout}>
        🚪 Logout
      </button>
    </aside>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({ icon, label, to, active }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      style={{
        ...styles.item,
        ...(active ? styles.activeItem : {}),
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
    >
      <span style={styles.icon}>{icon}</span>
      {label}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  sidebar: {
    width: 240,
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },

  /* BRAND */
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },

  clinic: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0f172a",
  },

  doctor: {
    fontSize: 12,
    color: "#64748b",
  },

  /* MENU */
  menu: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#0f172a",
    userSelect: "none",
    transition: "all 0.2s ease",
  },

  icon: {
    fontSize: 16,
  },

  activeItem: {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 600,
  },

  /* LOGOUT */
  logout: {
    marginTop: 16,
    padding: "10px",
    borderRadius: 10,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default Sidebar;
