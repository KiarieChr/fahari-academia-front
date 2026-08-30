import React from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import TransportFinancials from '../components/TransportFinancials';
import '../../../dashboard/dashboard.css';

const FinancialAnalyticsPage = () => {
    return (
        <DashboardLayout title="Financial Analytics">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Transport Financial Analytics</h1>
                    <p>Track income, expenses, and average cost per kilometer</p>
                </div>
                <div className="mt-6">
                    <TransportFinancials />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinancialAnalyticsPage;
