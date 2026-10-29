# Unified Smart Campus Management System for Academic and Administrative Services

A production-grade, full-stack college management web application built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

---

## 🌟 Key Highlights & Architecture

- **Real Working System**: Every action flows through `Frontend (React) -> REST API (Express) -> Database (MongoDB) -> Response -> State Update`.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin**, **Faculty**, and **Student**.
- **Automated Calculations**:
  - Timetable scheduling with automatic room and faculty conflict detection.
  - Dynamic attendance calculation `(Present / Total) * 100` with threshold alert banners (<75%).
  - Pre-save grading calculations for total marks, percentage, and grade categories (`A+`, `A`, `B+`, `B`, `C`, `P`, `F`).
  - Automated user account creation with bcrypt password hashing when Admin registers faculty or students.
  - Live system notifications when assignments are posted, graded, leaves reviewed, or notices published.
- **Institutional Reports & Export**: Multi-filter reporting across students, faculty, attendance, marks, assignments, and leaves with JSON dataset exports.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or higher)
2. **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas)

---

### Step 1: Start Backend Server
```bash
cd server
npm install
npm run seed     # (Optional: Reseed sample data)
npm start        # Runs on http://localhost:5000
```

### Step 2: Start Frontend Client
```bash
cd client
npm install
npm run dev      # Runs on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 🔐 Default Demo Login Credentials

The database comes pre-seeded with real accounts for immediate login:

| Role | Email / Identifier | Password | Name / Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Dr. Robert Vance (Campus Director) |
| **Faculty** | `faculty1@campus.edu` or `FAC-CSE-01` | `Faculty@123` | Dr. Alan Turing (CSE Dept) |
| **Faculty** | `faculty2@campus.edu` or `FAC-IT-02` | `Faculty@123` | Dr. Ada Lovelace (IT Dept) |
| **Student** | `student1@campus.edu` or `2026CS101` | `Student@123` | Alex Johnson (CSE Sem 4) |
| **Student** | `student2@campus.edu` or `2026CS102` | `Student@123` | Samantha Miller (CSE Sem 4) |

*(Quick-fill buttons for each user role are also provided right on the Login page!)*

---

## 📂 Project Structure

```
smart-campus/
├── server/
│   ├── config/          # MongoDB Mongoose connection
│   ├── controllers/     # 15 Express controllers handling business logic
│   ├── middleware/      # JWT auth, RBAC authorize, Multer disk storage, Error handler
│   ├── models/          # 14 Mongoose Schema models
│   ├── routes/          # Express API route declarations
│   ├── seed/            # Seeder with realistic initial dataset
│   ├── uploads/         # Static file storage for assignments, notes, documents
│   ├── .env             # Server environment configuration
│   ├── package.json
│   └── server.js        # Main Express server entrypoint
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── common/  # Badge, Button, Input, Select, Modal, Table, Charts, Nav, Sidebar
    │   │   └── ProtectedRoute.jsx
    │   ├── context/     # AuthContext with JWT storage & user state
    │   ├── layouts/     # MainLayout with responsive sidebar & top header
    │   ├── pages/
    │   │   ├── auth/    # Login page with demo autofill chips
    │   │   ├── admin/   # 10 Admin pages (Dashboard, Students, Faculty, Timetable, etc.)
    │   │   ├── faculty/ # 11 Faculty pages (Dashboard, Attendance, Marks, Notes, etc.)
    │   │   └── student/ # 11 Student pages (Dashboard, Grades, Leaves, Timetable, etc.)
    │   ├── services/    # Axios API client with automatic Bearer token interceptor
    │   ├── App.jsx      # Master React Router configuration
    │   ├── index.css    # Tailwind CSS & custom styling
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🛠️ Verification & Testing

The system has been verified through an automated end-to-end testing suite:
- [x] JWT Authentication and role authorization
- [x] Admin student creation + auto user account generation
- [x] Admin faculty creation + auto user account generation
- [x] Faculty attendance marking + live student attendance calculation
- [x] Assignment publishing + student submission + faculty evaluation & feedback
- [x] Leave application + instructor/admin review & status sync
- [x] Timetable scheduling with automatic collision blocking
- [x] Marks entry with automated totals, percentages, and letter grades
