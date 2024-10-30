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

// Update a lead (status vundet/tabt)
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // status kan være "won" eller "lost"
    const sql = 'UPDATE leads SET status = ? WHERE id = ?';

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Error updating lead:', err);
            res.status(500).send('Server Error');
        } else {
            // Emit real-time notification to admin here [Socket.io integration]
            const io = req.app.get('socketio');
            io.emit('leadStatusUpdate', { leadId: id, status: status });

            res.send('Lead updated successfully');
        }
    });
});


// Delete a lead
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM leads WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting lead:', err);
            res.status(500).send('Server Error');
        } else {
            res.send('Lead deleted successfully');
        }
    });
});


// Test view for Socket.io
router.get('/socket-test', (req, res) => {
    res.render('socketTest');
});


module.exports = router;