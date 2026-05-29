const BASE_URL = "https://salary-slip-systemsb.onrender.com/api";



export const api = {
  uploadSalaryFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload/salary`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  dispatchSalarySlips: async (month, passwordProtect = false) => {
    const res = await fetch(`${BASE_URL}/payroll/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, passwordProtect }),
    });
    if (!res.ok) throw new Error("Dispatch failed");
    return res.json();
  },
  getEmployees: async () => {
    const res = await fetch(`${BASE_URL}/employees`);
    return res.json();
  },
  addEmployee: async (data) => {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteEmployee: async (employeeId) => {
    await fetch(`${BASE_URL}/employees/${employeeId}`, { method: "DELETE" });
  },
};
