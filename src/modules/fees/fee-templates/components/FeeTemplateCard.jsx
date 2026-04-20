import React, { useState } from 'react';
import { 
    Copy, Power, PowerOff, ChevronDown, ChevronUp, 
    GraduationCap, Users, DollarSign, Layers 
} from 'lucide-react';

/**
     * FeeTemplateCard — displays a single FeeTemplate with summary,
     * covered grades, line items, and quick actions (activate/deactivate/clone).
     *
     * Props:
     *   template      — FeeTemplate object from the API
     *   onActivate    — (templateId) => void
     *   onDeactivate  — (templateId) => void
     *   onClone       — (template) => void — opens clone modal
     *   onEdit        — (template) => void — navigates to edit page
 */
const FeeTemplateCard = ({ template, onActivate, onDeactivate, onClone, onEdit }) => {
    const [expanded, setExpanded] = useState(false);

    const statusBadge = {
        ACTIVE: 'bg-success',
        DRAFT: 'bg-warning text-dark',
        INACTIVE: 'bg-secondary',
    };

    const currency = template.currency || 'KES';
    const fmtAmt = (v) =>
        new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(v ?? 0);

    const mandatoryItems = (template.line_items || []).filter(i => i.is_mandatory);
    const optionalItems = (template.line_items || []).filter(i => !i.is_mandatory);

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-0">
                {/* ── Header row ─────────────────────────────── */}
                <div
                    className="d-flex align-items-center justify-content-between px-3 py-3"
                    role="button"
                    onClick={() => onEdit?.(template)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                            style={{ width: 42, height: 42 }}
                        >
                            <Layers size={20} className="text-primary" />
                        </div>
                        <div>
                            <h6 className="mb-0 fw-semibold">{template.name}</h6>
                            <small className="text-muted">
                                {template.term_name} &bull; {template.year_name}
                            </small>
                        </div>
                    </div>

                    <span className={`badge ${statusBadge[template.status] || 'bg-light text-dark'} px-2 py-1`}>
                        {template.status}
                    </span>
                </div>

                {/* ── KPI strip ──────────────────────────────── */}
                <div className="border-top border-bottom px-3 py-2 bg-light d-flex flex-wrap gap-4 small">
                    <span className="d-flex align-items-center gap-1 text-muted">
                        <GraduationCap size={14} />
                        {(template.covered_grades || []).map(g => g.name).join(', ') || 'No grades'}
                    </span>
                    <span className="d-flex align-items-center gap-1 text-muted">
                        <Users size={14} />
                        {template.student_count ?? 0} students
                    </span>
                    <span className="d-flex align-items-center gap-1 fw-semibold text-dark">
                        <DollarSign size={14} />
                        {fmtAmt(template.total_amount)}
                    </span>
                    <span className="text-muted">
                        Mandatory: {fmtAmt(template.mandatory_total)}
                    </span>
                </div>

                {/* ── Expandable line items ──────────────────── */}
                <div className="px-3 pt-2 pb-1">
                    <button
                        className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expanded ? 'Hide' : 'Show'} line items ({(template.line_items || []).length})
                    </button>

                    {expanded && (
                        <div className="mt-2">
                            {mandatoryItems.length > 0 && (
                                <>
                                    <small className="text-uppercase text-muted fw-bold">Mandatory</small>
                                    <table className="table table-sm table-borderless mb-2">
                                        <tbody>
                                            {mandatoryItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="ps-2">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary me-1">{item.vote_head_code}</span>
                                                        {item.vote_head_name}
                                                    </td>
                                                    <td className="text-end fw-semibold">{fmtAmt(item.amount)}</td>
                                                    <td className="text-muted small">{item.effective_account_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                            {optionalItems.length > 0 && (
                                <>
                                    <small className="text-uppercase text-muted fw-bold">Optional</small>
                                    <table className="table table-sm table-borderless mb-2">
                                        <tbody>
                                            {optionalItems.map(item => (
                                                <tr key={item.id} className="text-muted">
                                                    <td className="ps-2">
                                                        <span className="badge bg-warning bg-opacity-10 text-warning me-1">{item.vote_head_code}</span>
                                                        {item.vote_head_name}
                                                    </td>
                                                    <td className="text-end">{fmtAmt(item.amount)}</td>
                                                    <td className="small">{item.effective_account_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Actions ────────────────────────────────── */}
                <div className="px-3 pb-3 d-flex gap-2">
                    {template.status === 'DRAFT' && onActivate && (
                        <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            onClick={(e) => { e.stopPropagation(); onActivate(template.id); }}
                        >
                            <Power size={14} /> Activate
                        </button>
                    )}
                    {template.status === 'ACTIVE' && onDeactivate && (
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            onClick={(e) => { e.stopPropagation(); onDeactivate(template.id); }}
                        >
                            <PowerOff size={14} /> Deactivate
                        </button>
                    )}
                    {onClone && (
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={(e) => { e.stopPropagation(); onClone(template); }}
                        >
                            <Copy size={14} /> Clone
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeeTemplateCard;
