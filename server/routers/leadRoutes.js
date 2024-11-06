const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Beskyt alle lead routes med autentificering
router.use(isAuthenticated);

// Get all leads
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM leads';
    db.query(sql, (err, results) => {
        if (err) {            
            res.status(500).send('Server Error');
        } else {
            res.render('leads', { leads: results });
        }
    });
});

// Add a new lead via Fetch API
router.post('/add', (req, res) => {
    const { name, email, phone, company } = req.body;

    const sql = 'INSERT INTO leads (name, email, phone, company, status) VALUES (?, ?, ?, ?, "open")';
    db.query(sql, [name, email, phone, company], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Server Error' });
        } else {
            res.status(201).json({ message: 'Lead added successfully', leadId: result.insertId });
        }
    });
});

// Update a lead (status ændres til vundet/tabt)
router.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // status kan være "won", "lost" eller "open"
    const sql = 'UPDATE leads SET status = ? WHERE id = ?';

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            res.status(500).send('Server Error');
        } else {
            // Emit real-time notification to admin here [Socket.io integration]
            const io = req.app.get('socketio');
            io.emit('leadStatusUpdate', { leadId: id, status: status });

            if (status === 'won') {
                // Hvis status ændres til "won", tilføj leadet som customer
                const customerSql = 'INSERT INTO customers (name, email, phone, company) SELECT name, email, phone, company FROM leads WHERE id = ?';
                db.query(customerSql, [id], (customerErr) => {
                    if (customerErr) {
                        res.status(500).send('Server Error');
                    } else {
                        res.redirect('/leads');
                    }
                });
            } else if (status === 'open' || status === 'lost') {
                // Hvis status ændres fra "won" til noget andet, fjern kunden fra customers
                const deleteCustomerSql = 'DELETE FROM customers WHERE name = (SELECT name FROM leads WHERE id = ?)';
                db.query(deleteCustomerSql, [id], (deleteErr) => {
                    if (deleteErr) {                        
                        res.status(500).send('Server Error');
                    } else {
                        res.redirect('/leads');
                    }
                });
            } else {
                res.redirect('/leads');
            }
        }
    });
});

// Delete a lead - kun admin kan slette leads
router.post('/delete/:id', isAdmin, (req, res) => {
    const { id } = req.params;

    // Først, slet lead fra customers, hvis det er "won"
    const deleteCustomerSql = 'DELETE FROM customers WHERE name = (SELECT name FROM leads WHERE id = ? AND status = "won")';
    db.query(deleteCustomerSql, [id], (deleteCustomerErr) => {
        if (deleteCustomerErr) {            
            res.status(500).send('Server Error');
        } else {
            // Slet derefter leadet fra leads-tabellen
            const deleteLeadSql = 'DELETE FROM leads WHERE id = ?';
            db.query(deleteLeadSql, [id], (deleteLeadErr) => {
                if (deleteLeadErr) {
                    res.status(500).send('Server Error');
                } else {
                    res.redirect('/leads');
                }
            });
        }
    });
});

// Get update form for a lead
router.get('/update/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM leads WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
        } else {
            res.render('updateLead', { lead: results[0] });
        }
    });
});

// Update lead (form submission)
router.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;
    const sql = 'UPDATE leads SET name = ?, email = ?, phone = ?, company = ?, status = ? WHERE id = ?';
    db.query(sql, [name, email, phone, company, status, id], (err, result) => {
        if (err) {
            res.status(500).send('Server Error');
        } else {
            res.redirect('/leads');
        }
    });
});

// Get all customers
router.get('/customers', (req, res) => {
    const sql = 'SELECT * FROM customers';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
        } else {
            res.render('customers', { customers: results });
        }
    });
});

module.exports = router;
