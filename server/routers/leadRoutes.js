const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all leads
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM leads';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching leads:', err);
            res.status(500).send('Server Error');
        } else {
            res.render('leads', { leads: results }); // Viser leads med EJS
        }
    });
});

// Add a new lead
router.post('/add', (req, res) => {
    const { name, email, phone, company } = req.body;
    const sql = 'INSERT INTO leads (name, email, phone, company, status) VALUES (?, ?, ?, ?, "open")';
    db.query(sql, [name, email, phone, company], (err, result) => {
        if (err) {
            console.error('Error adding lead:', err);
            res.status(500).send('Server Error');
        } else {
            res.redirect('/leads');
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
            console.error('Error updating lead:', err);
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
                        console.error('Error adding customer:', customerErr);
                        res.status(500).send('Server Error');
                    } else {
                        console.log('Lead added as customer successfully');
                        res.redirect('/leads');
                    }
                });
            } else if (status === 'open' || status === 'lost') {
                // Hvis status ændres fra "won" til noget andet, fjern kunden fra customers
                const deleteCustomerSql = 'DELETE FROM customers WHERE name = (SELECT name FROM leads WHERE id = ?)';
                db.query(deleteCustomerSql, [id], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting customer:', deleteErr);
                        res.status(500).send('Server Error');
                    } else {
                        console.log('Customer removed from customers table');
                        res.redirect('/leads');
                    }
                });
            } else {
                res.redirect('/leads');
            }
        }
    });
});





// Delete a lead
router.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM leads WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting lead:', err);
            res.status(500).send('Server Error');
        } else {
            res.redirect('/leads');
        }
    });
});



// Get update form for a lead
router.get('/update/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM leads WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching lead:', err);
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
            console.error('Error updating lead:', err);
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
            console.error('Error fetching customers:', err);
            res.status(500).send('Server Error');
        } else {
            res.render('customers', { customers: results });
        }
    });
});



// Test view for Socket.io
router.get('/socket-test', (req, res) => {
    res.render('socketTest');
});


module.exports = router;