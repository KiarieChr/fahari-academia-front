import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const HumanResource = () => {
    return (
        <DashboardLayout title="Human Resource">
            <div className="module-content">
                <h2>Human Resource Module</h2>
                <p>Employee records, leave management, and staff details.</p>
            </div>
        </DashboardLayout>
    );
};

export default HumanResource;
