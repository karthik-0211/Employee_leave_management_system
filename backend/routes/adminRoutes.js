const express = require('express');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// ============================================
// GET all employees
// ============================================
const getAllEmployees = async (req, res) => {
    try {
        const [employees] = await db.query(
            `SELECT e.*, u.email, u.username 
             FROM employees e 
             JOIN users u ON e.user_id = u.id 
             WHERE e.status = 'active'`
        );
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// ADD new employee
// ============================================
const addEmployee = async (req, res) => {
    try {
        const {
            username, email, password,
            employee_id, full_name, department,
            position, joining_date, contact_number, address
        } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Create user
            const [userResult] = await connection.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 'employee']
            );

            // Create employee
            await connection.query(
                `INSERT INTO employees 
                 (user_id, employee_id, full_name, department, position, joining_date, contact_number, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userResult.insertId, employee_id, full_name, department, position, joining_date, contact_number, address]
            );

            await connection.commit();
            res.status(201).json({ message: 'Employee added successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// GET all pending leave requests
// ============================================
const getAllLeaveRequests = async (req, res) => {
    try {
        const [leaves] = await db.query(
            `SELECT l.*, e.full_name, e.employee_id, e.department 
             FROM leaves l 
             JOIN employees e ON l.employee_id = e.id 
             WHERE l.status = 'pending' 
             ORDER BY l.applied_date DESC`
        );
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// GET all leaves (for admin history)
// ============================================
const getAllLeaves = async (req, res) => {
    try {
        const [leaves] = await db.query(
            `SELECT l.*, e.full_name, e.employee_id, e.department 
             FROM leaves l 
             JOIN employees e ON l.employee_id = e.id 
             ORDER BY l.applied_date DESC`
        );
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// UPDATE leave status (approve/reject)
// ============================================
const updateLeaveStatus = async (req, res) => {
    const { leaveId, status, admin_remarks } = req.body;

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get leave details
            const [leaves] = await connection.query(
                'SELECT * FROM leaves WHERE id = ?',
                [leaveId]
            );

            if (leaves.length === 0) {
                throw new Error('Leave not found');
            }

            const leave = leaves[0];

            // Update leave status
            await connection.query(
                `UPDATE leaves 
                 SET status = ?, admin_remarks = ?, reviewed_date = NOW() 
                 WHERE id = ?`,
                [status, admin_remarks, leaveId]
            );

            // Update employee leave balance if approved
            if (status === 'approved') {
                const start = new Date(leave.start_date);
                const end = new Date(leave.end_date);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                await connection.query(
                    `UPDATE employees 
                     SET used_leaves = used_leaves + ?,
                         remaining_leaves = remaining_leaves - ?
                     WHERE id = ?`,
                    [days, days, leave.employee_id]
                );
            }

            await connection.commit();
            res.json({ message: `Leave ${status} successfully` });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// DELETE employee (optional)
// ============================================
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        
        // First get the user_id
        const [employee] = await db.query(
            'SELECT user_id FROM employees WHERE id = ?',
            [id]
        );
        
        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        // Delete user (cascade will delete employee)
        await db.query('DELETE FROM users WHERE id = ?', [employee[0].user_id]);
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// GET leave statistics for dashboard
// ============================================
const getLeaveStatistics = async (req, res) => {
    try {
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_leaves,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_leaves,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_leaves,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_leaves
             FROM leaves`
        );
        res.json(stats[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// Apply all middleware and routes
// ============================================
router.use(authenticateToken);
router.use(authorizeAdmin);

// Routes
router.get('/employees', getAllEmployees);
router.post('/employees', addEmployee);
router.delete('/employees/:id', deleteEmployee);
router.get('/leaves/pending', getAllLeaveRequests);
router.get('/leaves/all', getAllLeaves);
router.put('/leaves/status', updateLeaveStatus);
router.get('/statistics', getLeaveStatistics);

module.exports = router;