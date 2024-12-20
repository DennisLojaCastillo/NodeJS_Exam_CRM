function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        // Hvis sessionen ikke er aktiv, omdiriger brugeren til login
        res.redirect('/login');
    }
}

function isAdmin(req, res, next) {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied. You need admin privileges to perform this action.');
    }
}

module.exports = { isAuthenticated, isAdmin };
