const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth'); // Importer autentifikationsmiddleware

// Dashboard route (beskyttet)
router.get('/', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM leads';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching leads');
        } else {
            // Send leads data til dashboard.ejs
            res.render('dashboard', { leads: results });
        }
    });
});

module.exports = router;
