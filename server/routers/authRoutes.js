const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/database');

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup POST request
router.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Server Error');
            return;
        }

        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, email, hash, role], (dbErr) => {
            if (dbErr) {
                console.error('Error signing up user:', dbErr);
                res.status(500).send('Server Error');
            } else {
                res.redirect('/login');
            }
        });
    });
});


// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Login POST request
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).send('Server Error');
        } else if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (compareErr, isMatch) => {
                if (compareErr) {
                    console.error('Error comparing passwords:', compareErr);
                    res.status(500).send('Server Error');
                } else if (isMatch) {
                    req.session.userId = results[0].id;
                    req.session.username = results[0].name;
                    req.session.userRole = results[0].role; // Gem brugerens rolle i sessionen
                    res.redirect('/dashboard');
                } else {
                    res.redirect('/login');
                }
            });
        } else {
            res.redirect('/login');
        }
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Server Error');
        } else {
            res.clearCookie('connect.sid'); // Fjern session-cookien
            res.redirect('/login');
        }
    });
});

module.exports = router;
