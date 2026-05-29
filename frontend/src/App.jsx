import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f0f4ff" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0f172a", color: "white",
        display: "flex", flexDirection: "column", padding: "0"
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748b", marginBottom: 6 }}>PAYROLL SYSTEM</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>SalarySlip.io</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {[
            { id: "dashboard", icon: "⬡", label: "Dashboard" },
            { id: "employees", icon: "◎", label: "Employees" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                marginBottom: 4, textAlign: "left", fontSize: 14, fontWeight: 500,
                background: page === item.id ? "#1e40af" : "transparent",
                color: page === item.id ? "white" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1e293b", fontSize: 12, color: "#475569" }}>
          Admin Panel v1.0
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {page === "dashboard" && <Dashboard />}
        {page === "employees" && <Employees />}
      </main>
    </div>
  );
}
