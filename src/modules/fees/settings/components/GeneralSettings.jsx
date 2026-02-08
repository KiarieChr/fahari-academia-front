
import React from 'react';
import { Form, Row, Col, Card, Accordion } from 'react-bootstrap';

const GeneralSettings = () => {
    return (
        <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Statement & Report Defaults</Accordion.Header>
                <Accordion.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Organization Logo</Form.Label>
                            <Form.Control type="file" size="sm" />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Currency Symbol</Form.Label>
                            <Form.Control type="text" size="sm" defaultValue="KES" />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Label>Default Statement Footer Message</Form.Label>
                            <Form.Control as="textarea" rows={2} defaultValue="Thank you for your business. Fees are due by the 5th of every month." />
                        </Col>
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>Notification Preferences</Accordion.Header>
                <Accordion.Body>
                    <Form.Check type="switch" label="Email Student/Parent on Invoice Generation" className="mb-2" defaultChecked />
                    <Form.Check type="switch" label="SMS Alert on Payment Receipt" className="mb-2" defaultChecked />
                    <Form.Check type="switch" label="Weekly Arrears Reminder for Critical Accounts" className="mb-2" />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Access Control (Simplifed)</Accordion.Header>
                <Accordion.Body>
                    <p className="text-muted small">Role capabilities are managed in the main User Management module. Quick toggles provided here.</p>
                    <Row className="mb-2">
                        <Col xs={8}>Allow "Teachers" to view Fee Balances</Col>
                        <Col xs={4} className="text-end"><Form.Check type="switch" /></Col>
                    </Row>
                    <Row>
                        <Col xs={8}>Require "Principal" Approval for Fee Waivers</Col>
                        <Col xs={4} className="text-end"><Form.Check type="switch" defaultChecked /></Col>
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
                <Accordion.Header>Integrations</Accordion.Header>
                <Accordion.Body>
                    <Row className="mb-2 align-items-center">
                        <Col xs={8}>QuickBooks / Xero Sync</Col>
                        <Col xs={4} className="text-end"><span className="badge bg-secondary">Not Connected</span></Col>
                    </Row>
                    <Row className="align-items-center">
                        <Col xs={8}>M-Pesa Auto-Reconciliation</Col>
                        <Col xs={4} className="text-end"><span className="badge bg-success">Active</span></Col>
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default GeneralSettings;
