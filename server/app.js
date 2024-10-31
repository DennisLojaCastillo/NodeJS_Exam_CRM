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
app.set('views', path.join(__dirname, '../client/src/pages'));
app.set('view engine', 'ejs');

// Route til startsiden (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/src/index.html'));
});

// Lead routes
const leadRoutes = require('./routers/leadRoutes');
app.use('/leads', leadRoutes);

// Fjern denne linje
// app.get('/dashboard', (req, res) => {
//     res.render('dashboard');
// });

// Dashboard routes fra dashboardRoutes.js
const dashboardRoutes = require('./routers/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);



// Eksportér app, så det kan bruges i server.js
module.exports = app;
