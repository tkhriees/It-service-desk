const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,

  ssl: {
    ca: fs.readFileSync(
      path.resolve(__dirname, "..", process.env.DB_SSL_CA || "global-bundle.pem")
    ),
    rejectUnauthorized: true
  }
});

module.exports = pool;