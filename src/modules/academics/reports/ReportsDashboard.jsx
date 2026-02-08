import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import ReportsHeader from './components/ReportsHeader';
import ReportsOverview from './components/ReportsOverview';
import StudentReportsTable from './components/StudentReportsTable';

const ReportsDashboard = () => {
    const [curriculum, setCurriculum] = useState('CBC'); // 'CBC' | 'IGCSE'

    return (
        <DashboardLayout title="Reports">
            <div className={`p-6 space-y-6 max-w-[1200px] mx-auto min-h-[100vh] transition-colors duration-500 ${curriculum === 'CBC' ? 'bg-teal-50/10' : 'bg-indigo-50/10'
                }`}>
                <ReportsHeader
                    curriculum={curriculum}
                    setCurriculum={setCurriculum}
                />

                <ReportsOverview curriculum={curriculum} />

                <StudentReportsTable curriculum={curriculum} />
            </div>
        </DashboardLayout>
    );
};

export default ReportsDashboard;
