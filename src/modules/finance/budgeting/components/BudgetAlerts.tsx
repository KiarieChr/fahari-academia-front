import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { formatKES, formatPercentage, formatDate } from '../utils/budgetUtils';

const BudgetAlerts = ({ alerts }) => {
    const getAlertIcon = (severity) => {
        switch (severity) {
            case 'high':
                return <AlertTriangle size={20} />;
            case 'warning':
                return <AlertCircle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getAlertClass = (severity) => {
        switch (severity) {
            case 'high':
                return 'alert alert-danger';
            case 'warning':
                return 'alert alert-warning';
            default:
                return 'alert alert-info';
        }
    };

    if (!alerts || alerts.length === 0) {
        return (
            <div className="alert alert-success">
                <Info size={20} className="me-2" />
                <strong>All Clear!</strong> No budget alerts at this time.
            </div>
        );
    }

    return (
        <div className="budget-alerts mb-4">
            <h6 className="fw-bold mb-3">Budget Alerts & Warnings</h6>
            {alerts.map((alert) => (
                <div key={alert.id} className={`${getAlertClass(alert.severity)} d-flex align-items-start mb-2`}>
                    <div className="me-3">
                        {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>{alert.department}</strong>
                                <p className="mb-0">{alert.message}</p>
                            </div>
                            <small className="text-muted">{formatDate(alert.date)}</small>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetAlerts;
