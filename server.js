require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);
    isValidExt && isValidMime ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL Database.");
});

// Test API
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// Register
app.post("/register", async (req, res) => {
  const { loginid, password } = req.body;
  if (!loginid || !password)
    return res.status(400).json({ success: false, message: "Missing login ID or password" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (loginid, password) VALUES (?, ?)";
    db.query(sql, [loginid, hashedPassword], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "User already exists or DB error" });
      }
      res.json({ success: true, message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// Login
app.post("/login", (req, res) => {
  const { loginid, password } = req.body;
  if (!loginid || !password)
    return res.status(400).json({ success: false, message: "Missing credentials" });

  const sql = "SELECT * FROM users WHERE loginid = ?";
  db.query(sql, [loginid], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ success: true, token });
      } else {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });
});

// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid Token" });
    req.userId = decoded.userId;
    next();
  });
};

// Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "Access granted", userId: req.userId });
});

// Upload route
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({ success: true, filePath: `/uploads/${req.file.filename}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// ✅ CRUD Operations: Items
app.route("/api/items")
  .get((req, res) => db.query("SELECT * FROM item", (err, results) => err ? res.status(500).json(err) : res.json(results)))
  .post((req, res) => {
    const { itemNumber, itemName, status, description, discount, stock, unitPrice, imageURL } = req.body;
    const sql = `INSERT INTO item (itemNumber, itemName, status, description, discount, stock, unitPrice, imageURL) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [itemNumber, itemName, status, description, discount, stock, unitPrice, imageURL], (err, result) =>
      err ? res.status(500).json(err) : res.json({ message: "Item added successfully", productID: result.insertId })
    );
  });

  app.route("/api/items/:id")
  .put((req, res) => {
    console.log("Request Body:", req.body); // Log the incoming data to check
    const { itemNumber, itemName, status, description, discount, stock, unitPrice, imageURL } = req.body;
    const sql = `UPDATE item SET itemNumber=?, itemName=?, status=?, description=?, discount=?, stock=?, unitPrice=?, imageURL=? WHERE productID=?`;

    db.query(sql, [itemNumber, itemName, status, description, discount, stock, unitPrice, imageURL, req.params.id], (err, result) => {
      if (err) {
        console.error("Error during update:", err);  // Log error if any
        return res.status(500).json({ error: err });
      }

      // Log the result of the update query
      console.log("Update Result:", result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Item not found or no changes made" });
      }

      return res.json({ message: "Item updated successfully" });
    });
  })
  
  .delete((req, res) => {
    db.query("DELETE FROM item WHERE productID=?", [req.params.id], (err, result) => {
      if (err) {
        console.error("Error during delete:", err);  // Log error if any
        return res.status(500).json({ error: err });
      }

      // Log the result of the delete query
      console.log("Delete Result:", result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.json({ message: "Item deleted successfully" });
    });
  });

  app.get("/api/items/itemNumber/:itemNumber", (req, res) => {
    const { itemNumber } = req.params;
    const sql = "SELECT * FROM item WHERE itemNumber = ?";
    db.query(sql, [itemNumber], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(results[0]); // Send back the first matching item
    });
  });
  // Update Item Stock After Sale
app.put("/api/items/update-stock/:id", (req, res) => {
  const { quantitySold } = req.body;
  const { id } = req.params;

  const sql = "UPDATE item SET stock = stock - ? WHERE productID = ?";
  db.query(sql, [quantitySold, id], (err, result) => {
    if (err) {
      console.error("Error during stock update:", err);
      return res.status(500).json({ error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or insufficient stock" });
    }

    return res.json({ message: "Stock updated successfully" });
  });
});


// ✅ Route: Upload Image
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const imageUrl = `uploads/${req.file.filename}`;
  db.query("UPDATE item SET imageURL = ? WHERE itemNumber = ?", [imageUrl, req.body.itemNumber], (err) =>
    err ? res.status(500).json({ success: false, message: "Database update failed", error: err })
        : res.json({ success: true, message: "Image uploaded", imageUrl })
  );
});


// ✅ Route: Add a new purchase
app.post("/api/purchases", (req, res) => {
  const { itemNumber, purchaseDate, purchaseID, itemName, currentStock, vendorName, quantity, unitPrice } = req.body;
  const totalCost = quantity * unitPrice;

  const sql = "INSERT INTO purchases (itemNumber, purchaseDate, purchaseID, itemName, currentStock, vendorName, quantity, unitPrice, totalCost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(sql, [itemNumber, purchaseDate, purchaseID, itemName, currentStock, vendorName, quantity, unitPrice, totalCost], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error", error: err });
    }
    res.json({ success: true, message: "Purchase added successfully" });
  });
});

// ✅ GET all customers
app.get('/api/customer', (req, res) => {
  const sql = 'SELECT * FROM customers';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send('DB Error');
    res.json(result);
  });
});
// GET customer by mobile number
app.get('/api/customer/:phoneMobile', (req, res) => {
  const { phoneMobile } = req.params;
  const sql = 'SELECT * FROM customers WHERE phone_mobile = ?';
  db.query(sql, [phoneMobile], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(results[0]);
  });
});

// ✅ ADD customer (check duplicate mobile)
app.post('/api/customer', (req, res) => {
  const {
    fullName, status, phoneMobile, phone2, email,
    address, address2, city
  } = req.body;

  const checkQuery = 'SELECT * FROM customers WHERE phone_mobile = ?';
  db.query(checkQuery, [phoneMobile], (err, results) => {
    if (err) return res.status(500).send('Server error');

    if (results.length > 0) {
      return res.status(400).json({ message: 'exists' });
    }

    const insertQuery = `
      INSERT INTO customers (
        full_name, status, phone_mobile, phone2, email,
        address, address2, city
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [
      fullName, status, phoneMobile, phone2, email,
      address, address2, city
    ], (err, result) => {
      if (err) return res.status(500).send('Insert failed');
      res.status(200).json({ message: 'success', id: result.insertId });
    });
  });
});

// ✅ UPDATE customer
app.put('/api/customer/:id', (req, res) => {
  const id = req.params.id;
  const {
    fullName, status, phoneMobile, phone2, email,
    address, address2, city, district
  } = req.body;

  const updateQuery = `
    UPDATE customers SET 
      full_name = ?, status = ?, phone_mobile = ?, phone2 = ?, email = ?,
      address = ?, address2 = ?, city = ?, district = ?
    WHERE customer_id = ?
  `;

  db.query(updateQuery, [
    fullName, status, phoneMobile, phone2, email,
    address, address2, city, district, id
  ], (err, result) => {
    if (err) return res.status(500).send('Update failed');
    res.status(200).json({ message: 'updated' });
  });
});

// ✅ DELETE customer
app.delete('/api/customer/:id', (req, res) => {
  const id = req.params.id;
  const deleteQuery = 'DELETE FROM customers WHERE customer_id = ?';
  db.query(deleteQuery, [id], (err, result) => {
    if (err) return res.status(500).send('Delete failed');
    res.status(200).json({ message: 'deleted' });
  });
});

app.post("/api/sales", (req, res) => {
  const {
    invoiceDate,
    invoiceNo,
    customerId,
    customerName,
    paymentMode,
    totalTax,         // correct key from frontend
    totalDiscount,    // correct key from frontend
    totalPayable,     // ✅ use this instead of totalAmount
    paidAmount,
    dueAmount,
    status,
    mobile_no,        // optional - based on your frontend data
    products
  } = req.body;
console.log(req.body);

  // ✅ Validate products array
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: "Products array is missing or empty" });
  }

  console.log("🧾 Invoice Data:", {
    invoiceDate,
    invoiceNo,
    customerId,
    customerName,
    paymentMode,
    totalTax,
    totalDiscount,
    totalPayable,
    paidAmount,
    dueAmount,
    status,
    mobile_no
  });

  console.log("📦 Products Received:", products);

  // ✅ Insert into sales_invoice
  const invoiceSQL = `
    INSERT INTO sales_invoice (
      invoice_date,
      invoice_no,
      customer_id,
      customer_name,
      payment_mode,
      total_tax,
      total_discount,
      total_payable,
      paid_amount,
      due_amount,
      status,
      mobile_no
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    invoiceSQL,
    [
      invoiceDate,
      invoiceNo,
      customerId,
      customerName,
      paymentMode,
      totalTax,
      totalDiscount,
      totalPayable, // ✅ fixed here
      paidAmount,
      dueAmount,
      status,
      mobile_no
    ],
    (err, invoiceResult) => {
      if (err) {
        console.error("❌ Invoice insert error:", err);
        return res.status(500).json({ success: false, message: "Invoice creation failed", error: err });
      }

      const invoiceId = invoiceResult.insertId;

      // ✅ Prepare values for sales_invoice_items
      const productValues = products.map((p) => [
        invoiceId,
        p.productID || null,
        p.itemNumber || null,
        p.itemName || null,
        p.quantity || 0,
        p.unitPrice || 0,
        p.discount || 0,
        p.total || 0
      ]);

      const productSQL = `
        INSERT INTO sales_invoice_items (
          invoice_id,
          product_id,
          itemNumber,
          itemName,
          quantity,
          unitPrice,
          discount,
          total
        ) VALUES ?
      `;

      db.query(productSQL, [productValues], (err2) => {
        if (err2) {
          console.error("❌ Product insert error:", err2);
          return res.status(500).json({ success: false, message: "Product insert failed", error: err2 });
        }

        // ✅ Success
        res.status(200).json({ success: true, message: "Sales Invoice created successfully", invoiceId });
      });
    }
  );
});

app.get("/api/sales", (req, res) => {
  // Query to get all invoices along with products
  const invoiceSQL = `
    SELECT * FROM sales_invoice;
  `;

  db.query(invoiceSQL, (err, invoices) => {
    if (err) {
      console.error("❌ Error fetching invoices:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch invoices", error: err });
    }

    // Query to get all products associated with the invoices
    const productSQL = `
      SELECT * FROM sales_invoice_items;
    `;

    db.query(productSQL, (err2, products) => {
      if (err2) {
        console.error("❌ Error fetching products:", err2);
        return res.status(500).json({ success: false, message: "Failed to fetch products", error: err2 });
      }

      // Combine invoices with their corresponding products
      const invoicesWithProducts = invoices.map((invoice) => {
        // Get products for this invoice
        const invoiceProducts = products.filter((product) => product.invoice_id === invoice.invoice_id);
        return { ...invoice, products: invoiceProducts };
      });

      res.status(200).json({ success: true, invoices: invoicesWithProducts });
    });
  });
});

// 1. Add a new vendor
app.post("/api/vendors", (req, res) => {
  const { fullName, status, phoneMobile, phone2, email, address, address2, city, district } = req.body;

  const query = `
    INSERT INTO vendors (full_name, status,  phone_mobile, phone_2, email, address, address_2, city, district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,  ?)
  `;

  db.query(
    query,
    [fullName, status,  phoneMobile, phone2, email, address, address2, city, district],
    (err, result) => {
      if (err) {
        console.error("Error adding vendor:", err);
        res.status(500).send("Error adding vendor");
      } else {
        res.status(200).send({ message: "Vendor added successfully", vendorID: result.insertId });
      }
    }
  );
});

// 2. Update an existing vendor
app.put("/api/vendors/:vendorID", (req, res) => {
  const { fullName, status, phoneMobile, phone2, email, address, address2, city, district } = req.body;
  const vendorID = req.params.vendorID;

  const query = `
    UPDATE vendors
    SET full_name = ?, status = ?, phone_mobile = ?, phone_2 = ?, email = ?, address = ?, address_2 = ?, city = ?, district = ?
    WHERE vendorID = ?
  `;

  db.query(
    query,
    [fullName, status, phoneMobile, phone2, email, address, address2, city, district, vendorID],
    (err, result) => {
      if (err) {
        console.error("Error updating vendor:", err);
        res.status(500).send("Error updating vendor");
      } else {
        res.status(200).send({ message: "Vendor updated successfully" });
      }
    }
  );
});

// 3. Delete a vendor
app.delete("/api/vendors/:vendorID", (req, res) => {
  const vendorID = req.params.vendorID;

  const query = `DELETE FROM vendors WHERE vendorID = ?`;

  db.query(query, [vendorID], (err, result) => {
    if (err) {
      console.error("Error deleting vendor:", err);
      res.status(500).send("Error deleting vendor");
    } else {
      res.status(200).send({ message: "Vendor deleted successfully" });
    }
  });
});

// 4. Get all vendors (Optional, for testing)
app.get("/api/vendors", (req, res) => {
  const query = "SELECT * FROM vendors";
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching vendors:", err);
      res.status(500).send("Error fetching vendors");
    } else {
      res.status(200).send(result);
    }
  });
});

// 5. Get vendor by ID (Optional, for testing)
app.get("/api/vendors/:vendorID", (req, res) => {
  const vendorID = req.params.vendorID;
  const query = "SELECT * FROM vendors WHERE vendorID = ?";

  db.query(query, [vendorID], (err, result) => {
    if (err) {
      console.error("Error fetching vendor:", err);
      res.status(500).send("Error fetching vendor");
    } else {
      if (result.length > 0) {
        res.status(200).send(result[0]);
      } else {
        res.status(404).send({ message: "Vendor not found" });
      }
    }
  });
});
// Get vendor by phone number
app.get("/api/vendors/phone/:phone", async (req, res) => {
  const { phone } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM vendors WHERE phone_mobile = ?", [phone]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (err) {
    console.error("Error fetching vendor by phone:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
