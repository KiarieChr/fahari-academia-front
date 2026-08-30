import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import LiveMap from '../components/LiveMap';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const LiveTrackingPage = () => {
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [trackingVehicleId, setTrackingVehicleId] = useState<string | null>(null);
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const vehiclesRes = await fleetService.vehicles.list({ status: 'active' });
                setVehicles(vehiclesRes.results || vehiclesRes || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <DashboardLayout title="Live Fleet Tracking">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Live Fleet Tracking</h1>
                    <p>Real-time location and status of active vehicles</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading fleet data..." />
                    </div>
                ) : (
                    <div className="chart-container-compact h-[600px] flex gap-4">
                        <div className="w-1/4 flex flex-col gap-2 overflow-y-auto pr-2 border-r border-slate-100">
                            <h3 className="font-semibold text-sm text-slate-700 mb-2">Active Vehicles</h3>
                            {vehicles.map(v => (
                                <button 
                                    key={v.id}
                                    onClick={() => setTrackingVehicleId(v.id.toString())}
                                    className={`p-3 rounded-lg text-left border transition-all ${trackingVehicleId === v.id.toString() ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div className="font-bold text-sm">{v.registration_number}</div>
                                    <div className="text-xs text-slate-500">{v.make} {v.model}</div>
                                </button>
                            ))}
                        </div>
                        <div className="w-3/4 h-full relative">
                            {trackingVehicleId ? (
                                <LiveMap vehicleId={trackingVehicleId} mapboxToken={mapboxToken} />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 font-medium">Select a vehicle from the sidebar to track</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LiveTrackingPage;
