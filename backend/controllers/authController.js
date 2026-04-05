const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', username);

        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        let isValidPassword = false;
        
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isValidPassword = await bcrypt.compare(password, user.password);
        } else {
            isValidPassword = (password === user.password);
        }
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        let employeeDetails = null;
        if (user.role === 'employee') {
            const [employees] = await db.query(
                'SELECT * FROM employees WHERE user_id = ?',
                [user.id]
            );
            if (employees.length > 0) {
                employeeDetails = employees[0];
            }
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                employeeId: employeeDetails ? employeeDetails.id : null 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                employeeDetails
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = { login };