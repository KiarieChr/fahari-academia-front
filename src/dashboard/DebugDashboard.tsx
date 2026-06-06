import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import DashboardLayout from '../dashboard/DashboardLayout';

const DebugDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/api/dashboard/debug/');
                setData(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch debug data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">System Debug Dashboard</h1>

                {loading && <p>Loading...</p>}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                        <p className="text-sm mt-2">Check console for details. Ensure you are logged in.</p>
                    </div>
                )}

                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Authentication Status</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="font-medium text-green-600">{data.status}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">User ID:</span>
                                    <span className="font-medium">{data.user_id}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Message:</span>
                                    <span className="font-medium">{data.message}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Auth Method:</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
                                        {data.auth_method}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">System Statistics</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Total Users:</span>
                                    <span className="font-medium">{data.data?.total_users}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Active Users:</span>
                                    <span className="font-medium">{data.data?.active_users}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Your Role:</span>
                                    <span className="font-medium">{data.data?.your_role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded border">
                            <h3 className="font-semibold mb-2">Raw Response:</h3>
                            <pre className="text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DebugDashboard;
