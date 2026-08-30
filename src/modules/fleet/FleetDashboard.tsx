import React, { useEffect, useState } from 'react';
import { Car, Fuel, Wrench, Route } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StatCardMini from '../../dashboard/components/StatCardMini';
import { fleetService } from '../../services/fleetService';
import { CardGridSkeleton } from '../../components/ui/LoadingSkeleton';
import '../../dashboard/dashboard.css';

const FleetDashboard = ({ noLayout = false }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const summaryRes = await fleetService.getDashboardSummary();
            setSummary(summaryRes);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load fleet summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const content = (
        <div className="dashboard-home">
            <div className="dashboard-header">
                <h1>Fleet Management Overview</h1>
                <p>Summary of vehicles, mileage, services, trips, and expenses.</p>
            </div>

            {loading ? (
                <CardGridSkeleton count={5} />
            ) : (
                <div className="stats-grid-dense mb-4">
                    <StatCardMini title="Total Vehicles" value={summary?.total_vehicles || 0} icon={Car} color="#dbeafe" iconColor="#1d4ed8" />
                    <StatCardMini title="Active Vehicles" value={summary?.active_vehicles || 0} icon={Route} color="#dcfce7" iconColor="#15803d" />
                    <StatCardMini title="Monthly Fuel Cost" value={summary?.month_fuel_cost || 0} icon={Fuel} color="#fef3c7" iconColor="#d97706" />
                    <StatCardMini title="Maintenance Cost" value={summary?.month_maintenance_cost || 0} icon={Wrench} color="#fee2e2" iconColor="#dc2626" />
                    <StatCardMini title="Trips This Month" value={summary?.trips_this_month || 0} icon={Route} color="#e0e7ff" iconColor="#4338ca" />
                </div>
            )}
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Fleet Overview">
            {content}
        </DashboardLayout>
    );
};

export default FleetDashboard;
