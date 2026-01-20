import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const Payroll = () => {
    return (
        <DashboardLayout title="Payroll">
            <div className="module-content">
                <h2>Payroll Module</h2>
                <p>Manage salaries, payslips, and tax information.</p>
            </div>
        </DashboardLayout>
    );
};

export default Payroll;
