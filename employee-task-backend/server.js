// server.js
const express = require('express');
const cors = require('cors');

console.log('🚀 Starting server.js...');

const app = express();

// runs db.js and creates DB + tables
require('./db');

const employeesRouter = require('./routes/employees');
const tasksRouter = require('./routes/tasks');

app.use(cors());
app.use(express.json());

app.use('/employees', employeesRouter);
app.use('/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Employee & Task API is running',
    endpoints: {
      employees: '/employees',
      tasks: '/tasks'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Employee Task Management API'
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Employees endpoint: http://localhost:${PORT}/employees`);
  console.log(`📋 Tasks endpoint: http://localhost:${PORT}/tasks`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});