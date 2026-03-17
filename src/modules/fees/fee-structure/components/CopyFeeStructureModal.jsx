import React, { useState, useEffect, useMemo } from 'react';
import { Copy, TrendingUp, Lightbulb, RefreshCw, CheckCircle } from 'lucide-react';
import { formatKES } from '../utils/feeStructureUtils';
import { api } from '../../../../services/api';

/**
 * CopyFeeStructureModal
 * 
 * Enhanced modal for copying fee structures with:
 * 1. Source structure selection from available ACTIVE structures
 * 2. Smart suggestions (Term 1 → Term 2, Previous Year → Current Year)
 * 3. Percentage increase option for new academic years
 */
const CopyFeeStructureModal = ({
    show, onClose, onCopy,
    currentStructure,  // The currently viewed structure (optional pre-selection)
    currentFeeItems,   // Fee items of current structure (for preview)
    classes = [],
    academicYears = [],
    terms = [],
    rawYears = [],     // Full year objects with IDs
    rawTerms = []      // Full term objects with IDs
}) => {
    // Available source structures (ACTIVE only)
    const [availableSources, setAvailableSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);

    // Selected source structure
    const [selectedSourceId, setSelectedSourceId] = useState('');
    const [selectedSource, setSelectedSource] = useState(null);

    // Copy configuration
    const [copyConfig, setCopyConfig] = useState({
        targetClasses: [],
        targetYear: '',
        targetTerm: '',
        percentageIncrease: 0,
        copyMode: 'exact' // 'exact' or 'increase'
    });

    // Fetch available ACTIVE structures when modal opens
    useEffect(() => {
        if (show) {
            fetchAvailableSources();
            // Pre-select current structure if available and active
            if (currentStructure?.id && currentStructure?.status === 'ACTIVE') {
                setSelectedSourceId(String(currentStructure.id));
                setSelectedSource(currentStructure);
            }
        }
    }, [show, currentStructure]);

    const fetchAvailableSources = async () => {
        setLoadingSources(true);
        try {
            const response = await api.get('/api/fees/fee-structures/', {
                params: { status: 'ACTIVE' }
            });
            const structures = response.results || response || [];
            setAvailableSources(structures);
        } catch (error) {
            console.error('Failed to fetch source structures:', error);
            setAvailableSources([]);
        } finally {
            setLoadingSources(false);
        }
    };

    // Handle source selection
    const handleSourceChange = (e) => {
        const id = e.target.value;
        setSelectedSourceId(id);
        const source = availableSources.find(s => String(s.id) === id);
        setSelectedSource(source || null);
    };

    // Generate smart suggestions based on selected source
    const suggestions = useMemo(() => {
        if (!selectedSource) return [];

        const suggestionList = [];
        const sourceYear = selectedSource.academic_year_details?.name || '';
        const sourceTerm = selectedSource.term_details?.name || '';
        const sourceGrade = selectedSource.grade_details?.name || '';
        const sourceGradeId = selectedSource.grade;

        // Extract term number (e.g., "Term 1" → 1)
        const termMatch = sourceTerm.match(/(\d+)/);
        const termNum = termMatch ? parseInt(termMatch[1]) : null;

        // Suggestion 1: Copy to next term (same year, same grade)
        if (termNum && termNum < 3) {
            const nextTermName = `Term ${termNum + 1}`;
            const nextTerm = rawTerms.find(t =>
                t.name === nextTermName &&
                t.academic_year === selectedSource.academic_year
            );
            if (nextTerm) {
                suggestionList.push({
                    id: 'next-term',
                    label: `Copy to ${nextTermName} (same year)`,
                    description: `${sourceGrade} • ${sourceYear} • ${nextTermName}`,
                    config: {
                        targetYear: sourceYear,
                        targetTerm: nextTermName,
                        targetClasses: [sourceGradeId],
                        copyMode: 'exact',
                        percentageIncrease: 0
                    }
                });
            }
        }

        // Suggestion 2: Copy to all terms in same year (for same grade)
        if (termNum === 1) {
            const term2 = rawTerms.find(t => t.name === 'Term 2' && t.academic_year === selectedSource.academic_year);
            const term3 = rawTerms.find(t => t.name === 'Term 3' && t.academic_year === selectedSource.academic_year);
            if (term2 && term3) {
                suggestionList.push({
                    id: 'all-terms',
                    label: 'Copy to Term 2 & 3 (same year)',
                    description: `${sourceGrade} • ${sourceYear} • All remaining terms`,
                    config: {
                        targetYear: sourceYear,
                        targetTerm: 'Term 2', // Will need special handling for multiple terms
                        targetClasses: [sourceGradeId],
                        copyMode: 'exact',
                        percentageIncrease: 0,
                        _multiTerm: ['Term 2', 'Term 3'] // Custom flag for multi-term copy
                    }
                });
            }
        }

        // Suggestion 3: Copy to next academic year (same term, same grade) with increase
        const currentYearIndex = rawYears.findIndex(y => y.name === sourceYear);
        if (currentYearIndex >= 0 && currentYearIndex < rawYears.length - 1) {
            const nextYear = rawYears[currentYearIndex + 1];
            const nextYearTerm = rawTerms.find(t =>
                t.name === sourceTerm &&
                t.academic_year === nextYear.id
            );
            if (nextYearTerm) {
                suggestionList.push({
                    id: 'next-year',
                    label: `Copy to ${nextYear.name} (with 5% increase)`,
                    description: `${sourceGrade} • ${nextYear.name} • ${sourceTerm}`,
                    config: {
                        targetYear: nextYear.name,
                        targetTerm: sourceTerm,
                        targetClasses: [sourceGradeId],
                        copyMode: 'increase',
                        percentageIncrease: 5
                    }
                });
            }
        }

        // Suggestion 4: Copy to all classes in same term/year
        if (classes.length > 1) {
            const otherClasses = classes.filter(c => c.id !== sourceGradeId);
            if (otherClasses.length > 0) {
                suggestionList.push({
                    id: 'all-classes',
                    label: `Copy to all other classes (${otherClasses.length})`,
                    description: `${sourceYear} • ${sourceTerm} • All grades`,
                    config: {
                        targetYear: sourceYear,
                        targetTerm: sourceTerm,
                        targetClasses: otherClasses.map(c => c.id),
                        copyMode: 'exact',
                        percentageIncrease: 0
                    }
                });
            }
        }

        return suggestionList;
    }, [selectedSource, rawYears, rawTerms, classes]);

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

    const handleApplySuggestion = (suggestion) => {
        setCopyConfig({
            ...copyConfig,
            ...suggestion.config
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSource) return;

        // Pass source ID along with config
        onCopy({
            ...copyConfig,
            sourceStructureId: selectedSource.id
        });
        onClose();
    };

    // Calculate preview based on selected source's items
    const calculatePreview = () => {
        const items = selectedSource?.items || currentFeeItems || [];
        if (items.length === 0) return { original: 0, new: 0, difference: 0 };

        const original = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const multiplier = 1 + (parseFloat(copyConfig.percentageIncrease) / 100);
        const newTotal = Math.round(original * multiplier);

        return { original, new: newTotal, difference: newTotal - original };
    };

    const preview = calculatePreview();

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedSourceId('');
            setSelectedSource(null);
            setCopyConfig({
                targetClasses: [],
                targetYear: '',
                targetTerm: '',
                percentageIncrease: 0,
                copyMode: 'exact'
            });
        }
    }, [show]);

    if (!show) return null;

    const sourceItemCount = selectedSource?.items?.length || 0;
    const sourceTotal = selectedSource?.total_amount || 0;

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
                            {/* Source Selection */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Source Structure * (ACTIVE structures only)
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 ms-2"
                                        onClick={fetchAvailableSources}
                                        disabled={loadingSources}
                                    >
                                        <RefreshCw
                                            size={14}
                                            style={loadingSources ? { animation: 'spin 1s linear infinite' } : {}}
                                        />
                                    </button>
                                </label>
                                <select
                                    className="form-select"
                                    value={selectedSourceId}
                                    onChange={handleSourceChange}
                                    required
                                >
                                    <option value="">Select source structure to copy from...</option>
                                    {availableSources.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.grade_details?.name || 'Unknown'} - {s.term_details?.name || ''} {s.academic_year_details?.name || ''}
                                            ({formatKES(s.total_amount || 0)})
                                        </option>
                                    ))}
                                </select>
                                {loadingSources && <small className="text-muted">Loading structures...</small>}
                                {!loadingSources && availableSources.length === 0 && (
                                    <small className="text-warning">No ACTIVE structures available. Activate a structure first.</small>
                                )}
                            </div>

                            {/* Source Info */}
                            {selectedSource && (
                                <div className="alert alert-info mb-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong>Source:</strong> {selectedSource.grade_details?.name} - {selectedSource.term_details?.name} {selectedSource.academic_year_details?.name}
                                            <br />
                                            <small>
                                                <CheckCircle size={12} className="text-success me-1" />
                                                {sourceItemCount} fee items • Total: {formatKES(sourceTotal)}
                                            </small>
                                        </div>
                                        <span className="badge bg-success">ACTIVE</span>
                                    </div>
                                </div>
                            )}

                            {/* Smart Suggestions */}
                            {selectedSource && suggestions.length > 0 && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <Lightbulb size={16} className="me-1 text-warning" />
                                        Quick Suggestions
                                    </label>
                                    <div className="list-group">
                                        {suggestions.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                onClick={() => handleApplySuggestion(s)}
                                            >
                                                <div>
                                                    <div className="fw-semibold">{s.label}</div>
                                                    <small className="text-muted">{s.description}</small>
                                                </div>
                                                <span className="badge bg-primary">Apply</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <hr />

                            {/* Manual Configuration */}
                            <h6 className="text-muted mb-3">Or configure manually:</h6>

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
                                    <small className="text-muted">e.g., 10 for 10% increase (typical annual adjustment: 5-10%)</small>
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
                                    {classes.length === 0 ? (
                                        <p className="text-muted mb-0">No classes available</p>
                                    ) : (
                                        classes.map(cls => (
                                            <div key={cls.id} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`class-${cls.id}`}
                                                    checked={copyConfig.targetClasses.includes(cls.id)}
                                                    onChange={() => handleClassToggle(cls.id)}
                                                />
                                                <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                                    {cls.name} {cls.level ? `(${cls.level})` : ''}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <small className="text-muted">
                                    {copyConfig.targetClasses.length} class(es) selected
                                </small>
                            </div>

                            {/* Preview */}
                            {copyConfig.copyMode === 'increase' && copyConfig.percentageIncrease > 0 && selectedSource && (
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
                                disabled={!selectedSource || !copyConfig.targetYear || !copyConfig.targetTerm || copyConfig.targetClasses.length === 0}
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
