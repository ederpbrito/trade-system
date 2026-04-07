import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      style={{
        fontSize: "0.875rem",
        fontWeight: active ? 700 : 400,
        color: active ? "#4f46e5" : "#475569",
        textDecoration: "none",
        padding: "0.25rem 0.5rem",
        borderRadius: 4,
        background: active ? "#eef2ff" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <strong style={{ color: "#0f172a" }}>Tradesystem</strong>
        <nav style={{ display: "flex", gap: 4 }} aria-label="Navegação principal">
          <NavLink to="/cockpit">Cockpit</NavLink>
          <NavLink to="/experiments">Experimentos</NavLink>
        </nav>
      </header>
      {children}
    </div>
  );
}
