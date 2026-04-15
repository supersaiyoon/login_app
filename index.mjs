// ========================
// Imports
// ========================

import express from "express";         // Server
import mysql from 'mysql2/promise';    // Database
import bcrypt from "bcrypt";           // Password hashing
import session from "express-session"; // Session management


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

// For Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

// Session management
app.set("trust proxy", 1);
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
}));


// ========================
// Middleware
// ========================

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect("/");
    }
    else {
        next();
    }
}

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

// Root: Login page
app.get("/", (req, res) => {
    res.render("login");
});

// Login
app.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let passwordHash = "";

    let sql = `SELECT *
               FROM admin
               WHERE username = ?`;

    const [rows] = await pool.query(sql, [username]);

    if (rows.length > 0) {
        passwordHash = rows[0].password;
    }

    let match = await bcrypt.compare(password, passwordHash);

    if (match) {
        req.session.authenticated = true;
        res.render("welcome");
    }
    else {
        res.redirect("/");
    }
});

app.get("/myProfile", isAuthenticated, (req, res) => {
    res.render("profile");
});

app.get("/logout", isAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect("/");
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
