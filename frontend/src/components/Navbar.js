import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Navbar() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand href="/dashboard">
          Leave Management System
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            
            {userRole === 'employee' && (
              <>
                <Nav.Link href="/apply-leave">Apply Leave</Nav.Link>
                <Nav.Link href="/leave-history">Leave History</Nav.Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Nav.Link href="/admin/employees">Manage Employees</Nav.Link>
                <Nav.Link href="/admin/pending-leaves">Pending Leaves</Nav.Link>
              </>
            )}
            
            <Nav.Link href="/profile">Profile</Nav.Link>
          </Nav>
          
          <Nav>
            <span className="navbar-text text-white me-3">
              Welcome, {username}
            </span>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;