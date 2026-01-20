import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const Procurement = () => {
    return (
        <DashboardLayout title="Procurement">
            <div className="module-content">
                <h2>Procurement Module</h2>
                <p>Manage inventory, suppliers, and purchase orders.</p>
            </div>
        </DashboardLayout>
    );
};

export default Procurement;
