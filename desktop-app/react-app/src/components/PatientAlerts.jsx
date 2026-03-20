function PatientAlerts({ alerts = [], compact = false }) {
  if (!alerts.length) return null;

  const visible = compact ? alerts.slice(0, 1) : alerts.slice(0, 3);
  const extra = alerts.length - visible.length;

  return (
    <div style={styles.wrap}>
      {visible.map((a, i) => (
        <span
          key={i}
          style={{
            ...styles.badge,
            ...severityStyles[a.severity],
          }}
        >
          {a.type === "allergy" ? "⚠️" : "ℹ️"} {a.label}
        </span>
      ))}
      {extra > 0 && (
        <span style={styles.more}>+{extra}</span>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  badge: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  more: {
    fontSize: 11,
    color: "#64748b",
  },
};

const severityStyles = {
  high: { background: "#fee2e2", color: "#991b1b" },
  medium: { background: "#fef3c7", color: "#92400e" },
  low: { background: "#dbeafe", color: "#1e40af" },
};

export default PatientAlerts;
