import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';


const Payroll = ({ noLayout = false }) => {
    const content = (
        <div className="module-content">
            <h2>Payroll Module</h2>
            <p>Manage salaries, payslips, and tax information.</p>
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Payroll">
            {content}
        </DashboardLayout>
    );
};

export default Payroll;
