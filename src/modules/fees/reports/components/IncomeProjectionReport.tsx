
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart
} from 'recharts';
import { mockIncomeProjection } from '../mockData';

const IncomeProjectionReport = () => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-KE', { prefix: 'KES', notation: "compact", compactDisplay: "short" }).format(value);
    };

    return (
        <div>
            <Row className="g-4">
                <Col md={8}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Projected vs Collected Income (By Term)</h6>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart
                                        data={mockIncomeProjection}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="term" />
                                        <YAxis tickFormatter={formatCurrency} />
                                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value)} />
                                        <Legend />
                                        <Bar dataKey="expected" name="Expected Income" fill="#8884d8" barSize={30} />
                                        <Bar dataKey="collected" name="Actual Collection" fill="#82ca9d" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Collection Efficiency</h6>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            {/* Placeholder for a circular progress or gauge */}
                            <div className="text-center my-4">
                                <h1 className="display-4 fw-bold text-success">76%</h1>
                                <p className="text-muted">Overall Collection of Projected Revenue</p>
                            </div>
                            <div className="w-100 mt-3">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span>Expected</span>
                                    <span className="fw-bold">{formatCurrency(45000000)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span>Collected</span>
                                    <span className="fw-bold text-success">{formatCurrency(34200000)}</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span>Deficit</span>
                                    <span className="fw-bold text-danger">{formatCurrency(10800000)}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default IncomeProjectionReport;
