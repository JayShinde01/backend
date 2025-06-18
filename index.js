require("dotenv").config(); // Load environment variables
const express = require("express");
const mysql = require("mysql2"); // ✅ Use `mysql2` for better async support
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // ✅ Use .env file for security

// ✅ MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root@12345",
  database: "inventary_db",
  port: 3306, // XAMPP default
});

db.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL Database.");
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// ✅ Register New User (Hashes Password Before Storing)
app.post("/register", async (req, res) => {
  const { loginid, password } = req.body;

  if (!loginid || !password) {
    return res.status(400).json({ success: false, message: "Missing login ID or password" });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // ✅ Hash password before storing

  const query = "INSERT INTO users (loginid, password) VALUES (?, ?)";
  db.query(query, [loginid, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", error: err });

    res.json({ success: true, message: "User registered successfully" });
  });
});

// ✅ Login Route
app.post("/login", (req, res) => {
  const { loginid, password } = req.body;

  const query = "SELECT * FROM users WHERE loginid = ?";
  db.query(query, [loginid], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server Error" });

    if (results.length > 0) {
      const user = results[0];
      
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });
});

// ✅ Middleware to Protect Routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid Token" });
    req.userId = decoded.userId;
    next();
  });
};

// ✅ Protected Route Example
app.get("/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "Access granted", userId: req.userId });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
