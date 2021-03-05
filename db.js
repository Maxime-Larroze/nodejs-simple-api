'user strict';
const mysql = require('mysql');
require('dotenv').config();
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
connection.connect(function(err, res) {
    try {if (err) console.log("Unable to join the database. Please try again later.");}
    catch(err) {return console.log("Unable to join the database. Please try again later.");}
});
module.exports = connection;