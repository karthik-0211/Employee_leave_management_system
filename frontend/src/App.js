import React, { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ total_leaves: 20, used_leaves: 0, remaining_leaves: 20 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '', email: '', password: '', employee_id: '', 
    full_name: '', department: '', position: '', joining_date: '', contact_number: '', address: ''
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      setUsername(localStorage.getItem('username'));
      if (role === 'employee') {
        fetchEmployeeData(token);
      } else if (role === 'admin') {
        fetchAdminData(token);
      }
    }
  }, []);

  const fetchEmployeeData = async (token) => {
    try {
      const balanceRes = await fetch(`${API_URL}/leaves/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data);
      }

      const leavesRes = await fetch(`${API_URL}/leaves/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (leavesRes.ok) {
        const data = await leavesRes.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchAdminData = async (token) => {
    try {
      const employeesRes = await fetch(`${API_URL}/admin/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data);
      }

      const pendingRes = await fetch(`${API_URL}/admin/leaves/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingLeaves(data);
      }

      const allLeavesRes = await fetch(`${API_URL}/admin/leaves/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (allLeavesRes.ok) {
        const data = await allLeavesRes.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userId', data.user.id);
        if (data.user.employeeDetails) {
          localStorage.setItem('employeeId', data.user.employeeDetails.id);
        }
        setIsLoggedIn(true);
        setUserRole(data.user.role);
        setUsername(data.user.username);
        if (data.user.role === 'employee') {
          fetchEmployeeData(data.token);
        } else if (data.user.role === 'admin') {
          fetchAdminData(data.token);
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Server error. Make sure backend is running on port 5000');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername('');
    setLeaves([]);
    setEmployees([]);
    setPendingLeaves([]);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leaveData = {
      leave_type: formData.get('leave_type'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      reason: formData.get('reason')
    };

    if (leaveData.start_date > leaveData.end_date) {
      alert('End date must be after start date');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/leaves/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(leaveData)
      });

      if (res.ok) {
        alert('✅ Leave applied successfully!');
        fetchEmployeeData(localStorage.getItem('token'));
        setActiveTab('history');
        e.target.reset();
      } else {
        const data = await res.json();
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('❌ Error applying leave');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    if (!window.confirm('Approve this leave request?')) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/leaves/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ leaveId, status: 'approved', admin_remarks: adminRemarks || 'Approved by admin' })
      });

      if (res.ok) {
        alert('✅ Leave approved successfully!');
        setShowModal(false);
        setAdminRemarks('');
        fetchAdminData(localStorage.getItem('token'));
      } else {
        alert('❌ Failed to approve leave');
      }
    } catch (error) {
      alert('❌ Error approving leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const remarks = prompt('Reason for rejection:');
    if (remarks === null) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/leaves/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ leaveId, status: 'rejected', admin_remarks: remarks })
      });

      if (res.ok) {
        alert('❌ Leave rejected');
        fetchAdminData(localStorage.getItem('token'));
      } else {
        alert('❌ Failed to reject leave');
      }
    } catch (error) {
      alert('❌ Error rejecting leave');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newEmployee)
      });

      if (res.ok) {
        alert('✅ Employee added successfully!');
        setShowAddEmployee(false);
        setNewEmployee({
          username: '', email: '', password: '', employee_id: '', 
          full_name: '', department: '', position: '', joining_date: '', contact_number: '', address: ''
        });
        fetchAdminData(localStorage.getItem('token'));
      } else {
        const data = await res.json();
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('❌ Error adding employee');
    }
  };

  const handleDeleteEmployee = async (employeeId, userId) => {
    if (!window.confirm('Delete this employee? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        alert('✅ Employee deleted successfully!');
        fetchAdminData(localStorage.getItem('token'));
      } else {
        alert('❌ Failed to delete employee');
      }
    } catch (error) {
      alert('❌ Error deleting employee');
    }
  };

  // Login Page
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>🏢 Employee Leave Management System</h2>
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label>Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Enter username or email"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button}>Login</button>
          </form>
          <div style={styles.demoInfo}>
            <strong>📝 Demo Credentials:</strong><br />
            👑 Admin: admin / admin123<br />
            👤 Employee: john.doe / password123
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (userRole === 'admin') {
    const getStatusBadge = (status) => {
      const colors = { pending: '#ffc107', approved: '#28a745', rejected: '#dc3545' };
      return { ...styles.statusBadge, backgroundColor: colors[status] || '#6c757d' };
    };

    return (
      <div>
        <nav style={styles.navbar}>
          <h2>👑 Admin Dashboard - Leave Management System</h2>
          <div style={styles.navRight}>
            <span>Welcome, {username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </nav>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('pending')} style={activeTab === 'pending' ? styles.activeTab : styles.tab}>
            ⏳ Pending Leaves ({pendingLeaves.length})
          </button>
          <button onClick={() => setActiveTab('employees')} style={activeTab === 'employees' ? styles.activeTab : styles.tab}>
            👥 Employees ({employees.length})
          </button>
          <button onClick={() => setActiveTab('history')} style={activeTab === 'history' ? styles.activeTab : styles.tab}>
            📜 Leave History ({leaves.length})
          </button>
        </div>

        <div style={styles.content}>
          {/* PENDING LEAVES TAB */}
          {activeTab === 'pending' && (
            <div>
              <div style={styles.stats}>
                <div style={styles.statCard}>
                  <h3>Total Employees</h3>
                  <p style={{ fontSize: '32px', margin: '10px 0' }}>{employees.length}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Pending Requests</h3>
                  <p style={{ fontSize: '32px', margin: '10px 0', color: '#ffc107' }}>{pendingLeaves.length}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Total Leaves</h3>
                  <p style={{ fontSize: '32px', margin: '10px 0' }}>{leaves.length}</p>
                </div>
              </div>

              <div style={styles.card}>
                <h3>⏳ Pending Leave Requests</h3>
                {pendingLeaves.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>No pending leave requests</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Applied On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.map((leave) => {
                        const days = Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                        return (
                          <tr key={leave.id}>
                            <td><strong>{leave.full_name}</strong><br/><small>{leave.employee_id}</small></td>
                            <td>{leave.department}</td>
                            <td>{leave.leave_type}</td>
                            <td>{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</td>
                            <td>{days}</td>
                            <td>{leave.reason}</td>
                            <td>{new Date(leave.applied_date).toLocaleDateString()}</td>
                            <td>
                              <button onClick={() => handleApproveLeave(leave.id)} style={styles.approveBtn}>✅ Approve</button>
                              <button onClick={() => handleRejectLeave(leave.id)} style={styles.rejectBtn}>❌ Reject</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>👥 Employee List</h3>
                <button onClick={() => setShowAddEmployee(true)} style={styles.addBtn}>+ Add New Employee</button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Contact</th>
                    <th>Total Leaves</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.employee_id}</td>
                      <td><strong>{emp.full_name}</strong></td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td>{emp.contact_number || '-'}</td>
                      <td>{emp.total_leaves}</td>
                      <td>{emp.used_leaves}</td>
                      <td>{emp.remaining_leaves}</td>
                      <td>
                        <button onClick={() => handleDeleteEmployee(emp.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LEAVE HISTORY TAB */}
          {activeTab === 'history' && (
            <div style={styles.card}>
              <h3>📜 Complete Leave History</h3>
              {leaves.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No leave records found</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Admin Remarks</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => {
                      const days = Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <tr key={leave.id}>
                          <td>{leave.full_name || leave.employee_id}</td>
                          <td>{leave.leave_type}</td>
                          <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                          <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                          <td>{days}</td>
                          <td>{leave.reason}</td>
                          <td><span style={getStatusBadge(leave.status)}>{leave.status.toUpperCase()}</span></td>
                          <td>{leave.admin_remarks || '-'}</td>
                          <td>{new Date(leave.applied_date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>Add New Employee</h3>
              <form onSubmit={handleAddEmployee}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" placeholder="Username *" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})} style={styles.input} required />
                  <input type="email" placeholder="Email *" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} style={styles.input} required />
                  <input type="password" placeholder="Password *" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} style={styles.input} required />
                  <input type="text" placeholder="Employee ID *" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})} style={styles.input} required />
                  <input type="text" placeholder="Full Name *" value={newEmployee.full_name} onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})} style={styles.input} required />
                  <input type="text" placeholder="Department *" value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})} style={styles.input} required />
                  <input type="text" placeholder="Position *" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} style={styles.input} required />
                  <input type="date" placeholder="Joining Date" value={newEmployee.joining_date} onChange={(e) => setNewEmployee({...newEmployee, joining_date: e.target.value})} style={styles.input} />
                  <input type="text" placeholder="Contact Number" value={newEmployee.contact_number} onChange={(e) => setNewEmployee({...newEmployee, contact_number: e.target.value})} style={styles.input} />
                  <textarea placeholder="Address" rows="2" value={newEmployee.address} onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})} style={styles.input} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" style={styles.button}>Add Employee</button>
                  <button type="button" onClick={() => setShowAddEmployee(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Employee Dashboard
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const getStatusBadge = (status) => {
    const colors = { pending: '#ffc107', approved: '#28a745', rejected: '#dc3545' };
    return { ...styles.statusBadge, backgroundColor: colors[status] || '#6c757d' };
  };

  return (
    <div>
      <nav style={styles.navbar}>
        <h2>🏢 Employee Leave Management System</h2>
        <div style={styles.navRight}>
          <span>Welcome, {username}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? styles.activeTab : styles.tab}>
          📊 Dashboard
        </button>
        <button onClick={() => setActiveTab('apply')} style={activeTab === 'apply' ? styles.activeTab : styles.tab}>
          📝 Apply Leave
        </button>
        <button onClick={() => setActiveTab('history')} style={activeTab === 'history' ? styles.activeTab : styles.tab}>
          📜 Leave History
        </button>
      </div>

      <div style={styles.content}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.stats}>
              <div style={styles.statCard}>
                <h3>Total Leaves</h3>
                <p style={{ fontSize: '32px', margin: '10px 0', color: '#667eea' }}>{balance.total_leaves}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Used Leaves</h3>
                <p style={{ fontSize: '32px', margin: '10px 0', color: '#dc3545' }}>{balance.used_leaves}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Remaining</h3>
                <p style={{ fontSize: '32px', margin: '10px 0', color: '#28a745' }}>{balance.remaining_leaves}</p>
              </div>
            </div>
            <div style={styles.card}>
              <h3>📋 Quick Actions</h3>
              <p>Use the tabs above to apply for leave or view your leave history.</p>
              <hr />
              <h4>ℹ️ How to Use:</h4>
              <ul>
                <li>Click <strong>"Apply Leave"</strong> to submit a new leave request</li>
                <li>Click <strong>"Leave History"</strong> to see all your applications</li>
                <li>Admin will review and approve/reject your request</li>
              </ul>
            </div>
          </div>
        )}

        {/* APPLY LEAVE TAB */}
        {activeTab === 'apply' && (
          <div style={styles.card}>
            <h3>📝 Apply for Leave</h3>
            <form onSubmit={handleApplyLeave}>
              <div style={styles.inputGroup}>
                <label>Leave Type *</label>
                <select name="leave_type" style={styles.input} required>
                  <option value="casual">🏖️ Casual Leave</option>
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="annual">🌴 Annual Leave</option>
                  <option value="unpaid">💰 Unpaid Leave</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.inputGroup}>
                  <label>Start Date *</label>
                  <input type="date" name="start_date" defaultValue={tomorrow} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                  <label>End Date *</label>
                  <input type="date" name="end_date" defaultValue={tomorrow} style={styles.input} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label>Reason *</label>
                <textarea name="reason" rows="4" style={styles.input} placeholder="Please provide detailed reason for leave" required></textarea>
              </div>
              <button type="submit" style={styles.button}>Submit Application</button>
            </form>
          </div>
        )}

        {/* LEAVE HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={styles.card}>
            <h3>📜 My Leave History</h3>
            {leaves.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No leave applications found</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Admin Remarks</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => {
                    const days = Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <tr key={leave.id}>
                        <td>{leave.leave_type}</td>
                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                        <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                        <td>{days}</td>
                        <td>{leave.reason}</td>
                        <td><span style={getStatusBadge(leave.status)}>{leave.status.toUpperCase()}</span></td>
                        <td>{leave.admin_remarks || '-'}</td>
                        <td>{new Date(leave.applied_date).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loginBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    fontSize: '14px',
    textAlign: 'center'
  },
  demoInfo: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#666'
  },
  navbar: {
    background: '#2c3e50',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logoutBtn: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    background: 'white',
    padding: '0 20px'
  },
  tab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666'
  },
  activeTab: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '5px 5px 0 0'
  },
  content: {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  card: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  },
  tableHeader: {
    background: '#f8f9fa',
    borderBottom: '2px solid #dee2e6'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  approveBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  },
  rejectBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  addBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  deleteBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelBtn: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    width: '600px',
    maxWidth: '90%'
  }
};

export default App;