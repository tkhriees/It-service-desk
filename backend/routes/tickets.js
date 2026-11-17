const express = require("express");
const pool = require("../config/db");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Create a new support ticket
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate ticket information
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255 ||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string")
    ) {
      return res.status(400).json({
        message: "Invalid ticket title or description"
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description ?? null;

    // Save ticket in MySQL
    const [result] = await pool.execute(
      `INSERT INTO tickets
       (title, description, created_by_user_id)
       VALUES (?, ?, ?)`,
      [cleanTitle, cleanDescription, req.user.userId]
    );

    res.status(201).json({
      message: "Ticket created successfully",
      ticketId: result.insertId,
      status: "Open",
      priority: "Medium"
    });

  } catch (error) {
    console.error("Create ticket error:", error.code || error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});


 // View support tickets
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check the user's current role
    const [users] = await pool.execute(
      "SELECT role FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const isAdmin = users[0].role?.toLowerCase() === "admin";

    let tickets;

    if (isAdmin) {
      // Admin can view all tickets
      [tickets] = await pool.execute(
        `SELECT * FROM tickets
         ORDER BY created_at DESC, id DESC`
      );
    } else {
      // Students can only view their own tickets
      [tickets] = await pool.execute(
        `SELECT * FROM tickets
         WHERE created_by_user_id = ?
         ORDER BY created_at DESC, id DESC`,
        [req.user.userId]
      );
    }

    res.json({
      message: "Tickets retrieved successfully",
      tickets
    });

  } catch (error) {
    console.error("Get tickets error:", error.code || error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});

 // Update ticket status (Admin only)
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const { status } = req.body;

    // Validate ticket ID
    if (!Number.isSafeInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Invalid ticket ID"
      });
    }

    // Validate status
    const allowedStatuses = ["Open", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ticket status"
      });
    }

    // Check user's role in database
    const [users] = await pool.execute(
      "SELECT role FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // Only admins can update tickets
    if (users[0].role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        message: "Only admins can update ticket status"
      });
    }

    // Update ticket in MySQL
    const [result] = await pool.execute(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, ticketId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    res.json({
      message: "Ticket status updated successfully",
      ticketId,
      status
    });

  } catch (error) {
    console.error("Update ticket error:", error.code || error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});

 // Assign ticket to a staff member (Admin only)
router.post("/:id/assign", verifyToken, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const userId = Number(req.body?.userId);

    // Validate IDs
    if (
      !Number.isSafeInteger(ticketId) ||
      ticketId <= 0 ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid ticket ID or user ID"
      });
    }

    // Check whether the logged-in user is an admin
    const [admins] = await pool.execute(
      "SELECT role FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (
      admins.length === 0 ||
      admins[0].role?.toLowerCase() !== "admin"
    ) {
      return res.status(403).json({
        message: "Only admins can assign tickets"
      });
    }

    // Check whether the ticket exists
    const [tickets] = await pool.execute(
      "SELECT id FROM tickets WHERE id = ?",
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Check whether the staff member exists
    const [users] = await pool.execute(
      "SELECT id, role FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Only assign to staff or admins
    const role = users[0].role?.toLowerCase();

    if (!["staff", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Tickets can only be assigned to staff or admins"
      });
    }

    // Prevent assigning the same ticket twice
    const [existing] = await pool.execute(
      "SELECT id FROM assignments WHERE ticket_id = ? LIMIT 1",
      [ticketId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Ticket is already assigned"
      });
    }

    // Save assignment
    const [result] = await pool.execute(
      "INSERT INTO assignments (ticket_id, user_id) VALUES (?, ?)",
      [ticketId, userId]
    );

    res.status(201).json({
      message: "Ticket assigned successfully",
      assignmentId: result.insertId,
      ticketId,
      userId
    });

  } catch (error) {
    console.error("Assignment error:", error.code || error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});
module.exports = router;