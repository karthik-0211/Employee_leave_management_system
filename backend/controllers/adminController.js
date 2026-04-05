const db = require('../config/database');
const bcrypt = require('bcryptjs');

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

const addEmployee = async (req, res) => {
    try {
        const {
            username, email, password,
            employee_id, full_name, department,
            position, joining_date, contact_number, address
        } = req.body;

        console.log('Adding employee:', { username, email, employee_id, full_name });

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, password, 'employee']
            );

            await connection.query(
                `INSERT INTO employees 
                 (user_id, employee_id, full_name, department, position, joining_date, contact_number, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userResult.insertId, employee_id, full_name, department, position, joining_date, contact_number, address]
            );

            await connection.commit();
            console.log('Employee added successfully with ID:', userResult.insertId);
            res.status(201).json({ message: 'Employee added successfully', userId: userResult.insertId });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Add employee error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

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

const updateLeaveStatus = async (req, res) => {
    const { leaveId, status, admin_remarks } = req.body;

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [leaves] = await connection.query(
                'SELECT * FROM leaves WHERE id = ?',
                [leaveId]
            );

            if (leaves.length === 0) {
                throw new Error('Leave not found');
            }

            const leave = leaves[0];

            await connection.query(
                `UPDATE leaves 
                 SET status = ?, admin_remarks = ?, reviewed_date = NOW() 
                 WHERE id = ?`,
                [status, admin_remarks, leaveId]
            );

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

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [employee] = await db.query(
            'SELECT user_id FROM employees WHERE id = ?',
            [id]
        );
        
        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        await db.query('DELETE FROM users WHERE id = ?', [employee[0].user_id]);
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllEmployees,
    addEmployee,
    getAllLeaveRequests,
    getAllLeaves,
    updateLeaveStatus,
    deleteEmployee
};