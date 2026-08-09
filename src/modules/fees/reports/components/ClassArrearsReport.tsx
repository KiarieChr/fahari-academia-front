
import React from 'react';
import { Card, Table, ProgressBar, Row, Col } from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { mockClassArrears } from '../mockData';

const ClassArrearsReport = () => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-KE', { prefix: 'KES', notation: "compact", compactDisplay: "short" }).format(value);
    };

    const sortedArrears = [...mockClassArrears].sort((a, b) => b.arrears - a.arrears);

    return (
        <div>
            <Row className="g-4">
                <Col md={7}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Arrears by Class Comparison</h6>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart
                                        data={mockClassArrears}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={formatCurrency} />
                                        <YAxis dataKey="name" type="category" />
                                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value)} />
                                        <Legend />
                                        <Bar dataKey="arrears" name="Outstanding Arrears" fill="#ff8042" barSize={20} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white pt-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Highest Arrears Ranking</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="mb-0 text-nowrap align-middle" borderless>
                                <thead className="bg-light text-muted small">
                                    <tr>
                                        <th className="ps-4">Class</th>
                                        <th className="text-end pe-4">Arrears Amount</th>
                                        <th>% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedArrears.map((item, idx) => {
                                        const totalArrears = mockClassArrears.reduce((acc, curr) => acc + curr.arrears, 0);
                                        const percentage = Math.round((item.arrears / totalArrears) * 100);
                                        return (
                                            <tr key={idx}>
                                                <td className="ps-4 fw-medium">{item.name}</td>
                                                <td className="text-end pe-4 fw-bold">{formatCurrency(item.arrears)}</td>
                                                <td style={{ width: '30%' }} className="pe-3">
                                                    <div className="d-flex align-items-center">
                                                        <span className="small me-2">{percentage}%</span>
                                                        <ProgressBar now={percentage} variant="danger" style={{ height: 4, flexGrow: 1 }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ClassArrearsReport;
