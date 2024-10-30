require('dotenv').config(); // Dette skal være den allerførste linje
const mysql = require('mysql2');

console.log('MySQL User:', process.env.MYSQL_USER);
console.log('MySQL Password:', process.env.MYSQL_PASSWORD);
console.log('MySQL Database:', process.env.MYSQL_DATABASE);


const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
