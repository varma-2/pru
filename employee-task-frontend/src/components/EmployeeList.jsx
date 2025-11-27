// src/components/EmployeeList.jsx
import { useState } from 'react';

function EmployeeList({ employees, onDelete }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr style={headerRowStyle}>
            <th style={thStyle}>Employee</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr 
              key={emp.id}
              style={{
                ...tableRowStyle,
                ...(hoveredRow === emp.id ? hoverRowStyle : {}),
                animationDelay: `${index * 0.05}s`
              }}
              onMouseEnter={() => setHoveredRow(emp.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td style={tdStyle}>
                <div style={nameCellStyle}>
                  <div style={avatarStyle}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={nameStyle}>{emp.name}</div>
                    <div style={employeeIdStyle}>ID: {emp.id}</div>
                  </div>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={emailStyle}>{emp.email}</div>
              </td>
              <td style={tdStyle}>
                <span style={getRoleStyle(emp.role)}>
                  {emp.role}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={statusContainerStyle}>
                  <span style={getEmployeeStatusStyle(emp.status)}>
                    {emp.status}
                  </span>
                  <div style={{
                    ...statusPulseStyle,
                    backgroundColor: emp.status === "ACTIVE" ? "#00ff88" : "#ff4444"
                  }} />
                </div>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => onDelete(emp.id)}
                  style={deleteBtnStyle}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  <span style={deleteIcon}>🗑️</span>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Modern futuristic styles
const containerStyle = {
  background: "linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  borderRadius: "20px",
  padding: "2px",
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(0, 255, 136, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(88, 101, 242, 0.1) 0%, transparent 20%)
  `,
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
  background: "rgba(15, 15, 35, 0.95)",
  borderRadius: "18px",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.05)"
};

const headerRowStyle = {
  background: "linear-gradient(90deg, rgba(88, 101, 242, 0.15) 0%, rgba(0, 255, 136, 0.1) 100%)",
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
  border: "none",
  position: "relative"
};

const tableRowStyle = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  opacity: "0",
  animation: "fadeInUp 0.6s ease-out forwards",
  transition: "all 0.3s ease",
  background: "transparent"
};

const hoverRowStyle = {
  background: "rgba(88, 101, 242, 0.1)",
  transform: "translateX(8px)",
  borderLeft: "3px solid #5865f2"
};

const tdStyle = {
  padding: "18px 16px",
  border: "none",
  color: "rgba(255, 255, 255, 0.9)"
};

const nameCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #5865f2 0%, #00ff88 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  fontSize: "12px",
  color: "white",
  boxShadow: "0 4px 12px rgba(88, 101, 242, 0.3)"
};

const nameStyle = {
  fontWeight: "600",
  fontSize: "14px",
  color: "white"
};

const employeeIdStyle = {
  fontSize: "11px",
  color: "rgba(255, 255, 255, 0.5)",
  marginTop: "2px"
};

const emailStyle = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "13px"
};

const statusContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const statusPulseStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  animation: "pulse 2s infinite"
};

const deleteBtnStyle = {
  padding: "8px 16px",
  fontSize: "12px",
  borderRadius: "8px",
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

function getEmployeeStatusStyle(status) {
  const base = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backdropFilter: "blur(10px)",
    border: "1px solid transparent"
  };

  if (status === "ACTIVE") {
    return {
      ...base,
      background: "rgba(0, 255, 136, 0.1)",
      color: "#00ff88",
      borderColor: "rgba(0, 255, 136, 0.3)",
      boxShadow: "0 4px 12px rgba(0, 255, 136, 0.2)"
    };
  }

  return {
    ...base,
    background: "rgba(255, 68, 68, 0.1)",
    color: "#ff4444",
    borderColor: "rgba(255, 68, 68, 0.3)",
    boxShadow: "0 4px 12px rgba(255, 68, 68, 0.2)"
  };
}

function getRoleStyle(role) {
  const roleColors = {
    'ADMIN': { bg: 'rgba(88, 101, 242, 0.1)', color: '#5865f2', border: 'rgba(88, 101, 242, 0.3)' },
    'MANAGER': { bg: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', border: 'rgba(255, 171, 0, 0.3)' },
    'DEVELOPER': { bg: 'rgba(0, 200, 255, 0.1)', color: '#00c8ff', border: 'rgba(0, 200, 255, 0.3)' },
    'DESIGNER': { bg: 'rgba(157, 0, 255, 0.1)', color: '#9d00ff', border: 'rgba(157, 0, 255, 0.3)' }
  };

  const roleConfig = roleColors[role.toUpperCase()] || { 
    bg: 'rgba(255, 255, 255, 0.1)', 
    color: 'rgba(255, 255, 255, 0.8)', 
    border: 'rgba(255, 255, 255, 0.2)' 
  };

  return {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    background: roleConfig.bg,
    color: roleConfig.color,
    border: `1px solid ${roleConfig.border}`,
    backdropFilter: "blur(10px)"
  };
}

// Add these global styles to your CSS
const globalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Add this to your global CSS file
console.log('Add these global styles to your CSS:', globalStyles);

export default EmployeeList;