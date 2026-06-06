
import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Filter, RotateCcw } from 'lucide-react';

const ReportFilters = ({ onFilterChange }) => {
    return (
        <div className="bg-light p-3 rounded mb-4">
            <Row className="g-3 align-items-end">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Academic Year</Form.Label>
                        <Form.Select size="sm">
                            <option>2024</option>
                            <option>2023</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Term</Form.Label>
                        <Form.Select size="sm">
                            <option>All Terms</option>
                            <option>Term 1</option>
                            <option>Term 2</option>
                            <option>Term 3</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Class / Grade</Form.Label>
                        <Form.Select size="sm">
                            <option>All Classes</option>
                            <option>Form 1</option>
                            <option>Form 2</option>
                            <option>Form 3</option>
                            <option>Form 4</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <div className="d-flex gap-2">
                        <Button variant="primary" size="sm" className="w-100 d-flex align-items-center justify-content-center gap-2">
                            <Filter size={14} /> Apply
                        </Button>
                        <Button variant="outline-secondary" size="sm" title="Reset">
                            <RotateCcw size={14} />
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ReportFilters;
