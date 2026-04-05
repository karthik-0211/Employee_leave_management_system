import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

function LeaveHistory() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/leaves/history');
            setLeaves(response.data);
        } catch (error) {
            toast.error('Failed to fetch leave history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = { pending: 'warning', approved: 'success', rejected: 'danger' };
        return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <Container className="mt-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white"><h4 className="mb-0">Leave History</h4></Card.Header>
                <Card.Body>
                    {leaves.length === 0 ? <p className="text-muted text-center">No leave applications found</p> : (
                        <Table striped bordered hover responsive>
                            <thead><tr><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Applied Date</th></tr></thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave.id}>
                                        <td>{leave.leave_type}</td>
                                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                                        <td>{leave.reason}</td>
                                        <td>{getStatusBadge(leave.status)}</td>
                                        <td>{new Date(leave.applied_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default LeaveHistory;