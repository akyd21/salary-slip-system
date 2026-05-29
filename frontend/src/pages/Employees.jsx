import { useState, useEffect } from "react";
import { api } from "../services/api";

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600,
      color: "#475569", marginBottom: 5 }}>{label}</label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
        borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
        fontFamily: "inherit", background: "white", color: "#0f172a",
      }}
    />
  </div>
);

const EMPTY_FORM = {
  employeeId: "", name: "", email: "",
  designation: "", department: "", birthYear: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setFetching(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch {
      setError("Could not fetch employees. Is Spring Boot running?");
    }
    setFetching(false);
  };

  const handleAdd = async () => {
    if (!form.employeeId || !form.name || !form.email) {
      setError("Employee ID, Name, and Email are required.");
      return;
    }
    setLoading(true);
    setError(""); setSuccess("");
    try {
      await api.addEmployee({ ...form, birthYear: parseInt(form.birthYear) || 0 });
      setSuccess(`Employee ${form.name} added successfully!`);
      setForm(EMPTY_FORM);
      fetchEmployees();
    } catch {
      setError("Failed to add employee. Check backend.");
    }
    setLoading(false);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm(`Remove employee ${employeeId}?`)) return;
    await api.deleteEmployee(employeeId);
    setSuccess(`Employee ${employeeId} removed.`);
    fetchEmployees();
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    e.designation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "36px 40px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
        Employee Master
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
        Manage the employee database. Employee ID must match the salary sheet.
      </p>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Add employee form */}
        <div style={{
          width: 320, background: "white", borderRadius: 14,
          border: "1px solid #e2e8f0", padding: "24px", flexShrink: 0,
          alignSelf: "flex-start",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>
            Add New Employee
          </h2>

          <Input label="Employee ID *" value={form.employeeId} placeholder="EMP001"
            onChange={e => setForm({ ...form, employeeId: e.target.value })} />
          <Input label="Full Name *" value={form.name} placeholder="Rahul Kumar"
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Email *" type="email" value={form.email} placeholder="rahul@company.com"
            onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Designation" value={form.designation} placeholder="Software Engineer"
            onChange={e => setForm({ ...form, designation: e.target.value })} />
          <Input label="Department" value={form.department} placeholder="Engineering"
            onChange={e => setForm({ ...form, department: e.target.value })} />
          <Input label="Birth Year (for PDF password)" type="number" value={form.birthYear}
            placeholder="1999" onChange={e => setForm({ ...form, birthYear: e.target.value })} />

          {error && (
            <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 12px",
              color: "#991b1b", fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>
          )}
          {success && (
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px",
              color: "#166534", fontSize: 12, marginBottom: 12 }}>✓ {success}</div>
          )}

          <button onClick={handleAdd} disabled={loading}
            style={{
              width: "100%", background: loading ? "#94a3b8" : "#1d4ed8",
              color: "white", border: "none", borderRadius: 8,
              padding: "12px", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading ? "Adding..." : "+ Add Employee"}
          </button>
        </div>

        {/* Employees table */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "#64748b" }}>
              {filtered.length} employee{filtered.length !== 1 ? "s" : ""} found
            </span>
            <input
              placeholder="Search by name, ID, designation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, outline: "none", fontFamily: "inherit",
                width: 260, color: "#0f172a",
              }}
            />
          </div>

          <div style={{ background: "white", borderRadius: 12,
            border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {fetching ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                Loading employees...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                No employees found. Add your first employee using the form.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "white" }}>
                    {["Emp ID", "Name", "Email", "Designation", "Department", "Birth Year", "Action"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left",
                        fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => (
                    <tr key={emp.id || i}
                      style={{ background: i % 2 === 0 ? "white" : "#f8fafc",
                        borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 700, color: "#1d4ed8" }}>
                        {emp.employeeId}
                      </td>
                      <td style={{ padding: "11px 14px", fontWeight: 500 }}>{emp.name}</td>
                      <td style={{ padding: "11px 14px", color: "#64748b" }}>{emp.email}</td>
                      <td style={{ padding: "11px 14px" }}>{emp.designation || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>{emp.department || "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#64748b" }}>{emp.birthYear || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <button
                          onClick={() => handleDelete(emp.employeeId)}
                          style={{
                            background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                            borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12,
                          }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
