import DashboardLayout from '../../dashboard/DashboardLayout';
import StatutorySettings from './components/settings/statutory/StatutorySettings';

const StatutoryDashboard = () => {
    return (
        <DashboardLayout title="Statutory Settings">
            <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                <StatutorySettings />
            </div>
        </DashboardLayout>
    );
};

export default StatutoryDashboard;

