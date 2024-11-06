require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { isAuthenticated } = require('./middleware/auth');

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

// Middleware til at forhindre caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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

// Auth routes
const authRoutes = require('./routers/authRoutes');
app.use(authRoutes);

// Lead routes med autentificering
const leadRoutes = require('./routers/leadRoutes');
app.use('/leads', isAuthenticated, leadRoutes);

// Dashboard routes fra dashboardRoutes.js med autentificering
const dashboardRoutes = require('./routers/dashboardRoutes');
app.use('/dashboard', isAuthenticated, dashboardRoutes);

// Eksportér app, så det kan bruges i server.js
module.exports = app;
