
import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';

const ArrearsPenaltySettings = () => {
    return (
        <div>
            <h6 className="fw-bold mb-3 text-danger">Arrears Configuration</h6>

            <Row className="mb-3 align-items-center">
                <Col md={6}>
                    <Form.Label className="fw-medium">Arrears Threshold (Warning)</Form.Label>
                    <p className="text-muted small mb-0">Balance above which account is flagged as "In Arrears".</p>
                </Col>
                <Col md={6}>
                    <InputGroup size="sm">
                        <InputGroup.Text>KES</InputGroup.Text>
                        <Form.Control type="number" defaultValue="1000" />
                    </InputGroup>
                </Col>
            </Row>

            <Row className="mb-4 align-items-center">
                <Col md={6}>
                    <Form.Label className="fw-medium">Critical Threshold (Blocked)</Form.Label>
                    <p className="text-muted small mb-0">Balance above which services (e.g. exams, portal) are restricted.</p>
                </Col>
                <Col md={6}>
                    <InputGroup size="sm">
                        <InputGroup.Text>KES</InputGroup.Text>
                        <Form.Control type="number" defaultValue="10000" />
                    </InputGroup>
                </Col>
            </Row>

            <hr className="my-4" />

            <h6 className="fw-bold mb-3 text-danger">Late Payment Penalties</h6>

            <div className="mb-3">
                <Form.Check
                    type="switch"
                    id="enable-penalties"
                    label="Enable Late Payment Penalties"
                    defaultChecked
                />
            </div>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Label className="fw-medium">Penalty Type</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Select size="sm">
                        <option value="fixed">Fixed Amount (Fee Item)</option>
                        <option value="percentage">Percentage of Outstanding Balance</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Label className="fw-medium">Penalty Amount / %</Form.Label>
                </Col>
                <Col md={8}>
                    <InputGroup size="sm">
                        <InputGroup.Text>%</InputGroup.Text>
                        <Form.Control type="number" defaultValue="5" />
                    </InputGroup>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Label className="fw-medium">Grace Period (Days)</Form.Label>
                </Col>
                <Col md={8}>
                    <Form.Control type="number" size="sm" defaultValue="30" />
                    <Form.Text className="text-muted">Days after invoice due date before penalty applies.</Form.Text>
                </Col>
            </Row>
        </div>
    );
};

export default ArrearsPenaltySettings;
