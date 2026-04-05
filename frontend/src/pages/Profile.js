import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

function Profile() {
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdate = () => {
        if (email) {
            toast.success('Profile updated successfully!');
            setMessage('Email updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            toast.warning('Please enter email');
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={6} className="mx-auto">
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white"><h4 className="mb-0">My Profile</h4></Card.Header>
                        <Card.Body>
                            {message && <Alert variant="success">{message}</Alert>}
                            <Form>
                                <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" value={username} disabled className="bg-light" /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Role</Form.Label><Form.Control type="text" value={userRole} disabled className="bg-light" /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Email Address</Form.Label><Form.Control type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} /></Form.Group>
                                <Button variant="primary" onClick={handleUpdate}>Update Profile</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;