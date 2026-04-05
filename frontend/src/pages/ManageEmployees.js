import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', employee_id: '', full_name: '', department: '', position: '', joining_date: '', contact_number: '', address: '' });

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/admin/employees');
            setEmployees(response.data);
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/employees', formData);
            toast.success('Employee added successfully');
            setShowModal(false);
            fetchEmployees();
            setFormData({ username: '', email: '', password: '', employee_id: '', full_name: '', department: '', position: '', joining_date: '', contact_number: '', address: '' });
        } catch (error) {
            toast.error('Failed to add employee');
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <Container className="mt-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Manage Employees</h4>
                    <Button variant="light" onClick={() => setShowModal(true)}>+ Add New Employee</Button>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead><tr><th>Employee ID</th><th>Full Name</th><th>Department</th><th>Position</th><th>Contact</th><th>Total Leaves</th><th>Used</th><th>Remaining</th></tr></thead>
                        <tbody>
                            {employees.map((emp) => (<tr key={emp.id}><td>{emp.employee_id}</td><td>{emp.full_name}</td><td>{emp.department}</td><td>{emp.position}</td><td>{emp.contact_number || '-'}</td><td>{emp.total_leaves}</td><td>{emp.used_leaves}</td><td>{emp.remaining_leaves}</td></tr>))}
                            {employees.length === 0 && (<tr><td colSpan="8" className="text-center">No employees found</td></tr>)}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton><Modal.Title>Add New Employee</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Username *</Form.Label><Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required /></Form.Group></Col></Row>
                        <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Password *</Form.Label><Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Employee ID *</Form.Label><Form.Control type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} required /></Form.Group></Col></Row>
                        <Form.Group className="mb-3"><Form.Label>Full Name *</Form.Label><Form.Control type="text" name="full_name" value={formData.full_name} onChange={handleChange} required /></Form.Group>
                        <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Department *</Form.Label><Form.Control type="text" name="department" value={formData.department} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Position *</Form.Label><Form.Control type="text" name="position" value={formData.position} onChange={handleChange} required /></Form.Group></Col></Row>
                        <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Joining Date *</Form.Label><Form.Control type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Contact Number</Form.Label><Form.Control type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} /></Form.Group></Col></Row>
                        <Form.Group className="mb-3"><Form.Label>Address</Form.Label><Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} /></Form.Group>
                        <div className="d-flex justify-content-end gap-2"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" type="submit">Add Employee</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ManageEmployees;