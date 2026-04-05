const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
    res.json({ message: 'Employee profile endpoint' });
});

module.exports = router;