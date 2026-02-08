import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

import KPIGrid from './components/dashboard/KPIGrid';
import WorkflowStatus from './components/dashboard/WorkflowStatus';
import QuickActionsPanel from './components/dashboard/QuickActionsPanel';
import AnalyticsSection from './components/dashboard/AnalyticsSection';
import AlertsWidget from './components/dashboard/AlertsWidget';
import RecentRunsTable from './components/dashboard/RecentRunsTable';
;

const PayrollDashboard = () => {
    return (
        <DashboardLayout title="Payroll Dashboard">
            <div className="payroll-dashboard">
                

                <div className="dashboard-main-content">
                    {/* 1. KPIs & Top Actions */}
                    <div className="dashboard-top-section">
                        <KPIGrid />
                        <div className="dashboard-actions pt-2">
                            {/* Add main dashboard actions here if any */}
                        </div>
                    </div>

                    <div className="row g-4 mt-2">
                        {/* 2. Left Column: Workflow & Analytics */}
                        <div className="col-xl-8 space-y-4">
                            <WorkflowStatus />
                            <AnalyticsSection />
                            <RecentRunsTable />
                        </div>

                        {/* 3. Right Column: Quick Actions & Alerts */}
                        <div className="col-xl-4 space-y-4">
                            <QuickActionsPanel />
                            <AlertsWidget />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PayrollDashboard;

