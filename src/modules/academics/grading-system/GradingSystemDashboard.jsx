import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import GradingHeader from './components/GradingHeader';
import GradingSummaryCards from './components/GradingSummaryCards';
import CBCGradingTable from './components/CBCGradingTable';
import IGCSEGradingTable from './components/IGCSEGradingTable';
import GradingSimulator from './components/GradingSimulator';

const GradingSystemDashboard = () => {
    const [curriculum, setCurriculum] = useState('CBC'); // 'CBC' | 'IGCSE'

    return (
        <DashboardLayout title="Grading System">
            <div className={`p-6 space-y-6 max-w-[1600px] mx-auto transition-colors duration-500 ${curriculum === 'CBC' ? 'bg-teal-50/30' : 'bg-indigo-50/30'
                }`}>
                <GradingHeader
                    curriculum={curriculum}
                    setCurriculum={setCurriculum}
                />

                <GradingSummaryCards curriculum={curriculum} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {curriculum === 'CBC' ? <CBCGradingTable /> : <IGCSEGradingTable />}
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <GradingSimulator curriculum={curriculum} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GradingSystemDashboard;
