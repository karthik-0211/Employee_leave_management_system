import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function ApplyLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: new Date(),
    end_date: new Date(),
    reason: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.start_date > formData.end_date) {
      setError('End date must be after start date');
      return;
    }

    try {
      await api.post('/leaves/apply', {
        leave_type: formData.leave_type,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        reason: formData.reason
      });
      
      toast.success('Leave applied successfully!');
      navigate('/leave-history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply leave');
      toast.error('Failed to apply leave');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white"><h4 className="mb-0">Apply for Leave</h4></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type *</Form.Label>
                  <Form.Select name="leave_type" value={formData.leave_type} onChange={handleChange} required>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </Form.Select>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Start Date *</Form.Label>
                    <DatePicker selected={formData.start_date} onChange={(date) => setFormData({ ...formData, start_date: date })} className="form-control" minDate={new Date()} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>End Date *</Form.Label>
                    <DatePicker selected={formData.end_date} onChange={(date) => setFormData({ ...formData, end_date: date })} className="form-control" minDate={formData.start_date} required />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Reason *</Form.Label>
                  <Form.Control as="textarea" rows={4} name="reason" value={formData.reason} onChange={handleChange} placeholder="Please provide detailed reason for leave" required />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit">Submit Application</Button>
                  <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ApplyLeave;