
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { mockIncomeSummary } from '../mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const IncomeSummaryReport = () => {
    return (
        <div>
            <Row className="g-4">
                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Income Distribution by Payment Method</h6>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={mockIncomeSummary}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {mockIncomeSummary.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value)} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Income Trends (Coming Soon)</h6>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center text-muted">
                            <p>Trend analysis chart placeholder...</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default IncomeSummaryReport;
