# 🗓️ Employee Leave Management System

A full-stack web application that automates employee leave application and approval workflows, replacing manual/email-based processes with a centralized, real-time platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Test Credentials](#test-credentials)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Employee Leave Management System solves common pain points of manual leave tracking:

| Problem | Solution |
|---|---|
| Spreadsheet/paper-based tracking | Centralized web application |
| No leave balance visibility | Real-time balance dashboard |
| Delayed approvals | Instant approve/reject by admin |
| Scattered records | Single MySQL database |
| Difficult reporting | Built-in leave history & statistics |

---

## Features

### 👤 Employee
- Secure login with JWT authentication
- View leave balance (Total / Used / Remaining)
- Apply for leave (Casual, Sick, Annual, Unpaid)
- View complete leave history with status and admin remarks

### 🛠️ Admin
- Dashboard with statistics (employees, pending requests, total leaves)
- Add and delete employees
- View and process pending leave requests (approve/reject with remarks)
- View complete leave history across all employees

### 🔒 Security
- JWT-based session management
- Role-based access control (employee vs admin)
- Protected API routes via middleware

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| ReactJS | 18.2.0 | UI framework |
| React Router | 6.20.0 | Client-side routing |
| Axios | 1.6.2 | HTTP client |
| React Bootstrap | 2.10.0 | UI components |
| Chart.js | 4.4.0 | Data visualization |
| React Toastify | 9.1.3 | Notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18.x | JavaScript runtime |
| Express.js | 4.18.2 | Web framework |
| MySQL2 | 3.6.5 | Database driver |
| jsonwebtoken | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| dotenv | 16.3.1 | Environment config |

### Database
- **MySQL 8.0** — Relational database
- **MySQL Workbench 8.0** — GUI management tool

---

## Project Structure

```
leave-management-system/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Login logic
│   │   ├── leaveController.js   # Leave apply/history/balance
│   │   └── adminController.js   # Employee & leave management
│   ├── middleware/
│   │   └── auth.js              # JWT verification, role check
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── adminRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Login.js
│   │   ├── pages/
│   │   │   ├── EmployeeDashboard.js
│   │   │   ├── ApplyLeave.js
│   │   │   ├── LeaveHistory.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ManageEmployees.js
│   │   │   └── PendingLeaves.js
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   └── App.js
│   └── package.json
│
└── database/
    └── schema.sql
```

---

## Database Design

### Entity Relationship

```
users (1) ──── (1) employees (1) ──── (N) leaves
```

### Tables

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | INT | Primary Key |
| username | VARCHAR(50) | Unique |
| email | VARCHAR(100) | Unique |
| password | VARCHAR(255) | Hashed |
| role | ENUM | `admin` / `employee` |
| created_at | TIMESTAMP | Auto |

**`employees`**
| Column | Type | Notes |
|---|---|---|
| id | INT | Primary Key |
| user_id | INT | FK → users(id) |
| employee_id | VARCHAR(20) | Company ID |
| full_name | VARCHAR(100) | — |
| department | VARCHAR(50) | — |
| position | VARCHAR(50) | — |
| total_leaves | INT | Default: 20 |
| used_leaves | INT | Default: 0 |
| remaining_leaves | INT | Default: 20 |
| status | ENUM | `active` / `inactive` |

**`leaves`**
| Column | Type | Notes |
|---|---|---|
| id | INT | Primary Key |
| employee_id | INT | FK → employees(id) |
| leave_type | ENUM | `sick` / `casual` / `annual` / `unpaid` |
| start_date | DATE | — |
| end_date | DATE | — |
| reason | TEXT | — |
| status | ENUM | `pending` / `approved` / `rejected` |
| admin_remarks | TEXT | Optional |
| applied_date | TIMESTAMP | Auto |
| reviewed_date | TIMESTAMP | Nullable |

---

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/leaves/balance` | Get leave balance | Employee |
| GET | `/api/leaves/history` | Get leave history | Employee |
| POST | `/api/leaves/apply` | Apply for leave | Employee |
| GET | `/api/admin/employees` | List all employees | Admin |
| POST | `/api/admin/employees` | Add new employee | Admin |
| DELETE | `/api/admin/employees/:id` | Delete employee | Admin |
| GET | `/api/admin/leaves/pending` | Get pending leaves | Admin |
| GET | `/api/admin/leaves/all` | Get all leave records | Admin |
| PUT | `/api/admin/leaves/status` | Approve / Reject leave | Admin |

---

## Getting Started

### Prerequisites

- Node.js v16+
- MySQL 8.0+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/leave-management-system.git
cd leave-management-system
```

### 2. Set up the database

Open MySQL Workbench (or any MySQL client) and run:

```sql
CREATE DATABASE IF NOT EXISTS leave_management_system;
USE leave_management_system;
-- Then run the full schema.sql script
```

### 3. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=leave_management_system
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 4. Configure the frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## Test Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Employee | `john.doe` | `password123` |

---

## Testing

All 12 test cases pass with a **100% success rate**:

| Category | Tests | Passed |
|---|---|---|
| Authentication | 3 | ✅ 3 |
| Employee Module | 3 | ✅ 3 |
| Admin Module | 5 | ✅ 5 |
| Navigation | 1 | ✅ 1 |

CRUD operations verified:

| Operation | Feature |
|---|---|
| **Create** | Apply Leave, Add Employee |
| **Read** | Dashboard, Leave History, Employee List |
| **Update** | Approve / Reject Leaves |
| **Delete** | Delete Employee |

---

## Future Enhancements

- [ ] Email notifications for leave approval/rejection
- [ ] Forgot password / password reset flow
- [ ] Export leave reports to PDF or Excel
- [ ] Custom leave policies per department
- [ ] Calendar view for leave visualization
- [ ] React Native mobile app

---

## References

- [ReactJS Docs](https://reactjs.org/docs)
- [Node.js Docs](https://nodejs.org/en/docs)
- [Express.js Docs](https://expressjs.com)
- [MySQL Docs](https://dev.mysql.com/doc)
- [Bootstrap Docs](https://getbootstrap.com/docs)
- [JWT Docs](https://jwt.io/introduction)
