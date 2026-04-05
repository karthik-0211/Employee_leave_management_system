-- ============================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM
-- Complete Database Setup Script
-- ============================================

-- STEP 1: Create fresh database
DROP DATABASE IF EXISTS leave_management_system;
CREATE DATABASE leave_management_system;
USE leave_management_system;

-- STEP 2: Create USERS table (stores login credentials)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STEP 3: Create EMPLOYEES table (stores employee details)
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    contact_number VARCHAR(15),
    address TEXT,
    total_leaves INT DEFAULT 20,
    used_leaves INT DEFAULT 0,
    remaining_leaves INT DEFAULT 20,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- STEP 4: Create LEAVES table (stores leave applications)
CREATE TABLE leaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'annual', 'unpaid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_remarks TEXT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- STEP 5: Insert sample data

-- Insert Admin User (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@company.com', 'admin123', 'admin');

-- Insert Employee User (password: password123)
INSERT INTO users (username, email, password, role) 
VALUES ('john.doe', 'john@company.com', 'password123', 'employee');

-- Insert Employee Details
INSERT INTO employees (user_id, employee_id, full_name, department, position, joining_date, contact_number) 
VALUES (2, 'EMP001', 'John Doe', 'IT', 'Software Developer', '2023-01-15', '9876543210');

-- Insert Sample Leave Request
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) 
VALUES (1, 'casual', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Family function', 'pending');

-- STEP 6: View all data
SELECT '========== ALL DATA IN DATABASE ==========' as '';
SELECT '--- USERS TABLE ---' as '';
SELECT id, username, email, role FROM users;

SELECT '--- EMPLOYEES TABLE ---' as '';
SELECT id, employee_id, full_name, department, position, total_leaves, remaining_leaves FROM employees;

SELECT '--- LEAVES TABLE ---' as '';
SELECT l.id, e.full_name, l.leave_type, l.start_date, l.end_date, l.status FROM leaves l JOIN employees e ON l.employee_id = e.id;