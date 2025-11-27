import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0
  });

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    status: 'ACTIVE'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    employeeId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // API Base URL
  const API_BASE = 'http://localhost:4000';

  // Check backend connection and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const healthResponse = await fetch(`${API_BASE}/health`);
        if (healthResponse.ok) {
          setBackendStatus('connected');
          await loadEmployees();
          await loadTasks();
        } else {
          setBackendStatus('error');
          setError('Backend server responded with error');
        }
      } catch (err) {
        setBackendStatus('error');
        setError('Backend server is not running. Please start the server on port 4000.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load employees from API
  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        updateStats(data, tasks);
      }
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  // Load tasks from API
  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        updateStats(employees, data);
      }
    } catch (err) {
      setError('Failed to load tasks');
    }
  };

  // Update statistics
  const updateStats = (empData, taskData) => {
    const totalEmployees = empData.length;
    const totalTasks = taskData.length;
    const pendingTasks = taskData.filter(task => task.status === 'TODO' || task.status === 'IN_PROGRESS').length;
    const completedTasks = taskData.filter(task => task.status === 'DONE').length;

    setStats({
      totalEmployees,
      totalTasks,
      pendingTasks,
      completedTasks
    });
  };

  // Add new employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        const employee = await response.json();
        setEmployees(prev => [employee, ...prev]);
        setNewEmployee({ name: '', email: '', role: '', status: 'ACTIVE' });
        setError('');
        updateStats([...employees, employee], tasks);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add employee');
      }
    } catch (err) {
      setError('Failed to add employee');
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) {
      setError('Task title is required');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        employeeId: newTask.employeeId || null
      };

      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks(prev => [task, ...prev]);
        setNewTask({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          employeeId: ''
        });
        setError('');
        updateStats(employees, [...tasks, task]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add task');
      }
    } catch (err) {
      setError('Failed to add task');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        // Also update tasks to remove assignments to this employee
        setTasks(prev => prev.map(task => 
          task.employeeId === id ? { ...task, employeeId: null, employeeName: 'Unassigned' } : task
        ));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete employee');
      }
    } catch (err) {
      setError('Failed to delete employee');
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== id));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Global Styles Component
  const GlobalStyles = () => (
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive design improvements */
        @media (max-width: 768px) {
          .preview-grid {
            grid-template-columns: 1fr !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
          }
          
          .search-input {
            width: 200px !important;
          }
          
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .quick-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-content {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .controls {
            justify-content: flex-start !important;
          }
          
          .search-input {
            width: 100% !important;
          }
        }

        /* Table styles */
        .modern-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .modern-table th {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modern-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 14px;
        }
        
        .modern-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .status-active {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .status-inactive {
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
          border: 1px solid rgba(255, 68, 68, 0.3);
        }
        
        .status-todo {
          background: rgba(255, 170, 0, 0.1);
          color: #ffaa00;
          border: 1px solid rgba(255, 170, 0, 0.3);
        }
        
        .status-in-progress {
          background: rgba(88, 101, 242, 0.1);
          color: #5865f2;
          border: 1px solid rgba(88, 101, 242, 0.3);
        }
        
        .status-done {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .priority-high {
          color: #ff4444;
          font-weight: 600;
        }
        
        .priority-medium {
          color: #ffaa00;
          font-weight: 600;
        }
        
        .priority-low {
          color: #00ff88;
          font-weight: 600;
        }
        
        .action-button {
          padding: 6px 12px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 6px;
          color: #ff4444;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .action-button:hover {
          background: rgba(255, 68, 68, 0.2);
          transform: translateY(-1px);
        }
      `}
    </style>
  );

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={appContainerStyle}>
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <div style={loadingTextStyle}>Loading Application...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div style={appContainerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={headerContentStyle}>
            <div style={logoStyle}>
              <div style={logoIconStyle}>⚡</div>
              <div>
                <h1 style={titleStyle}>Mln Varma - 22BCE9592 </h1>
                <p style={subtitleStyle}>Employee & Task Management System</p>
              </div>
            </div>
            
            <div style={statusContainerStyle}>
              <div style={backendStatusStyle}>
                <div 
                  style={{
                    ...statusDotStyle,
                    backgroundColor: backendStatus === 'connected' ? '#00ff88' : 
                                   backendStatus === 'error' ? '#ff4444' : '#ffaa00'
                  }}
                ></div>
                <span style={statusTextStyle}>
                  Backend: {backendStatus === 'connected' ? 'Connected' : 
                          backendStatus === 'error' ? 'Error' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={navStyle}>
            <button 
              style={activeTab === 'dashboard' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              style={activeTab === 'employees' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setActiveTab('employees')}
            >
              Employees
            </button>
            <button 
              style={activeTab === 'tasks' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
          </nav>
        </header>

        {/* Error Banner */}
        {error && (
          <div style={errorBannerStyle}>
            <span style={errorIconStyle}>⚠️</span>
            {error}
            <button 
              onClick={() => setError('')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <main style={mainStyle}>
          {activeTab === 'dashboard' && (
            <div style={dashboardStyle}>
              {/* Stats Grid */}
              <div style={statsGridStyle}>
                <div style={statCardStyle}>
                  <div style={statIconStyle}>👥</div>
                  <div style={statContentStyle}>
                    <div style={statNumberStyle}>{stats.totalEmployees}</div>
                    <div style={statLabelStyle}>Total Employees</div>
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={statIconStyle}>📋</div>
                  <div style={statContentStyle}>
                    <div style={statNumberStyle}>{stats.totalTasks}</div>
                    <div style={statLabelStyle}>Total Tasks</div>
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={statIconStyle}>⏳</div>
                  <div style={statContentStyle}>
                    <div style={statNumberStyle}>{stats.pendingTasks}</div>
                    <div style={statLabelStyle}>Pending Tasks</div>
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={statIconStyle}>✅</div>
                  <div style={statContentStyle}>
                    <div style={statNumberStyle}>{stats.completedTasks}</div>
                    <div style={statLabelStyle}>Completed Tasks</div>
                  </div>
                </div>
              </div>

              {/* Preview Grid - UPDATED POSITIONS */}
              <div style={previewGridStyle}>
                {/* Quick Add Employee - MOVED TO LEFT */}
                <section style={previewSectionStyle}>
                  <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Quick Add Employee</h2>
                  </div>
                  <div style={quickFormStyle}>
                    <form onSubmit={handleAddEmployee}>
                      <div style={quickFormGrid2Style}>
                        <input
                          type="text"
                          placeholder="Full Name"
                          style={modernInputStyle}
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          style={modernInputStyle}
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          style={modernInputStyle}
                          value={newEmployee.role}
                          onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                          required
                        />
                        <button type="submit" style={primaryButtonStyle}>
                          Add Employee
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Quick Add Task - MOVED TO LEFT */}
                <section style={previewSectionStyle}>
                  <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Quick Add Task</h2>
                  </div>
                  <div style={quickFormStyle}>
                    <form onSubmit={handleAddTask}>
                      <div style={quickFormGridStyle}>
                        <input
                          type="text"
                          placeholder="Task Title"
                          style={modernInputStyle}
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          required
                        />
                        <select 
                          style={modernInputStyle}
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                        <select 
                          style={modernInputStyle}
                          value={newTask.employeeId}
                          onChange={(e) => setNewTask({...newTask, employeeId: e.target.value})}
                        >
                          <option value="">Unassigned</option>
                          {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                        <button type="submit" style={primaryButtonStyle}>
                          Add Task
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Recent Employees - MOVED TO RIGHT */}
                <section style={previewSectionStyle}>
                  <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Recent Employees</h2>
                    <div style={controlsStyle}>
                      <button 
                        style={addButtonStyle}
                        onClick={() => setActiveTab('employees')}
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div style={previewContentStyle}>
                    <div style={compactTableContainer}>
                      {employees.slice(0, 5).length > 0 ? (
                        <table className="modern-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.slice(0, 5).map(employee => (
                              <tr key={employee.id}>
                                <td>
                                  <div style={{ fontWeight: '600' }}>{employee.name}</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    {employee.email}
                                  </div>
                                </td>
                                <td>{employee.role}</td>
                                <td>
                                  <span className={`status-badge status-${employee.status.toLowerCase()}`}>
                                    {employee.status}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="action-button"
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={emptyPreviewStyle}>
                          <div style={emptyPreviewIcon}>👥</div>
                          <div style={emptyPreviewText}>No employees found</div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Recent Tasks - MOVED TO RIGHT */}
                <section style={previewSectionStyle}>
                  <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Recent Tasks</h2>
                    <div style={controlsStyle}>
                      <button 
                        style={addButtonStyle}
                        onClick={() => setActiveTab('tasks')}
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div style={previewContentStyle}>
                    <div style={compactTableContainer}>
                      {tasks.slice(0, 5).length > 0 ? (
                        <table className="modern-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks.slice(0, 5).map(task => (
                              <tr key={task.id}>
                                <td>
                                  <div style={{ fontWeight: '600' }}>{task.title}</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    {task.employeeName || 'Unassigned'}
                                  </div>
                                </td>
                                <td>
                                  <span className={`priority-${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="action-button"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={emptyPreviewStyle}>
                          <div style={emptyPreviewIcon}>📋</div>
                          <div style={emptyPreviewText}>No tasks found</div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <section style={fullSectionStyle}>
              <div style={sectionHeaderStyle}>
                <h2 style={sectionTitleStyle}>All Employees ({employees.length})</h2>
                <div style={controlsStyle}>
                  <div style={searchContainerStyle}>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      style={searchInputStyle}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span style={searchIconStyle}>🔍</span>
                  </div>
                  <select 
                    style={filterSelectStyle}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              
              {/* Employee Form */}
              <div style={formStyle}>
                <form onSubmit={handleAddEmployee}>
                  <div style={formGridStyle}>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      style={modernInputStyle}
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      style={modernInputStyle}
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role *"
                      style={modernInputStyle}
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      required
                    />
                    <button type="submit" style={primaryButtonStyle}>
                      Add Employee
                    </button>
                  </div>
                </form>
              </div>

              <div style={previewContentStyle}>
                <div style={fullTableContainer}>
                  {filteredEmployees.length > 0 ? (
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map(employee => (
                          <tr key={employee.id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{employee.name}</div>
                            </td>
                            <td>{employee.email}</td>
                            <td>{employee.role}</td>
                            <td>
                              <span className={`status-badge status-${employee.status.toLowerCase()}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td>
                              {new Date(employee.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <button 
                                className="action-button"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={emptyPreviewStyle}>
                      <div style={emptyPreviewIcon}>👥</div>
                      <div style={emptyPreviewText}>
                        {employees.length === 0 ? 'No employees found' : 'No employees match your search'}
                      </div>
                      {employees.length === 0 && (
                        <button 
                          style={{...primaryButtonStyle, marginTop: '15px'}}
                          onClick={() => document.querySelector('form')?.scrollIntoView()}
                        >
                          Add First Employee
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'tasks' && (
            <section style={fullSectionStyle}>
              <div style={sectionHeaderStyle}>
                <h2 style={sectionTitleStyle}>All Tasks ({tasks.length})</h2>
                <div style={controlsStyle}>
                  <div style={searchContainerStyle}>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      style={searchInputStyle}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span style={searchIconStyle}>🔍</span>
                  </div>
                  <select 
                    style={filterSelectStyle}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Task Form */}
              <div style={formStyle}>
                <form onSubmit={handleAddTask}>
                  <div style={formGrid2Style}>
                    <input
                      type="text"
                      placeholder="Task Title *"
                      style={modernInputStyle}
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      style={modernInputStyle}
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                    <select 
                      style={modernInputStyle}
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <select 
                      style={modernInputStyle}
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <input
                      type="date"
                      style={modernInputStyle}
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                    <select 
                      style={modernInputStyle}
                      value={newTask.employeeId}
                      onChange={(e) => setNewTask({...newTask, employeeId: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <button type="submit" style={submitButtonStyle}>
                      Create Task
                    </button>
                  </div>
                </form>
              </div>

              <div style={previewContentStyle}>
                <div style={fullTableContainer}>
                  {filteredTasks.length > 0 ? (
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Due Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map(task => (
                          <tr key={task.id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{task.title}</div>
                            </td>
                            <td>{task.description}</td>
                            <td>
                              <span className={`priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td>{task.employeeName || 'Unassigned'}</td>
                            <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                            <td>
                              <button 
                                className="action-button"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={emptyPreviewStyle}>
                      <div style={emptyPreviewIcon}>📋</div>
                      <div style={emptyPreviewText}>
                        {tasks.length === 0 ? 'No tasks found' : 'No tasks match your search'}
                      </div>
                      {tasks.length === 0 && (
                        <button 
                          style={{...primaryButtonStyle, marginTop: '15px'}}
                          onClick={() => document.querySelector('form')?.scrollIntoView()}
                        >
                          Create First Task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

// ===== STYLES SECTION =====
const appContainerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#ffffff"
};

const headerStyle = {
  background: "rgba(15, 15, 35, 0.8)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "20px 0 0 0"
};

const headerContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 30px 20px 30px",
  flexWrap: "wrap",
  gap: "20px"
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px"
};

const logoIconStyle = {
  fontSize: "32px",
  background: "linear-gradient(135deg, #5865f2 0%, #00ff88 100%)",
  borderRadius: "12px",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 20px rgba(88, 101, 242, 0.3)"
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const subtitleStyle = {
  margin: "4px 0 0 0",
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.6)",
  fontWeight: "500"
};

const statusContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px"
};

const backendStatusStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 16px",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

const statusDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  transition: "all 0.3s ease"
};

const statusTextStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "rgba(255, 255, 255, 0.8)"
};

const navStyle = {
  display: "flex",
  padding: "0 30px",
  gap: "4px"
};

const navButtonStyle = {
  padding: "12px 24px",
  background: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  borderRadius: "8px 8px 0 0",
  borderBottom: "2px solid transparent"
};

const activeNavButtonStyle = {
  ...navButtonStyle,
  color: "#00ff88",
  background: "rgba(0, 255, 136, 0.1)",
  borderBottom: "2px solid #00ff88"
};

const errorBannerStyle = {
  margin: "20px 30px",
  padding: "12px 20px",
  borderRadius: "12px",
  backgroundColor: "rgba(255, 68, 68, 0.1)",
  color: "#ff4444",
  border: "1px solid rgba(255, 68, 68, 0.3)",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backdropFilter: "blur(10px)"
};

const errorIconStyle = {
  fontSize: "16px"
};

const loadingStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "50vh",
  gap: "20px"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid rgba(255, 255, 255, 0.1)",
  borderTop: "3px solid #00ff88",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const loadingTextStyle = {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "16px"
};

const mainStyle = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto"
};

const dashboardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "30px"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px"
};

const statCardStyle = {
  background: "rgba(15, 15, 35, 0.6)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const statIconStyle = {
  fontSize: "24px",
  padding: "12px",
  background: "rgba(88, 101, 242, 0.1)",
  borderRadius: "12px",
  border: "1px solid rgba(88, 101, 242, 0.3)"
};

const statContentStyle = {
  flex: 1
};

const statNumberStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#ffffff",
  marginBottom: "4px"
};

const statLabelStyle = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.6)",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const previewGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px"
};

const sectionStyle = {
  background: "rgba(15, 15, 35, 0.6)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  overflow: "hidden"
};

const previewSectionStyle = {
  ...sectionStyle,
  minHeight: "400px"
};

const fullSectionStyle = {
  ...sectionStyle
};

const sectionHeaderStyle = {
  padding: "24px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px"
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "600",
  color: "#ffffff"
};

const controlsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap"
};

const searchContainerStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const searchInputStyle = {
  padding: "10px 40px 10px 15px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  width: "250px",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease"
};

const searchIconStyle = {
  position: "absolute",
  right: "12px",
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "14px"
};

const filterSelectStyle = {
  padding: "10px 15px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
  transition: "all 0.3s ease"
};

const primaryButtonStyle = {
  padding: "10px 20px",
  background: "linear-gradient(135deg, #5865f2 0%, #00ff88 100%)",
  border: "none",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)"
};

const addButtonStyle = {
  ...primaryButtonStyle,
  padding: "8px 16px",
  fontSize: "12px"
};

const formStyle = {
  padding: "24px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(255, 255, 255, 0.02)"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr auto",
  gap: "15px",
  alignItems: "end"
};

const formGrid2Style = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "15px",
  alignItems: "end"
};

const modernInputStyle = {
  padding: "12px 15px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease"
};

const submitButtonStyle = {
  padding: "12px 20px",
  background: "linear-gradient(135deg, #5865f2 0%, #00ff88 100%)",
  border: "none",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  gridColumn: "1 / -1",
  backdropFilter: "blur(10px)"
};

const previewContentStyle = {
  padding: "0 24px 24px 24px"
};

const compactTableContainer = {
  overflowX: "auto",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(15, 15, 35, 0.6)",
  backdropFilter: "blur(10px)",
  minHeight: "200px"
};

const fullTableContainer = {
  overflowX: "auto",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(15, 15, 35, 0.6)",
  backdropFilter: "blur(10px)",
  marginTop: "20px"
};

const emptyPreviewStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  color: "rgba(255, 255, 255, 0.5)",
  textAlign: "center"
};

const emptyPreviewIcon = {
  fontSize: "32px",
  marginBottom: "12px",
  opacity: "0.5"
};

const emptyPreviewText = {
  fontSize: "14px",
  fontWeight: "500"
};

const quickFormsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginTop: "20px"
};

const quickFormSectionStyle = {
  background: "rgba(15, 15, 35, 0.6)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  overflow: "hidden"
};

const quickFormStyle = {
  padding: "20px"
};

const quickFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr auto",
  gap: "12px",
  alignItems: "end"
};

const quickFormGrid2Style = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  alignItems: "end"
};

const cancelButtonStyle = {
  padding: "8px 16px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "12px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.3s ease"
};

export default App;