
import React from 'react';
import { Form, Row, Col, Card, Badge } from 'react-bootstrap';

const PaymentSettings = () => {
    return (
        <div>
            <h6 className="fw-bold mb-3 text-success">Active Payment Methods</h6>

            <div className="d-flex gap-3 mb-4">
                <Card className="border-success bg-success-subtle shadow-sm" style={{ width: '150px' }}>
                    <Card.Body className="text-center p-3">
                        <Form.Check type="switch" defaultChecked label="" className="mb-2" />
                        <span className="fw-bold small">Cash</span>
                    </Card.Body>
                </Card>
                <Card className="border shadow-sm" style={{ width: '150px' }}>
                    <Card.Body className="text-center p-3">
                        <Form.Check type="switch" defaultChecked label="" className="mb-2" />
                        <span className="fw-bold small">Bank Check</span>
                    </Card.Body>
                </Card>
                <Card className="border shadow-sm" style={{ width: '150px' }}>
                    <Card.Body className="text-center p-3">
                        <Form.Check type="switch" defaultChecked label="" className="mb-2" />
                        <span className="fw-bold small">M-Pesa</span>
                    </Card.Body>
                </Card>
                <Card className="border bg-light shadow-sm" style={{ width: '150px' }}>
                    <Card.Body className="text-center p-3">
                        <Form.Check type="switch" label="" className="mb-2" />
                        <span className="fw-bold small text-muted">Online Card</span>
                    </Card.Body>
                </Card>
            </div>

            <hr className="my-4" />

            <h6 className="fw-bold mb-3 text-success">Payment Allocation Rules</h6>

            <Row className="mb-3">
                <Col md={12}>
                    <Form.Label className="fw-medium">Auto-Allocation Priority</Form.Label>
                    <p className="text-muted small">Determine how payment amounts are distributed across outstanding invoices.</p>
                </Col>
            </Row>

            <Card className="bg-light border-0 mb-3">
                <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                        <Badge bg="primary" className="me-2 rounded-circle">1</Badge>
                        <span>Oldest Outstanding Arrears</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <Badge bg="secondary" className="me-2 rounded-circle">2</Badge>
                        <span>Current Term Fee Items (Tuition)</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <Badge bg="secondary" className="me-2 rounded-circle">3</Badge>
                        <span>Current Term Fee Items (Optional)</span>
                    </div>
                </Card.Body>
            </Card>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Allow Overpayments</Form.Label>
                    <p className="text-muted small mb-0">Treat excess payment as credit balance carried forward.</p>
                </Col>
                <Col md={4} className="text-end">
                    <Form.Check type="switch" defaultChecked />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Allow Partial Payments</Form.Label>
                </Col>
                <Col md={4} className="text-end">
                    <Form.Check type="switch" defaultChecked />
                </Col>
            </Row>
        </div>
    );
};

export default PaymentSettings;
