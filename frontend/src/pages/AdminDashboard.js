import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0 });

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const [employeesRes, leavesRes] = await Promise.all([api.get('/admin/employees'), api.get('/admin/leaves/pending')]);
            setStats({ totalEmployees: employeesRes.data.length, pendingLeaves: leavesRes.data.length });
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Admin Dashboard</h2>
            <Row className="mb-4">
                <Col md={6}><Card className="text-center shadow-sm bg-primary text-white"><Card.Body><h5>Total Employees</h5><h2 className="display-4">{stats.totalEmployees}</h2></Card.Body></Card></Col>
                <Col md={6}><Card className="text-center shadow-sm bg-warning text-white"><Card.Body><h5>Pending Leaves</h5><h2 className="display-4">{stats.pendingLeaves}</h2></Card.Body></Card></Col>
            </Row>
            <Row>
                <Col md={6}><Card className="shadow-sm mb-3"><Card.Body className="text-center"><h5>Manage Employees</h5><Button variant="primary" onClick={() => navigate('/admin/employees')}>Go to Employees</Button></Card.Body></Card></Col>
                <Col md={6}><Card className="shadow-sm mb-3"><Card.Body className="text-center"><h5>Review Leave Requests</h5><Button variant="warning" onClick={() => navigate('/admin/pending-leaves')}>Review Leaves</Button></Card.Body></Card></Col>
            </Row>
        </Container>
    );
}

export default AdminDashboard;