
import React from 'react';
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { FileText, Printer, Download, Search } from 'lucide-react';
import { mockStatementData } from '../mockData';

const StudentStatementReport = () => {
    // In a real app, we would search for a student here
    const { student, openingBalance, transactions, totals } = mockStatementData;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    return (
        <div>
            {/* Search Section */}
            <div className="bg-light p-3 rounded mb-4">
                <Row className="g-3 align-items-center">
                    <Col md={8}>
                        <Form.Group className="d-flex gap-2">
                            <Form.Control type="text" placeholder="Search by Student Name or Admission Number..." />
                            <Button variant="primary">
                                <Search size={16} />
                            </Button>
                        </Form.Group>
                    </Col>
                    <Col md={4} className="text-end">
                        <Button variant="outline-success" size="sm" className="me-2">
                            <Download size={16} className="me-2" /> Download PDF
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                            <Printer size={16} className="me-2" /> Print
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Statement Header */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <div className="text-center mb-4">
                        <h4 className="fw-bold text-uppercase mb-1">Fahari High School</h4>
                        <p className="text-muted mb-0">P.O Box 12345 - 00100, Nairobi, Kenya</p>
                        <p className="text-muted">Tel: +254 700 000 000 | Email: accounts@fahari.co.ke</p>
                        <hr />
                        <h5 className="fw-bold text-primary mt-3">STUDENT FEE STATEMENT</h5>
                    </div>

                    <Row className="mb-3">
                        <Col md={6}>
                            <p className="mb-1"><strong>Student Name:</strong> {student.name}</p>
                            <p className="mb-1"><strong>Admission No:</strong> {student.admNo}</p>
                            <p className="mb-1"><strong>Class:</strong> {student.class}</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <p className="mb-1"><strong>Intake:</strong> {student.intake}</p>
                            <p className="mb-1"><strong>Ref Term:</strong> {student.term}</p>
                            <p className="mb-1"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        </Col>
                    </Row>

                    {/* Statement Table */}
                    <Table bordered hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Date</th>
                                <th>Ref No.</th>
                                <th>Description</th>
                                <th className="text-end">Debit (Inv)</th>
                                <th className="text-end">Credit (Pay)</th>
                                <th className="text-end">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="5" className="fw-bold text-end">Opening Balance</td>
                                <td className="text-end fw-bold">{formatCurrency(openingBalance)}</td>
                            </tr>
                            {transactions.map((trx, idx) => (
                                <tr key={idx}>
                                    <td>{trx.date}</td>
                                    <td>{trx.ref}</td>
                                    <td>{trx.description}</td>
                                    <td className="text-end">{trx.debit > 0 ? formatCurrency(trx.debit) : '-'}</td>
                                    <td className="text-end">{trx.credit > 0 ? formatCurrency(trx.credit) : '-'}</td>
                                    <td className="text-end fw-bold">{formatCurrency(trx.balance)}</td>
                                </tr>
                            ))}
                            <tr className="bg-light fw-bold">
                                <td colSpan="3" className="text-end">Totals</td>
                                <td className="text-end">{formatCurrency(totals.invoiced)}</td>
                                <td className="text-end">{formatCurrency(totals.paid)}</td>
                                <td className="text-end text-danger">{formatCurrency(totals.outstanding)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentStatementReport;
