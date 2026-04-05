import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [leaveBalance, setLeaveBalance] = useState({ total_leaves: 0, used_leaves: 0, remaining_leaves: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, leavesRes] = await Promise.all([
        api.get('/leaves/balance'),
        api.get('/leaves/history')
      ]);
      
      setLeaveBalance(balanceRes.data);
      setRecentLeaves(leavesRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Total Leaves', 'Used Leaves', 'Remaining Leaves'],
    datasets: [{
      label: 'Leave Balance',
      data: [leaveBalance.total_leaves, leaveBalance.used_leaves, leaveBalance.remaining_leaves],
      backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0'],
    }],
  };

  const getStatusBadge = (status) => {
    const variants = { pending: 'warning', approved: 'success', rejected: 'danger' };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Employee Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={4}><Card className="text-center shadow-sm"><Card.Body><h5>Total Leaves</h5><h2 className="text-primary">{leaveBalance.total_leaves}</h2></Card.Body></Card></Col>
        <Col md={4}><Card className="text-center shadow-sm"><Card.Body><h5>Used Leaves</h5><h2 className="text-danger">{leaveBalance.used_leaves}</h2></Card.Body></Card></Col>
        <Col md={4}><Card className="text-center shadow-sm"><Card.Body><h5>Remaining Leaves</h5><h2 className="text-success">{leaveBalance.remaining_leaves}</h2></Card.Body></Card></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header><h5>Leave Balance Chart</h5></Card.Header>
            <Card.Body><Bar data={chartData} /></Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header><h5>Recent Leave Applications</h5></Card.Header>
            <Card.Body>
              {recentLeaves.length === 0 ? <p className="text-muted">No recent leave applications</p> : (
                <Table striped hover size="sm">
                  <thead><tr><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                        <td>{leave.leave_type}</td>
                        <td>{getStatusBadge(leave.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;