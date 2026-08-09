import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
;
import { Download } from 'lucide-react';
import InstitutionsStats from './components/finance/InstitutionsStats';
import InstitutionsTable from './components/finance/InstitutionsTable';
import RemittanceTracking from './components/finance/RemittanceTracking';

const FinancialInstitutionsDashboard = ({ noLayout = false }) => {
    const content = (
        <div className="dashboard-main-content">
            {/* Top Section with Stats and Main Actions */}
            <div className="dashboard-top-section">
                <InstitutionsStats />
                <div className="dashboard-actions pt-2">
                    <button className="btn btn-sm btn-outline-secondary">
                        <Download size={14} className="me-1" /> Export Master List
                    </button>
                </div>
            </div>

            <div className="row g-4 mt-2">
                {/* 2. Registry Table - Takes up 2/3 space on large screens */}
                <div className="col-xl-8">
                    <InstitutionsTable />
                </div>

                {/* 3. Tracking Sidebar - Takes up 1/3 space on large screens */}
                <div className="col-xl-4">
                    <RemittanceTracking />
                </div>
            </div>
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Financial Institutions">
            {content}
        </DashboardLayout>
    );
};

export default FinancialInstitutionsDashboard;
