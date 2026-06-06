const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Work Order Tracker API is running");
});

// Get all customers
app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get all work orders with optional search and status filter
app.get("/api/work-orders", async (req, res) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT 
        wo.id,
        wo.customer_id,
        c.name AS customer_name,
        wo.title,
        wo.description,
        wo.status,
        wo.created_at
      FROM work_orders wo
      JOIN customers c ON wo.customer_id = c.id
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      sql += `
        AND (
          c.name LIKE ?
          OR wo.title LIKE ?
          OR wo.description LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += " AND wo.status = ?";
      params.push(status);
    }

    sql += " ORDER BY wo.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error getting work orders:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Create new work order
app.post("/api/work-orders", async (req, res) => {
  try {
    const { customer_id, title, description, status } = req.body;

    if (!customer_id || !title) {
      return res.status(400).json({
        message: "Customer and title are required",
      });
    }

    const sql = `
      INSERT INTO work_orders 
      (customer_id, title, description, status)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      customer_id,
      title,
      description || "",
      status || "New",
    ]);

    res.status(201).json({
      message: "Work order created",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating work order:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Update work order
app.put("/api/work-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, title, description, status } = req.body;

    if (!customer_id || !title || !status) {
      return res.status(400).json({
        message: "Customer, title, and status are required",
      });
    }

    const sql = `
      UPDATE work_orders
      SET customer_id = ?, title = ?, description = ?, status = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      customer_id,
      title,
      description || "",
      status,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Work order not found" });
    }

    res.json({ message: "Work order updated" });
  } catch (error) {
    console.error("Error updating work order:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Delete work order
app.delete("/api/work-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM work_orders WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Work order not found" });
    }

    res.json({ message: "Work order deleted" });
  } catch (error) {
    console.error("Error deleting work order:", error);
    res.status(500).json({ message: "Database error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});