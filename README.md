# Employee Salary Slip Automation System

Automated pipeline: Admin uploads salary sheet → System generates PDF salary slips → Emails to employees.

## Tech Stack
- **Frontend**: React 18 + Vite (port 3000)
- **Backend**: Spring Boot 3.2 + Java 17 (port 8080)
- **Database**: MongoDB (port 27017)
- **PDF**: iText 7
- **Email**: Spring Boot Mail + Gmail SMTP

## Project Structure
```
salary-slip-system/
├── frontend/                  ← React app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  ← Upload + Preview + Dispatch
│   │   │   └── Employees.jsx  ← Employee CRUD
│   │   └── services/api.js    ← API calls
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                   ← Spring Boot
    ├── pom.xml
    └── src/main/java/com/salaryslip/
        ├── config/            ← AppConfig (CORS), MailConfig
        ├── entity/            ← Employee, SalaryRecord
        ├── dto/               ← SalarySlipDTO, PreviewRowDTO, etc.
        ├── controller/        ← UploadController, PayrollController, EmployeeController
        ├── service/           ← PayrollService (core logic)
        ├── repository/        ← EmployeeRepository, SalaryRepository
        └── utility/           ← ExcelParserUtil, PdfUtil, EmailUtil
```

## Setup & Run

### 1. Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+
- MongoDB running on localhost:27017

### 2. Configure Email (Gmail)
In `backend/src/main/resources/application.properties`:
```
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password    # Gmail App Password (not account password)
```
> Enable 2FA on your Gmail → Settings → App Passwords → Generate one for "Mail"

### 3. Start Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload/salary | Upload CSV/Excel salary file |
| POST | /api/payroll/dispatch | Generate PDFs + send emails |
| GET | /api/employees | List all employees |
| POST | /api/employees | Add new employee |
| DELETE | /api/employees/{id} | Remove employee |

## CSV Format
```
EmployeeID,BaseSalary,HRA,Allowances,Deductions,Month
EMP001,40000,10000,5000,3000,May 2026
```
<img width="1919" height="953" alt="image" src="https://github.com/user-attachments/assets/debe5869-368f-4661-baf2-435e4aa0edfd" />

## Net Salary Formula
```
Net Salary = (Base Salary + HRA + Allowances) - Deductions
```
<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/faeaef46-cc9c-4bb2-9a5a-508366ea673f" />


## Bonus Feature — Password Protected PDFs
Enable the checkbox before uploading. PDF password = `FirstName + BirthYear`
Example: Rahul Kumar born 1999 → password is `Rahul1999`
