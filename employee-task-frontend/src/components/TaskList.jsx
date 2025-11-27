// src/components/TaskList.jsx
import { useState } from 'react';

function TaskList({ tasks, employees, onDelete }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const getEmployeeName = (id) =>
    employees.find((e) => e.id === id)?.name || "Unassigned";

  const getEmployeeAvatar = (id) => {
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.name.split(' ').map(n => n[0]).join('') : '?';
  };

  const filteredTasks = selectedStatus === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.status === selectedStatus);

  return (
    <div style={containerStyle}>
      {/* Filter Header */}
      <div style={filterContainerStyle}>
        <div style={filterTitleStyle}>Task Status Filter</div>
        <div style={filterGroupStyle}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <button
              key={status}
              style={{
                ...filterButtonStyle,
                ...(selectedStatus === status ? activeFilterButtonStyle : {})
              }}
              onClick={() => setSelectedStatus(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={taskCountStyle}>
          {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={headerRowStyle}>
            <th style={thStyle}>Task Details</th>
            <th style={thStyle}>Assignee</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Priority</th>
            <th style={thStyle}>Due Date</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task, index) => (
            <tr 
              key={task.id}
              style={{
                ...tableRowStyle,
                ...(hoveredRow === task.id ? hoverRowStyle : {}),
                animationDelay: `${index * 0.03}s`
              }}
              onMouseEnter={() => setHoveredRow(task.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td style={tdStyle}>
                <div style={taskTitleStyle}>
                  <div style={taskIconStyle}>📋</div>
                  <div>
                    <div style={titleTextStyle}>{task.title}</div>
                    {task.description && (
                      <div style={descriptionStyle}>{task.description}</div>
                    )}
                  </div>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={assigneeStyle}>
                  <div style={{
                    ...avatarStyle,
                    background: task.employeeId ? 
                      "linear-gradient(135deg, #5865f2 0%, #00ff88 100%)" : 
                      "linear-gradient(135deg, #666 0%, #999 100%)"
                  }}>
                    {getEmployeeAvatar(task.employeeId)}
                  </div>
                  <div style={assigneeInfoStyle}>
                    <div style={assigneeNameStyle}>
                      {getEmployeeName(task.employeeId)}
                    </div>
                    <div style={assigneeRoleStyle}>
                      {task.employeeId ? 'Assigned' : 'Not Assigned'}
                    </div>
                  </div>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={statusContainerStyle}>
                  <span style={getTaskStatusStyle(task.status)}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <div style={{
                    ...statusGlowStyle,
                    ...getStatusGlowStyle(task.status)
                  }} />
                </div>
              </td>
              <td style={tdStyle}>
                <div style={priorityContainerStyle}>
                  <span style={getPriorityStyle(task.priority)}>
                    <div style={priorityIconStyle}>
                      {getPriorityIcon(task.priority)}
                    </div>
                    {task.priority}
                  </span>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={dueDateStyle}>
                  <div style={dateTextStyle}>{task.dueDate}</div>
                  <div style={getDueDateAlertStyle(task.dueDate)}>
                    {getDueDateAlert(task.dueDate)}
                  </div>
                </div>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => onDelete(task.id)}
                  style={deleteBtnStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.background = "rgba(255, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.background = "rgba(255, 68, 68, 0.1)";
                  }}
                >
                  <span style={deleteIcon}>🗑️</span>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredTasks.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>📝</div>
          <div style={emptyTextStyle}>No tasks found</div>
          <div style={emptySubtextStyle}>
            {selectedStatus === 'ALL' 
              ? 'Create your first task to get started' 
              : `No tasks with status "${selectedStatus.replace('_', ' ')}"`}
          </div>
        </div>
      )}
    </div>
  );
}

// Futuristic Styles
const containerStyle = {
  background: "linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  borderRadius: "20px",
  padding: "2px",
  backgroundImage: `
    radial-gradient(circle at 20% 30%, rgba(255, 171, 0, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.1) 0%, transparent 25%)
  `,
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

const filterContainerStyle = {
  padding: "20px 24px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(15, 15, 35, 0.8)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px"
};

const filterTitleStyle = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const filterGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const filterButtonStyle = {
  padding: "8px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "12px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const activeFilterButtonStyle = {
  background: "linear-gradient(135deg, rgba(88, 101, 242, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)",
  color: "#00ff88",
  border: "1px solid rgba(0, 255, 136, 0.3)",
  boxShadow: "0 4px 12px rgba(0, 255, 136, 0.2)"
};

const taskCountStyle = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "12px",
  fontWeight: "500"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
  background: "rgba(15, 15, 35, 0.95)",
  borderRadius: "0 0 18px 18px",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  minHeight: "400px"
};

const headerRowStyle = {
  background: "linear-gradient(90deg, rgba(255, 171, 0, 0.15) 0%, rgba(0, 200, 255, 0.1) 100%)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
};

const thStyle = {
  padding: "20px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "rgba(255, 255, 255, 0.7)",
  border: "none"
};

const tableRowStyle = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  opacity: "0",
  animation: "slideInRight 0.5s ease-out forwards",
  transition: "all 0.3s ease",
  background: "transparent"
};

const hoverRowStyle = {
  background: "rgba(255, 171, 0, 0.08)",
  transform: "translateX(8px)",
  borderLeft: "3px solid #ffab00"
};

const tdStyle = {
  padding: "18px 16px",
  border: "none",
  color: "rgba(255, 255, 255, 0.9)"
};

const taskTitleStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  maxWidth: "250px"
};

const taskIconStyle = {
  fontSize: "16px",
  marginTop: "2px"
};

const titleTextStyle = {
  fontWeight: "600",
  fontSize: "14px",
  color: "white",
  lineHeight: "1.4"
};

const descriptionStyle = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.6)",
  marginTop: "4px",
  lineHeight: "1.3"
};

const assigneeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const avatarStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  fontSize: "10px",
  color: "white",
  boxShadow: "0 4px 12px rgba(88, 101, 242, 0.3)",
  flexShrink: 0
};

const assigneeInfoStyle = {
  minWidth: "0"
};

const assigneeNameStyle = {
  fontWeight: "500",
  fontSize: "13px",
  color: "white",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const assigneeRoleStyle = {
  fontSize: "11px",
  color: "rgba(255, 255, 255, 0.5)",
  marginTop: "2px"
};

const statusContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const statusGlowStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  animation: "pulse 2s infinite"
};

const priorityContainerStyle = {
  display: "flex",
  alignItems: "center"
};

const priorityIconStyle = {
  display: "inline-flex",
  marginRight: "6px",
  fontSize: "12px"
};

const dueDateStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const dateTextStyle = {
  fontSize: "13px",
  fontWeight: "500",
  color: "rgba(255, 255, 255, 0.9)"
};

const deleteBtnStyle = {
  padding: "8px 14px",
  fontSize: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 68, 68, 0.3)",
  background: "rgba(255, 68, 68, 0.1)",
  color: "#ff4444",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.3s ease",
  fontWeight: "500",
  backdropFilter: "blur(10px)"
};

const deleteIcon = {
  fontSize: "12px"
};

const emptyStateStyle = {
  padding: "60px 20px",
  textAlign: "center",
  color: "rgba(255, 255, 255, 0.6)"
};

const emptyIconStyle = {
  fontSize: "48px",
  marginBottom: "16px",
  opacity: "0.5"
};

const emptyTextStyle = {
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "8px",
  color: "rgba(255, 255, 255, 0.8)"
};

const emptySubtextStyle = {
  fontSize: "14px",
  opacity: "0.7"
};

// Enhanced status styling with animations
function getTaskStatusStyle(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backdropFilter: "blur(10px)",
    border: "1px solid transparent",
    transition: "all 0.3s ease"
  };

  const styles = {
    'TODO': {
      background: "rgba(255, 171, 0, 0.15)",
      color: "#ffab00",
      borderColor: "rgba(255, 171, 0, 0.4)",
      boxShadow: "0 4px 12px rgba(255, 171, 0, 0.2)"
    },
    'IN_PROGRESS': {
      background: "rgba(0, 200, 255, 0.15)",
      color: "#00c8ff",
      borderColor: "rgba(0, 200, 255, 0.4)",
      boxShadow: "0 4px 12px rgba(0, 200, 255, 0.2)"
    },
    'DONE': {
      background: "rgba(0, 255, 136, 0.15)",
      color: "#00ff88",
      borderColor: "rgba(0, 255, 136, 0.4)",
      boxShadow: "0 4px 12px rgba(0, 255, 136, 0.2)"
    }
  };

  return {
    ...base,
    ...(styles[status] || styles['DONE'])
  };
}

function getStatusGlowStyle(status) {
  const colors = {
    'TODO': '#ffab00',
    'IN_PROGRESS': '#00c8ff',
    'DONE': '#00ff88'
  };
  return { backgroundColor: colors[status] || '#00ff88' };
}

// Enhanced priority styling
function getPriorityStyle(priority) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backdropFilter: "blur(10px)",
    border: "1px solid transparent"
  };

  const styles = {
    'HIGH': {
      background: "rgba(255, 68, 68, 0.15)",
      color: "#ff4444",
      borderColor: "rgba(255, 68, 68, 0.4)",
      boxShadow: "0 4px 12px rgba(255, 68, 68, 0.2)"
    },
    'MEDIUM': {
      background: "rgba(255, 171, 0, 0.15)",
      color: "#ffab00",
      borderColor: "rgba(255, 171, 0, 0.4)",
      boxShadow: "0 4px 12px rgba(255, 171, 0, 0.2)"
    },
    'LOW': {
      background: "rgba(0, 200, 255, 0.15)",
      color: "#00c8ff",
      borderColor: "rgba(0, 200, 255, 0.4)",
      boxShadow: "0 4px 12px rgba(0, 200, 255, 0.2)"
    }
  };

  return {
    ...base,
    ...(styles[priority] || styles['LOW'])
  };
}

function getPriorityIcon(priority) {
  const icons = {
    'HIGH': '🔥',
    'MEDIUM': '⚡',
    'LOW': '💧'
  };
  return icons[priority] || '💧';
}

function getDueDateAlertStyle(dueDate) {
  return {
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 6px",
    borderRadius: "6px",
    background: "rgba(255, 68, 68, 0.1)",
    color: "#ff4444"
  };
}

function getDueDateAlert(dueDate) {
  // Simple implementation - you can enhance this with actual date comparison
  return "Due Soon";
}

// Add these global styles to your CSS
const globalStyles = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

console.log('Add these global styles to your CSS:', globalStyles);

export default TaskList;