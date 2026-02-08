
import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { mockCollectionStats } from '../mockData';

const COLORS = ['#28a745', '#ffc107', '#dc3545']; // Green (Paid), Yellow (Partial), Red (Unpaid)

const CollectionSummaryReport = () => {
    return (
        <div>
            <Row className="g-4">
                <Col md={8}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Collection Status Breakdown</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <PieChart>
                                                <Pie
                                                    data={mockCollectionStats.statusBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label
                                                >
                                                    {mockCollectionStats.statusBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex flex-column justify-content-center">
                                    <h5 className="mb-4">Key Metrics</h5>
                                    {mockCollectionStats.statusBreakdown.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                            <span>
                                                <Badge bg={idx === 0 ? 'success' : idx === 1 ? 'warning' : 'danger'} className="me-2 rounded-circle p-1"> </Badge>
                                                {item.name} Students
                                            </span>
                                            <span className="fw-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 text-white bg-primary">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                            <h6 className="text-white-50 text-uppercase mb-3">Total Collection Efficiency</h6>
                            <h1 className="display-1 fw-bold mb-0">{mockCollectionStats.collectionRate}%</h1>
                            <p className="mb-0 mt-2 text-white-50">of expected revenue collected</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CollectionSummaryReport;
