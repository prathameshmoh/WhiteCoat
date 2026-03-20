import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Layout() {
  return (
    <div style={styles.layout}>
      {/* LEFT: SIDEBAR */}
      <Sidebar />

      {/* RIGHT: MAIN AREA */}
      <div style={styles.main}>
        {/* TOP HEADER */}
        <Header />

        {/* PAGE CONTENT (ROUTES RENDER HERE) */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#f4f7fb",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  content: {
    flex: 1,
    overflowY: "auto",
    padding: 28,
  },
};

export default Layout;
