
import React from 'react';
import { Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { Info } from 'lucide-react';

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

            {/* Invoice Number Format - Read Only */}
            <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-start">
                    <Info size={18} className="me-2 mt-1 flex-shrink-0" />
                    <div>
                        <strong>Invoice Number Format (System Managed)</strong>
                        <p className="mb-1 mt-1">Invoices are automatically numbered using the format:</p>
                        <code className="bg-white px-2 py-1 rounded">INV-{'{YEAR}'}-T{'{TERM}'}-{'{SEQUENCE}'}</code>
                        <p className="mb-0 mt-2 small text-muted">
                            Example: <strong>INV-2026-T1-0042</strong> (Year 2026, Term 1, Invoice #42)
                            <br />Sequence resets per year/term combination.
                        </p>
                    </div>
                </div>
            </Alert>

            <Row className="mb-3 align-items-center">
                <Col md={4}>
                    <Form.Label className="fw-medium">Duplicate Prevention</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Check
                        type="checkbox"
                        label="Prevent generating multiple tuition invoices for same term"
                        defaultChecked
                        disabled
                    />
                    <Form.Text className="text-muted">This is enforced by the system - one active invoice per enrollment.</Form.Text>
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

            <hr className="my-4" />

            <h6 className="fw-bold mb-3 text-primary">Kenya School Billing Rules</h6>
            <Alert variant="light" className="border">
                <ul className="mb-0 ps-3">
                    <li>Schools run <strong>3 terms per year</strong> (Term 1, Term 2, Term 3)</li>
                    <li>One invoice per student per term (unless previous is VOID)</li>
                    <li>Students must be enrolled before invoicing</li>
                    <li>CBC and 8-4-4 students may have different fee structures</li>
                </ul>
            </Alert>
        </div>
    );
};

export default StructureBillingSettings;
