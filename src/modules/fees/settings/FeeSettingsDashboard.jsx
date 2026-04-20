
import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import {
    Settings, Zap, FileText, AlertTriangle, CreditCard,
    Bell, Shield, Link as LinkIcon, Save
} from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { toast } from 'react-toastify';

// Import settings components (to be created)
import AutoBillingSettings from './components/AutoBillingSettings';
import StructureBillingSettings from './components/StructureBillingSettings';
import ArrearsPenaltySettings from './components/ArrearsPenaltySettings';
import PaymentSettings from './components/PaymentSettings';
import GeneralSettings from './components/GeneralSettings'; // Logic for diverse settings
import GradeBandSettings from './components/GradeBandSettings';

const FeeSettingsDashboard = () => {
    const [activeTab, setActiveTab] = useState('auto-billing');

    const handleSave = () => {
        // Mock save functionality
        toast.success("Settings saved successfully!");
    };

    const renderActiveSettings = () => {
        switch (activeTab) {
            case 'auto-billing':
                return <AutoBillingSettings />;
            case 'structure':
                return <StructureBillingSettings />;
            case 'grade-bands':
                return <GradeBandSettings />;
            case 'arrears':
                return <ArrearsPenaltySettings />;
            case 'payments':
                return <PaymentSettings />;
            case 'notifications':
            case 'access':
            case 'integrations':
                return <GeneralSettings activeKey={activeTab} />;
            default:
                return <AutoBillingSettings />;
        }
    };

    return (
        <DashboardLayout title="Fee Module Settings">
            <Container fluid className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1 fw-bold text-dark">Fee Module Settings</h2>
                        <p className="text-muted mb-0">Configure automation, billing rules, and system behavior</p>
                    </div>
                    <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleSave}>
                        <Save size={18} /> Save Changes
                    </Button>
                </div>

                <Row>
                    <Col md={3} className="mb-4">
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-2">
                                <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="auto-billing" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <Zap size={18} /> Auto Billing
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="structure" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <FileText size={18} /> Fee Structure & Rules
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="grade-bands" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <Settings size={18} /> Grade Bands
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="arrears" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <AlertTriangle size={18} /> Arrears & Penalties
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="payments" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <CreditCard size={18} /> Payments & Collection
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="notifications" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <Bell size={18} /> Notifications
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="access" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <Shield size={18} /> Access & Approvals
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="integrations" className="d-flex align-items-center gap-2 mb-1 py-3">
                                            <LinkIcon size={18} /> Integrations
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-white border-bottom py-3">
                                <h5 className="mb-0 fw-bold">
                                    {activeTab === 'auto-billing' && 'Auto Billing Automation'}
                                    {activeTab === 'structure' && 'Fee Structure & Billing Rules'}
                                    {activeTab === 'grade-bands' && 'Grade Band Configuration'}
                                    {activeTab === 'arrears' && 'Arrears Management & Penalties'}
                                    {activeTab === 'payments' && 'Payment Methods & Allocation'}
                                    {activeTab === 'notifications' && 'Communication Settings'}
                                    {activeTab === 'access' && 'Access Control & Workflow'}
                                    {activeTab === 'integrations' && 'System Integrations'}
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {renderActiveSettings()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default FeeSettingsDashboard;

