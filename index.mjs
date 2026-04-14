// ========================
// Imports
// ========================

import express from "express";       // Server
import mysql from 'mysql2/promise';  // Database


// ========================
// Environment Setup
// ========================

// Hide database credentials
const dotenv = (await import("dotenv")).default;
dotenv.config();


// ========================
// App Config
// ========================

// Server to listen on
const PORT = process.env.PORT || 3000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));


// ========================
// Middleware
// ========================

// For Express to get values using POST method
app.use(express.urlencoded({ extended: true }));


// ========================
// Database
// ========================

// Setting up database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});


// ========================
// Routes
// ========================

// Routes
app.get("/", (req, res) => {
    res.send("Hello, Express app!");
});

// Verify database connectivity
app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});


// ========================
// Server Startup
// ========================

// Start server and listen for incoming requests on PORT
app.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});
