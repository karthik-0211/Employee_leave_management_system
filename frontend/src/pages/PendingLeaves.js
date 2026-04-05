import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

function PendingLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingLeaves();
    }, []);

    const fetchPendingLeaves = async () => {
        try {
            const response = await api.get('/admin/leaves/pending');
            setLeaves(response.data);
        } catch (error) {
            toast.error('Failed to fetch pending leaves');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (leave) => {
        setSelectedLeave(leave);
        setShowModal(true);
    };

    const submitAction = async (action) => {
        try {
            await api.put('/admin/leaves/status', {
                leaveId: selectedLeave.id,
                status: action,
                admin_remarks: remarks
            });
            toast.success(`Leave ${action} successfully`);
            setShowModal(false);
            setRemarks('');
            fetchPendingLeaves();
        } catch (error) {
            toast.error('Failed to update leave status');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger'
        };
        return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <Container className="mt-4">
            <Card className="shadow">
                <Card.Header className="bg-warning">
                    <h4 className="mb-0">Pending Leave Requests</h4>
                </Card.Header>
                <Card.Body>
                    {leaves.length === 0 ? (
                        <p className="text-muted text-center">No pending leave requests</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Duration</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => {
                                    const start = new Date(leave.start_date);
                                    const end = new Date(leave.end_date);
                                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                    
                                    return (
                                        <tr key={leave.id}>
                                            <td>
                                                <strong>{leave.full_name}</strong><br/>
                                                <small className="text-muted">{leave.employee_id}</small>
                                            </td>
                                            <td>{leave.department}</td>
                                            <td>{leave.leave_type}</td>
                                            <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                                            <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                                            <td>{days} day(s)</td>
                                            <td>{leave.reason}</td>
                                            <td>
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    className="me-2"
                                                    onClick={() => handleAction(leave)}
                                                >
                                                    Review
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Review Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Review Leave Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Employee:</strong> {selectedLeave?.full_name}</p>
                    <p><strong>Leave Type:</strong> {selectedLeave?.leave_type}</p>
                    <p><strong>Duration:</strong> {selectedLeave ? 
                        `${new Date(selectedLeave.start_date).toLocaleDateString()} to ${new Date(selectedLeave.end_date).toLocaleDateString()}` 
                        : ''}</p>
                    <p><strong>Reason:</strong> {selectedLeave?.reason}</p>
                    <Form.Group>
                        <Form.Label>Remarks (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add any remarks..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => submitAction('rejected')}>
                        Reject
                    </Button>
                    <Button variant="success" onClick={() => submitAction('approved')}>
                        Approve
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default PendingLeaves;