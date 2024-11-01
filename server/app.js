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

// Gør session tilgængelig i views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

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

// Dashboard routes fra dashboardRoutes.js
const dashboardRoutes = require('./routers/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);

// Auth routes
const authRoutes = require('./routers/authRoutes');
app.use(authRoutes);

// Eksportér app, så det kan bruges i server.js
module.exports = app;
