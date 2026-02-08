
import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';

const StructureBillingSettings = () => {
    return (
        <div>
            <h6 className="fw-bold mb-3 text-primary">Fee Structure Controls</h6>

            <Row className="mb-4">
                <Col md={8}>
                    <Form.Label className="fw-medium">Lock Approved Structures</Form.Label>
                    <p className="text-muted small mb-0">Prevent modification of fee structures once they have been approved by finance.</p>
                </Col>
                <Col md={4} className="text-end">
                    <Form.Check type="switch" id="lock-structures" defaultChecked />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={8}>
                    <Form.Label className="fw-medium">Allow Mid-Term Changes</Form.Label>
                    <p className="text-muted small mb-0">Enable editing of fee items during an active term (Requires Admin Override).</p>
                </Col>
                <Col md={4} className="text-end">
                    <Form.Check type="switch" id="mid-term-changes" />
                </Col>
            </Row>

            <hr className="my-4" />

            <h6 className="fw-bold mb-3 text-primary">Invoice Generation Rules</h6>

            <Row className="mb-3 align-items-center">
                <Col md={4}>
                    <Form.Label className="fw-medium">Invoice Number Format</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Control type="text" size="sm" defaultValue="INV-{YY}-{MM}-{0000}" placeholder="e.g. INV-{YY}-{0000}" />
                    <Form.Text className="text-muted">Use tags: {`{YY}`}, {`{MM}`}, {`{TERM}`}, {`{0000}`}</Form.Text>
                </Col>
            </Row>

            <Row className="mb-3 align-items-center">
                <Col md={4}>
                    <Form.Label className="fw-medium">Duplicate Prevention</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Check
                        type="checkbox"
                        label="Prevent generating multiple tuition invoices for same term"
                        defaultChecked
                    />
                </Col>
            </Row>

            <Row className="mb-3 align-items-center">
                <Col md={4}>
                    <Form.Label className="fw-medium">Rounding Rule</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Select size="sm">
                        <option>No Rounding (Exact Amount)</option>
                        <option>Round to nearest whole number</option>
                        <option>Round up to nearest 10</option>
                    </Form.Select>
                </Col>
            </Row>
        </div>
    );
};

export default StructureBillingSettings;
