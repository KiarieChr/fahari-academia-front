import React from 'react';
import { FileText, CheckCircle, GraduationCap, DollarSign, ToggleLeft, Link2, Clock, AlertTriangle } from 'lucide-react';
import { formatKES } from '../utils/feeStructureUtils';

const FeeStructureSummaryCards = ({ summary, selectedClass, selectedTerm, termTotal, onCardClick }) => {
    const cards = [
        {
            id: 'total-structures',
            title: 'Total Fee Structures',
            value: summary.totalStructures,
            subtitle: `${summary.classesConfigured} classes configured`,
            icon: FileText,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary'
        },
        {
            id: 'active-structures',
            title: 'Active Fee Structures',
            value: summary.activeStructures,
            subtitle: `${summary.draftStructures} draft, ${summary.archivedStructures} archived`,
            icon: CheckCircle,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success'
        },
        {
            id: 'classes-configured',
            title: 'Classes Configured',
            value: summary.classesConfigured,
            subtitle: 'Out of 15 total classes',
            icon: GraduationCap,
            color: 'info',
            bgClass: 'bg-info-subtle',
            iconClass: 'text-info'
        },
        {
            id: 'term-total',
            title: `Total ${selectedTerm} Fee`,
            value: formatKES(termTotal.total),
            subtitle: selectedClass ? `${selectedClass} - All Students` : 'Select a class',
            icon: DollarSign,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success'
        },
        {
            id: 'mandatory-optional',
            title: 'Mandatory vs Optional',
            value: null,
            subtitle: null,
            icon: ToggleLeft,
            color: 'warning',
            bgClass: 'bg-light',
            iconClass: 'text-warning',
            isCustom: true
        },
        {
            id: 'linked-accounts',
            title: 'Linked Income Accounts',
            value: summary.totalLinkedAccounts,
            subtitle: 'From Chart of Accounts',
            icon: Link2,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary'
        },
        {
            id: 'last-updated',
            title: 'Last Updated Structure',
            value: new Date(summary.lastUpdated).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
            subtitle: new Date(summary.lastUpdated).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
            icon: Clock,
            color: 'secondary',
            bgClass: 'bg-light',
            iconClass: 'text-secondary'
        },
        {
            id: 'missing-mappings',
            title: 'Missing Account Mappings',
            value: summary.missingMappings,
            subtitle: summary.missingMappings > 0 ? 'Action required!' : 'All mapped ✓',
            icon: AlertTriangle,
            color: summary.missingMappings > 0 ? 'danger' : 'success',
            bgClass: summary.missingMappings > 0 ? 'bg-danger-subtle' : 'bg-success-subtle',
            iconClass: summary.missingMappings > 0 ? 'text-danger' : 'text-success'
        }
    ];

    const handleCardClick = (cardId) => {
        if (onCardClick) {
            onCardClick(cardId);
        }
    };

    return (
        <div className="row g-3 mb-4">
            {cards.map((card) => (
                <div key={card.id} className="col-lg-3 col-md-6">
                    <div
                        className={`card border-0 shadow-sm h-100 fee-summary-card ${onCardClick ? 'cursor-pointer' : ''}`}
                        onClick={() => handleCardClick(card.id)}
                    >
                        <div className="card-body">
                            {card.isCustom ? (
                                // Custom Mandatory vs Optional Card
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <p className="text-muted small mb-1">{card.title}</p>
                                        </div>
                                        <div className={`p-3 rounded ${card.bgClass}`}>
                                            <card.icon size={24} className={card.iconClass} />
                                        </div>
                                    </div>
                                    <div className="mandatory-optional-breakdown">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small">Mandatory</span>
                                            <div className="text-end">
                                                <div className="fw-semibold">{formatKES(termTotal.mandatory)}</div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {termTotal.total > 0 ? ((termTotal.mandatory / termTotal.total) * 100).toFixed(0) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small">Optional</span>
                                            <div className="text-end">
                                                <div className="fw-semibold">{formatKES(termTotal.optional)}</div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {termTotal.total > 0 ? ((termTotal.optional / termTotal.total) * 100).toFixed(0) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Standard Card
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <p className="text-muted small mb-1">{card.title}</p>
                                            <h3 className="mb-0 fw-bold">{card.value}</h3>
                                            {card.subtitle && (
                                                <small className={`text-${card.color}`}>{card.subtitle}</small>
                                            )}
                                        </div>
                                        <div className={`p-3 rounded ${card.bgClass}`}>
                                            <card.icon size={24} className={card.iconClass} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeeStructureSummaryCards;
