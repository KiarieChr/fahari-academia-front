import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const StudentFees = () => {
    return (
        <DashboardLayout title="Student Fee Management">
            <div className="module-content">
                <h2>Student Fee Management Module</h2>
                <p>Manage invoicing, collections, and receipting.</p>
            </div>
        </DashboardLayout>
    );
};

export default StudentFees;
