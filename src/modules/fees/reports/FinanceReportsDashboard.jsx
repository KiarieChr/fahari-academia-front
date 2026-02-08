
import React, { useState } from 'react';
import { Container, Nav, Card, Button, Row, Col } from 'react-bootstrap';
import { FileText, TrendingUp, DollarSign, PieChart, Printer, Download } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import ReportFilters from './components/ReportFilters';
import StudentStatementReport from './components/StudentStatementReport';
import IncomeProjectionReport from './components/IncomeProjectionReport';
import ClassArrearsReport from './components/ClassArrearsReport';
import IncomeSummaryReport from './components/IncomeSummaryReport';
import CollectionSummaryReport from './components/CollectionSummaryReport';

const FinanceReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('statements');

    const renderActiveReport = () => {
        switch (activeTab) {
            case 'statements':
                return <StudentStatementReport />;
            case 'projection':
                return <IncomeProjectionReport />;
            case 'arrears':
                return <ClassArrearsReport />;
            case 'income':
                return <IncomeSummaryReport />;
            case 'collection':
                return <CollectionSummaryReport />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout title="Finance Reports">
            <Container fluid className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1 fw-bold text-dark">Financial Reporting</h2>
                        <p className="text-muted mb-0">Generate statements, projections, and collection summaries</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-2">
                            <Printer size={16} /> Print
                        </Button>
                        <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2">
                            <Download size={16} /> Export
                        </Button>
                    </div>
                </div>

                <ReportFilters />

                <Row>
                    <Col md={3} className="mb-4">
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-2">
                                <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="statements" className="d-flex align-items-center gap-2 mb-1">
                                            <FileText size={16} /> Statements
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="projection" className="d-flex align-items-center gap-2 mb-1">
                                            <TrendingUp size={16} /> Projections
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="arrears" className="d-flex align-items-center gap-2 mb-1">
                                            <DollarSign size={16} /> Arrears
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="income" className="d-flex align-items-center gap-2 mb-1">
                                            <PieChart size={16} /> Income
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="collection" className="d-flex align-items-center gap-2 mb-1">
                                            <PieChart size={16} /> Collection
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-4">
                                {renderActiveReport()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default FinanceReportsDashboard;
