// routes/employees.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /employees -> list all employees
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM employees ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
    console.log(`✅ Fetched ${rows.length} employees`);
    res.json(rows);
  });
});

// GET /employees/:id -> get single employee by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching employee:', err.message);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(row);
  });
});

// POST /employees -> create a new employee
router.post('/', (req, res) => {
  const { name, email, role, status = 'ACTIVE' } = req.body;

  console.log('📝 Creating new employee:', { name, email, role, status });

  // Basic validation
  if (!name || !email || !role) {
    return res
      .status(400)
      .json({ error: 'name, email, and role are required fields' });
  }

  const sql = `
    INSERT INTO employees (name, email, role, status)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, email, role, status], function (err) {
    if (err) {
      console.error('Error inserting employee:', err.message);
      
      // Handle unique constraint violation (duplicate email)
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      return res.status(500).json({ error: 'Failed to create employee' });
    }

    // Get the created employee to return complete data
    db.get('SELECT * FROM employees WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created employee:', err.message);
        return res.status(500).json({ error: 'Failed to fetch created employee' });
      }
      
      console.log('✅ Employee created:', row);
      res.status(201).json(row);
    });
  });
});

// PUT /employees/:id -> update an employee
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;

  // Validation
  if (!name || !email || !role || !status) {
    return res
      .status(400)
      .json({ error: 'name, email, role, and status are required' });
  }

  const sql = `
    UPDATE employees
    SET name = ?, email = ?, role = ?, status = ?
    WHERE id = ?
  `;

  db.run(sql, [name, email, role, status, id], function (err) {
    if (err) {
      console.error('Error updating employee:', err.message);
      
      // Handle unique constraint violation
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      return res.status(500).json({ error: 'Failed to update employee' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get the updated employee
    db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated employee:', err.message);
        return res.status(500).json({ error: 'Failed to fetch updated employee' });
      }
      
      console.log('✅ Employee updated:', row);
      res.json(row);
    });
  });
});

// DELETE /employees/:id -> delete employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`🗑️ Deleting employee ID: ${id}`);

  // First, unassign this employee from any tasks to maintain referential integrity
  const unassignSql = 'UPDATE tasks SET employee_id = NULL WHERE employee_id = ?';
  
  db.run(unassignSql, [id], function(unassignErr) {
    if (unassignErr) {
      console.error('Error unassigning tasks:', unassignErr.message);
      return res.status(500).json({ error: 'Failed to unassign tasks from employee' });
    }
    
    console.log(`✅ Unassigned ${this.changes} tasks from employee`);
    
    // Now delete the employee
    const deleteSql = 'DELETE FROM employees WHERE id = ?';
    
    db.run(deleteSql, [id], function (deleteErr) {
      if (deleteErr) {
        console.error('Error deleting employee:', deleteErr.message);
        return res.status(500).json({ error: 'Failed to delete employee' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      console.log('✅ Employee deleted successfully');
      res.json({ 
        message: 'Employee deleted successfully',
        tasksUnassigned: this.changes
      });
    });
  });
});

module.exports = router;