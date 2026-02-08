
import React, { useState } from 'react';
import { Table, Badge, Button, Dropdown } from 'react-bootstrap';
import { MoreVertical, Eye, Mail, FileText } from 'lucide-react';

const ArrearsTable = ({ students }) => {
    // Assuming students is an array of objects matching the mock structure

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <Badge bg="success">Active</Badge>;
            case 'Long Overdue': return <Badge bg="danger">Long Overdue</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="table-responsive">
            <Table hover className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Term</th>
                        <th className="text-end">Payable</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Balance</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className="fw-bold text-primary">{student.admNo}</td>
                            <td>{student.name}</td>
                            <td>{student.class}</td>
                            <td>{student.term}</td>
                            <td className="text-end">{formatCurrency(student.payable)}</td>
                            <td className="text-end">{formatCurrency(student.paid)}</td>
                            <td className="text-end fw-bold text-danger">{formatCurrency(student.balance)}</td>
                            <td>{getStatusBadge(student.status)}</td>
                            <td className="text-center">
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="light" size="sm" className="btn-icon rounded-circle no-arrow">
                                        <MoreVertical size={16} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#"><Eye className="me-2 text-muted" size={16} /> View Profile</Dropdown.Item>
                                        <Dropdown.Item href="#"><Mail className="me-2 text-muted" size={16} /> Send Reminder</Dropdown.Item>
                                        <Dropdown.Item href="#"><FileText className="me-2 text-muted" size={16} /> Generate Statement</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan="9" className="text-center py-4 text-muted">
                                No students found matching criteria
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            {/* Pagination Placeholder */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">Showing {students.length} records</small>
                {/* Pagination controls would go here */}
            </div>
        </div>
    );
};

export default ArrearsTable;
