import React, { useState } from 'react';
import { Settings, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockFeeStructures } from '../../fee-structure/data/mockFeeStructureData';
import { mockStudents } from '../../receipt-book/data/mockReceiptData';
import { formatKES } from '../utils/invoiceUtils';

const GenerateInvoiceModal = ({ show, onClose, onGenerate }) => {
    const [config, setConfig] = useState({
        year: '2025',
        term: 'Term 1',
        classId: '',
        students: 'all' // all, selected
    });

    const [preview, setPreview] = useState(null);

    // Finding relevant fee structure
    const getActiveStructure = () => {
        return mockFeeStructures.find(fs =>
            fs.academicYear === config.year &&
            fs.term === config.term &&
            fs.classId === config.classId &&
            fs.status === 'Active'
        );
    };

    const handlePreview = () => {
        const structure = getActiveStructure();
        if (!structure) {
            setPreview({ error: 'No Active Fee Structure found for selected criteria.' });
            return;
        }

        const students = mockStudents.filter(s => s.classId === config.classId);
        const totalAmount = structure.totalTermFee * students.length;

        setPreview({
            structure,
            studentCount: students.length,
            totalAmount,
            feeItems: structure.feeItems
        });
    };

    const handleSubmit = () => {
        if (!preview || preview.error) return;

        onGenerate({
            structureId: preview.structure.id,
            studentIds: [] // Empty implies all applicable
        });
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <Settings size={20} className="me-2" />
                            Auto-Generate Invoices
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label">Academic Year</label>
                                <select
                                    className="form-select"
                                    value={config.year}
                                    onChange={(e) => {
                                        setConfig({ ...config, year: e.target.value });
                                        setPreview(null);
                                    }}
                                >
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Term</label>
                                <select
                                    className="form-select"
                                    value={config.term}
                                    onChange={(e) => {
                                        setConfig({ ...config, term: e.target.value });
                                        setPreview(null);
                                    }}
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Class</label>
                                <select
                                    className="form-select"
                                    value={config.classId}
                                    onChange={(e) => {
                                        setConfig({ ...config, classId: e.target.value });
                                        setPreview(null);
                                    }}
                                >
                                    <option value="">Select Class...</option>
                                    <option value="CLS-001">PP1</option>
                                    <option value="CLS-005">Grade 4</option>
                                    <option value="CLS-010">Form 1</option>
                                    <option value="CLS-013">Form 4</option>
                                </select>
                            </div>
                        </div>

                        <div className="d-grid mb-4">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handlePreview}
                                disabled={!config.classId}
                            >
                                Preview Generation
                            </button>
                        </div>

                        {preview && preview.error && (
                            <div className="alert alert-warning">
                                <AlertTriangle size={18} className="me-2" />
                                {preview.error}
                            </div>
                        )}

                        {preview && !preview.error && (
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Generation Preview</h6>
                                    <div className="row text-center mb-3">
                                        <div className="col-md-4">
                                            <small className="text-muted">Total Students</small>
                                            <div className="fw-bold fs-5">{preview.studentCount}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted">Fee Per Student</small>
                                            <div className="fw-bold fs-5">{formatKES(preview.structure.totalTermFee)}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted">Total Invoice Value</small>
                                            <div className="fw-bold fs-5 text-success">{formatKES(preview.totalAmount)}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center text-success mb-2">
                                        <CheckCircle size={16} className="me-2" />
                                        <small>Using Active Fee Structure v{preview.structure.version}</small>
                                    </div>
                                    <ul className="list-group list-group-flush small border rounded">
                                        {preview.feeItems.slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="list-group-item bg-transparent d-flex justify-content-between">
                                                <span>{item.name}</span>
                                                <span>{formatKES(item.amount)}</span>
                                            </li>
                                        ))}
                                        {preview.feeItems.length > 3 && (
                                            <li className="list-group-item bg-transparent text-center text-muted fst-italic">
                                                +{preview.feeItems.length - 3} more items...
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!preview || preview.error}
                            onClick={handleSubmit}
                        >
                            Confirm & Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateInvoiceModal;
