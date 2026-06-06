
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Banknote, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const KPISection = ({ data }) => {
    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    return (
        <Row className="g-3">
            <Col md={3}>
                <Card className="shadow-sm border-0 bg-white">
                    <Card.Body className="d-flex align-items-center">
                        <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                            <Banknote className="text-danger fs-4" size={24} />
                        </div>
                        <div>
                            <p className="text-muted mb-1 small text-uppercase fw-bold">Total Arrears</p>
                            <h4 className="mb-0 fw-bold">{formatCurrency(data.totalArrears)}</h4>
                            <small className={`${data.arrearsGrowth < 0 ? 'text-success' : 'text-danger'} fw-bold`}>
                                {data.arrearsGrowth > 0 ? '+' : ''}{data.arrearsGrowth}% from last term
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className="shadow-sm border-0 bg-white">
                    <Card.Body className="d-flex align-items-center">
                        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                            <Users className="text-warning fs-4" size={24} />
                        </div>
                        <div>
                            <p className="text-muted mb-1 small text-uppercase fw-bold">Students in Arrears</p>
                            <h4 className="mb-0 fw-bold">{data.studentCount}</h4>
                            <small className="text-muted">Total Active</small>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className="shadow-sm border-0 bg-white">
                    <Card.Body className="d-flex align-items-center">
                        <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                            <TrendingUp className="text-info fs-4" size={24} />
                        </div>
                        <div>
                            <p className="text-muted mb-1 small text-uppercase fw-bold">Avg. Arrears</p>
                            <h4 className="mb-0 fw-bold">{formatCurrency(data.averageArrears)}</h4>
                            <small className="text-muted">Per Student</small>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className="shadow-sm border-0 bg-white">
                    <Card.Body className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                            <AlertTriangle className="text-primary fs-4" size={24} />
                        </div>
                        <div>
                            <p className="text-muted mb-1 small text-uppercase fw-bold">Highest Individual</p>
                            <h4 className="mb-0 fw-bold">{formatCurrency(data.highestArrears)}</h4>
                            <small className="text-muted">Critical</small>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default KPISection;
