// routes/tasks.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /tasks - all tasks with employee information
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      e.name as employee_name,
      e.email as employee_email
    FROM tasks t 
    LEFT JOIN employees e ON t.employee_id = e.id 
    ORDER BY t.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching tasks:", err.message);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
    
    // Transform data to match frontend expectations
    const tasks = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date, // Map due_date to dueDate
      employeeId: row.employee_id, // Map employee_id to employeeId
      employeeName: row.employee_name || 'Unassigned'
    }));
    
    console.log(`✅ Fetched ${tasks.length} tasks`);
    res.json(tasks);
  });
});

// POST /tasks - create task
router.post("/", (req, res) => {
  const { title, description, status = 'TODO', priority = 'MEDIUM', dueDate, employeeId } = req.body;

  console.log('📝 Creating new task:', { title, description, status, priority, dueDate, employeeId });

  // Validation
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Validate status
  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  // Validate priority
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ 
      error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
    });
  }

  const sql = `
    INSERT INTO tasks (title, description, status, priority, due_date, employee_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Convert empty string to null for employeeId and handle dueDate
  const empId = (employeeId === '' || employeeId === null || employeeId === undefined) ? null : employeeId;
  const formattedDueDate = dueDate || null;

  db.run(
    sql,
    [
      title,
      description || "",
      status,
      priority,
      formattedDueDate,
      empId
    ],
    function (err) {
      if (err) {
        console.error("Error inserting task:", err.message);
        return res.status(500).json({ error: "Failed to create task" });
      }

      // Get the created task with employee info
      const getTaskSql = `
        SELECT 
          t.*, 
          e.name as employee_name 
        FROM tasks t 
        LEFT JOIN employees e ON t.employee_id = e.id 
        WHERE t.id = ?
      `;
      
      db.get(getTaskSql, [this.lastID], (err, row) => {
        if (err) {
          console.error("Error fetching created task:", err.message);
          return res.status(500).json({ error: "Failed to fetch created task" });
        }

        const newTask = {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          dueDate: row.due_date,
          employeeId: row.employee_id,
          employeeName: row.employee_name || 'Unassigned',
          created_at: row.created_at
        };

        console.log('✅ Task created:', newTask);
        res.status(201).json(newTask);
      });
    }
  );
});

// DELETE /tasks/:id - delete task
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  console.log(`🗑️ Deleting task ID: ${id}`);

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting task:", err.message);
      return res.status(500).json({ error: "Failed to delete task" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    console.log('✅ Task deleted successfully');
    res.json({ message: "Task deleted successfully" });
  });
});

// GET /tasks/:id - get single task
router.get("/:id", (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      t.*, 
      e.name as employee_name 
    FROM tasks t 
    LEFT JOIN employees e ON t.employee_id = e.id 
    WHERE t.id = ?
  `;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching task:", err.message);
      return res.status(500).json({ error: "Failed to fetch task" });
    }
    
    if (!row) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    const task = {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      employeeId: row.employee_id,
      employeeName: row.employee_name || 'Unassigned'
    };
    
    res.json(task);
  });
});

// PUT /tasks/:id - update task
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, employeeId } = req.body;
  
  console.log(`✏️ Updating task ID: ${id}`, req.body);

  // Validation
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const sql = `
    UPDATE tasks 
    SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, employee_id = ?
    WHERE id = ?
  `;
  
  const empId = (employeeId === '' || employeeId === null || employeeId === undefined) ? null : employeeId;
  const params = [title, description, status, priority, dueDate, empId, id];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Error updating task:", err.message);
      return res.status(500).json({ error: "Failed to update task" });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    console.log('✅ Task updated successfully');
    res.json({ 
      message: "Task updated successfully",
      changes: this.changes
    });
  });
});

module.exports = router;