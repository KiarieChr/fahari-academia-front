import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const Finance = () => {
    return (
        <DashboardLayout title="Finance & Accounting">
            <div className="module-content">
                <h2>Finance & Accounting Module</h2>
                <p>General ledger, budgeting, and financial reports.</p>
            </div>
        </DashboardLayout>
    );
};

export default Finance;
