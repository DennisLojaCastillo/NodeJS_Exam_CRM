const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Dashboard route
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM leads';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching leads from database:', err);
            res.status(500).send('Error fetching leads');
        } else {
            // Send leads data til dashboard.ejs
            res.render('dashboard', { leads: results });
        }
    });
});

module.exports = router;
