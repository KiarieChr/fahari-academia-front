import React from 'react';
import { feeStructureStatuses } from '../data/mockFeeStructureData';
import { Copy, Archive, CheckCircle } from 'lucide-react';

const ClassTermSelector = ({
    classes = [],
    academicYears = [],
    terms = [],
    selectedClass,
    selectedYear,
    selectedTerm,
    selectedStatus,
    onClassChange,
    onYearChange,
    onTermChange,
    onStatusChange,
    onCopy,
    onArchive,
    onActivate,
    currentStructure
    // Removed propagateToLevel - simplified workflow
}) => {
    // Determine the level for the current selected class
    const currentLevel = classes.find(c => c.id == selectedClass)?.level || 'Current Level';
    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
                {/* Class & Year Selection */}
                <div className="row g-3 mb-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold small">Class / Grade</label>
                        <select
                            className="form-select"
                            value={selectedClass}
                            onChange={(e) => onClassChange(e.target.value)}
                        >
                            <option value="">Select Class...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.level})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold small">Academic Year</label>
                        <select
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => onYearChange(e.target.value)}
                        >
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold small">Status Filter</label>
                        <select
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {feeStructureStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold small">Quick Actions</label>
                        <div className="d-flex gap-2">

                            <button
                                className="btn btn-sm btn-outline-primary flex-fill"
                                onClick={onCopy}
                                title="Copy Fee Structure"
                                disabled={!currentStructure}
                            >
                                <Copy size={14} />
                            </button>
                            {currentStructure && currentStructure.status === 'Draft' && (
                                <button
                                    className="btn btn-sm btn-outline-success flex-fill"
                                    onClick={onActivate}
                                    title="Activate Fee Structure"
                                >
                                    <CheckCircle size={14} />
                                </button>
                            )}
                            {currentStructure && currentStructure.status === 'Active' && !currentStructure.billingStarted && (
                                <button
                                    className="btn btn-sm btn-outline-warning flex-fill"
                                    onClick={onArchive}
                                    title="Archive Fee Structure"
                                >
                                    <Archive size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Term Tabs */}
                {selectedClass && (
                    <div className="term-tabs">
                        <div className="btn-group w-100" role="group">
                            {terms.map(term => (
                                <button
                                    key={term}
                                    type="button"
                                    className={`btn ${selectedTerm === term ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => onTermChange(term)}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Structure Info */}
                {currentStructure && (
                    <div className="alert alert-info mt-3 mb-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Current Structure:</strong> {currentStructure.className} - {currentStructure.term} {currentStructure.academicYear}
                                <span className={`badge ms-2 ${currentStructure.status === 'Active' ? 'bg-success' :
                                    currentStructure.status === 'Draft' ? 'bg-secondary' :
                                        'bg-warning'
                                    }`}>
                                    {currentStructure.status}
                                </span>
                                {currentStructure.billingStarted && (
                                    <span className="badge bg-danger ms-2">Billing Started - Read Only</span>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                {/* Removed Uniform Structure Toggle - simplified workflow */}
                                <div className="text-end">
                                    <small className="text-muted d-block">
                                        Version {currentStructure.version} | {currentStructure.studentCount} students
                                    </small>
                                    {currentStructure.lastModified && (
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                            Updated: {new Date(currentStructure.lastModified).toLocaleDateString()}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassTermSelector;
