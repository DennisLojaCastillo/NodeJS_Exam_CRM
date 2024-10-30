require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware til at parse HTTP-anmodninger
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));

// Indstil public mappe til statiske filer
app.use(express.static(path.join(__dirname, '../client/public')));

// Konfigurer view stien og template engine
app.set('views', path.join(__dirname, '../client/src/views'));
app.set('view engine', 'ejs');

// Eksportér app, så det kan bruges i server.js
module.exports = app;


app.get('/', (req, res) => {
    res.send('Velkommen til NodeJs Exam CRM!');
});

const leadRoutes = require('./routers/leadRoutes');
app.use('/leads', leadRoutes);
