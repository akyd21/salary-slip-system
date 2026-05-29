import { useState, useRef } from "react";
import { api } from "../services/api";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const Badge = ({ ok }) => (
  <span style={{
    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: ok ? "#dcfce7" : "#fee2e2",
    color: ok ? "#166534" : "#991b1b",
  }}>
    {ok ? "✓ Found" : "✗ Missing"}
  </span>
);

export default function Dashboard() {
  const [step, setStep]               = useState("upload");   // upload | preview | result
  const [dragging, setDragging]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [file, setFile]               = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [result, setResult]           = useState(null);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [error, setError]             = useState("");
  const fileRef = useRef();

  // ── File handling ──────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only .csv, .xlsx, .xls files are supported.");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.uploadSalaryFile(file);
      if (res.success) {
        setPreviewData(res);
        setStep("preview");
      } else {
        setError(res.message || "Upload failed.");
      }
    } catch (e) {
      setError("Could not connect to backend. Is Spring Boot running on port 8080?");
    }
    setLoading(false);
  };

  const handleDispatch = async () => {
    if (!previewData?.previewData?.length) return;
    const month = previewData.previewData[0]?.month;
    if (!month) { setError("Month not found in data."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.dispatchSalarySlips(month, passwordProtect);
      setResult(res);
      setStep("result");
    } catch (e) {
      setError("Dispatch failed. Check backend logs.");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep("upload"); setFile(null);
    setPreviewData(null); setResult(null); setError("");
  };

  // ── STEP: Upload ───────────────────────────────────────────────────
  if (step === "upload") return (
    <div style={{ padding: "36px 40px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
        Upload Payroll Sheet
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
        Upload monthly salary data (CSV or Excel). System will auto-merge employee details.
      </p>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragging ? "#1d4ed8" : file ? "#16a34a" : "#cbd5e1"}`,
          borderRadius: 16, padding: "60px 40px", textAlign: "center",
          cursor: "pointer", transition: "all 0.2s",
          background: dragging ? "#eff6ff" : file ? "#f0fdf4" : "white",
          marginBottom: 24,
        }}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
        <div style={{ fontSize: 48, marginBottom: 12 }}>{file ? "✅" : "📂"}</div>
        {file ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#166534" }}>{file.name}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              {(file.size / 1024).toFixed(1)} KB — Click to change
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#334155" }}>
              Drag & drop your salary sheet here
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              Supports: .csv, .xlsx, .xls — Max 10 MB
            </div>
          </>
        )}
      </div>

      {/* Expected format hint */}
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "16px 20px", marginBottom: 24, fontSize: 13,
      }}>
        <div style={{ fontWeight: 600, color: "#334155", marginBottom: 8 }}>
          Expected columns in your file:
        </div>
        <code style={{ color: "#1d4ed8", fontSize: 12 }}>
          EmployeeID | BaseSalary | HRA | Allowances | Deductions | Month
        </code>
        <div style={{ color: "#64748b", marginTop: 6, fontSize: 12 }}>
          Example: EMP001 | 40000 | 10000 | 5000 | 3000 | May 2026
        </div>
      </div>

      {/* Password protect toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}>
        <input type="checkbox" checked={passwordProtect}
          onChange={(e) => setPasswordProtect(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "#1d4ed8" }} />
        <span style={{ fontSize: 14, color: "#334155" }}>
          🔒 Password-protect PDFs <span style={{ color: "#94a3b8", fontSize: 12 }}>(FirstName + BirthYear)</span>
        </span>
      </label>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, padding: "12px 16px", color: "#991b1b",
          fontSize: 13, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          background: !file || loading ? "#94a3b8" : "#1d4ed8",
          color: "white", border: "none", borderRadius: 10, padding: "14px 32px",
          fontSize: 15, fontWeight: 600, cursor: !file || loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading ? "Parsing file..." : "Parse & Preview →"}
      </button>
    </div>
  );

  // ── STEP: Preview ──────────────────────────────────────────────────
  if (step === "preview") return (
    <div style={{ padding: "36px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>Preview & Confirm</h1>
        <button onClick={reset}
          style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8,
            padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#64748b" }}>
          ← Upload new file
        </button>
      </div>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
        Review merged data. Click <strong>Generate & Send All</strong> to dispatch salary slips.
      </p>

      {/* Stats bar */}
      {[
        { label: "Total records", value: previewData.totalRecords, color: "#1d4ed8" },
        { label: "Employees found", value: previewData.totalRecords - previewData.missingEmployees, color: "#16a34a" },
        { label: "Missing employees", value: previewData.missingEmployees, color: "#dc2626" },
      ].map(s => (
        <span key={s.label} style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "12px 24px", marginRight: 12, marginBottom: 20,
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{s.label}</span>
        </span>
      ))}

      {/* Preview table */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a", color: "white" }}>
              {["Emp ID","Name","Email","Designation","Base","HRA","Allow.","Deduct.","Net Salary","Month","Status"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600,
                  whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.previewData.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc",
                borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1d4ed8" }}>{row.employeeId}</td>
                <td style={{ padding: "11px 14px", color: row.employeeFound ? "#0f172a" : "#dc2626",
                  fontWeight: row.employeeFound ? 400 : 600 }}>{row.name}</td>
                <td style={{ padding: "11px 14px", color: "#64748b" }}>{row.email || "—"}</td>
                <td style={{ padding: "11px 14px" }}>{row.designation || "—"}</td>
                <td style={{ padding: "11px 14px" }}>{fmt(row.baseSalary)}</td>
                <td style={{ padding: "11px 14px" }}>{fmt(row.hra)}</td>
                <td style={{ padding: "11px 14px" }}>{fmt(row.allowances)}</td>
                <td style={{ padding: "11px 14px", color: "#dc2626" }}>{fmt(row.deductions)}</td>
                <td style={{ padding: "11px 14px", fontWeight: 700, color: "#166534" }}>{fmt(row.netSalary)}</td>
                <td style={{ padding: "11px 14px", color: "#64748b" }}>{row.month}</td>
                <td style={{ padding: "11px 14px" }}><Badge ok={row.employeeFound} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, padding: "12px 16px", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {previewData.missingEmployees > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 8, padding: "12px 16px", color: "#92400e", fontSize: 13, marginBottom: 16 }}>
          ⚠ {previewData.missingEmployees} employee(s) not found in database. Their slips will be skipped.
          Add them first in the Employees tab.
        </div>
      )}

      <button
        onClick={handleDispatch}
        disabled={loading}
        style={{
          background: loading ? "#94a3b8" : "#16a34a",
          color: "white", border: "none", borderRadius: 10,
          padding: "14px 32px", fontSize: 15, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating PDFs & Sending Emails..." : "✉ Generate & Send All Salary Slips"}
      </button>
    </div>
  );

  // ── STEP: Result ───────────────────────────────────────────────────
  if (step === "result") return (
    <div style={{ padding: "36px 40px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
        Dispatch Complete 🎉
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>{result.message}</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total processed", value: result.totalProcessed, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Sent successfully", value: result.successCount,  color: "#16a34a", bg: "#f0fdf4" },
          { label: "Failed",           value: result.failureCount,   color: "#dc2626", bg: "#fef2f2" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: s.bg, borderRadius: 12,
            padding: "24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {result.failedEmployees?.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>Failed employees:</div>
          {result.failedEmployees.map((e, i) => (
            <div key={i} style={{ fontSize: 13, color: "#dc2626", marginBottom: 4 }}>• {e}</div>
          ))}
        </div>
      )}

      <button onClick={reset}
        style={{
          background: "#1d4ed8", color: "white", border: "none",
          borderRadius: 10, padding: "14px 32px", fontSize: 15,
          fontWeight: 600, cursor: "pointer",
        }}>
        ← Upload New Month
      </button>
    </div>
  );
}
