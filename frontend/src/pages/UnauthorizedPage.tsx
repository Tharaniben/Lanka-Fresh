import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "12px", color: "var(--text)" }}>
        403 - Access Denied
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
        You do not have permission to access this page.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "var(--primary)",
          color: "var(--bg)",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Return to Home
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
