import React, { useState } from 'react';
import { Copy, TrendingUp } from 'lucide-react';
import { formatKES } from '../utils/feeStructureUtils';

const CopyFeeStructureModal = ({
    show, onClose, onCopy,
    sourceStructure, sourceFeeItems,
    classes = [], academicYears = [], terms = []
}) => {
    const [copyConfig, setCopyConfig] = useState({
        targetClasses: [],
        targetYear: '',
        targetTerm: '',
        percentageIncrease: 0,
        copyMode: 'exact' // 'exact' or 'increase'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCopyConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleClassToggle = (classId) => {
        setCopyConfig(prev => ({
            ...prev,
            targetClasses: prev.targetClasses.includes(classId)
                ? prev.targetClasses.filter(id => id !== classId)
                : [...prev.targetClasses, classId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCopy(copyConfig);
        onClose();
    };

    const calculatePreview = () => {
        if (!sourceFeeItems || sourceFeeItems.length === 0) return { original: 0, new: 0 };

        const original = sourceFeeItems.reduce((sum, item) => sum + item.amount, 0);
        const multiplier = 1 + (parseFloat(copyConfig.percentageIncrease) / 100);
        const newTotal = Math.round(original * multiplier);

        return { original, new: newTotal, difference: newTotal - original };
    };

    const preview = calculatePreview();

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <Copy size={20} className="me-2" />
                            Copy Fee Structure
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Source Info */}
                            <div className="alert alert-info">
                                <strong>Source:</strong> {sourceStructure?.className} - {sourceStructure?.term} {sourceStructure?.academicYear}
                                <br />
                                <small>{sourceFeeItems?.length || 0} fee items</small>
                            </div>

                            {/* Copy Mode */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Copy Mode</label>
                                <div className="btn-group w-100" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="copyMode"
                                        id="exact"
                                        value="exact"
                                        checked={copyConfig.copyMode === 'exact'}
                                        onChange={handleChange}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="exact">
                                        Exact Copy
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="copyMode"
                                        id="increase"
                                        value="increase"
                                        checked={copyConfig.copyMode === 'increase'}
                                        onChange={handleChange}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="increase">
                                        With Percentage Increase
                                    </label>
                                </div>
                            </div>

                            {/* Percentage Increase */}
                            {copyConfig.copyMode === 'increase' && (
                                <div className="mb-3">
                                    <label className="form-label">Percentage Increase (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="percentageIncrease"
                                        value={copyConfig.percentageIncrease}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <small className="text-muted">e.g., 10 for 10% increase</small>
                                </div>
                            )}

                            {/* Target Year */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Target Academic Year *</label>
                                <select
                                    className="form-select"
                                    name="targetYear"
                                    value={copyConfig.targetYear}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Year...</option>
                                    {academicYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Term */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Target Term *</label>
                                <select
                                    className="form-select"
                                    name="targetTerm"
                                    value={copyConfig.targetTerm}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Term...</option>
                                    {terms.map(term => (
                                        <option key={term} value={term}>{term}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Classes */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Target Classes * (Select one or more)</label>
                                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {classes.map(cls => (
                                        <div key={cls.id} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`class-${cls.id}`}
                                                checked={copyConfig.targetClasses.includes(cls.id)}
                                                onChange={() => handleClassToggle(cls.id)}
                                            />
                                            <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                                {cls.name} ({cls.level})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <small className="text-muted">
                                    {copyConfig.targetClasses.length} class(es) selected
                                </small>
                            </div>

                            {/* Preview */}
                            {copyConfig.copyMode === 'increase' && copyConfig.percentageIncrease > 0 && (
                                <div className="alert alert-success">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Preview:</strong>
                                            <div>Original Total: {formatKES(preview.original)}</div>
                                            <div>New Total: {formatKES(preview.new)}</div>
                                        </div>
                                        <div className="text-end">
                                            <TrendingUp size={24} className="text-success" />
                                            <div className="fw-bold text-success">
                                                +{formatKES(preview.difference)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!copyConfig.targetYear || !copyConfig.targetTerm || copyConfig.targetClasses.length === 0}
                            >
                                Copy to {copyConfig.targetClasses.length} Class(es)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CopyFeeStructureModal;
