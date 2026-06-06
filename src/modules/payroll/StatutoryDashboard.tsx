import DashboardLayout from '../../dashboard/DashboardLayout';
import StatutorySettings from './components/settings/statutory/StatutorySettings';

const StatutoryDashboard = ({ noLayout = false }) => {
    const content = (
        <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
            <StatutorySettings />
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Statutory Settings">
            {content}
        </DashboardLayout>
    );
};

export default StatutoryDashboard;

