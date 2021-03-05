console.log('Server started');
const express = require('express');
const app = express();
require('dotenv').config();
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const routes = require('./app/routes/appRoutes'); 
const errorlog = require('express-errorlog');

const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
dbConnection.connect(function(err) {if (err) console.error('error connecting: ' + err.stack); return;});
app.listen(process.env.PORT, process.env.ADDRESS,console.log('API server started on: http://' + process.env.ADDRESS+":"+process.env.PORT));
console.log();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

app.use(errorlog);

routes(app);