const db = require('../config/database');

const applyLeave = async (req, res) => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;
        const employeeId = req.user.employeeId;

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID not found' });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const [employees] = await db.query(
            'SELECT remaining_leaves FROM employees WHERE id = ?',
            [employeeId]
        );

        if (employees.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (employees[0].remaining_leaves < days) {
            return res.status(400).json({ message: 'Insufficient leave balance' });
        }

        const [result] = await db.query(
            `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) 
             VALUES (?, ?, ?, ?, ?)`,
            [employeeId, leave_type, start_date, end_date, reason]
        );

        res.status(201).json({ message: 'Leave applied successfully', leaveId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLeaveHistory = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        
        const [leaves] = await db.query(
            `SELECT * FROM leaves 
             WHERE employee_id = ? 
             ORDER BY applied_date DESC`,
            [employeeId]
        );

        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLeaveBalance = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        
        const [employees] = await db.query(
            'SELECT total_leaves, used_leaves, remaining_leaves FROM employees WHERE id = ?',
            [employeeId]
        );

        if (employees.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employees[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { applyLeave, getLeaveHistory, getLeaveBalance };