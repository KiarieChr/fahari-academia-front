import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import { api } from '../../../services/api';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const DriversPage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [driverForm, setDriverForm] = useState({
        employee: '',
        license_number: '',
        license_class: '',
        license_expiry: '',
        status: 'active',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [driversRes, employeesRes] = await Promise.all([
                fleetService.drivers.list(),
                api.get('/workforce/api/employees/'),
            ]);
            setDrivers(driversRes.results || driversRes || []);
            setEmployees(employeesRes.results || employeesRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitDriver = async (e) => {
        e.preventDefault();
        try {
            await fleetService.drivers.create(driverForm);
            toast.success('Driver profile created');
            setDriverForm({ employee: '', license_number: '', license_class: '', license_expiry: '', status: 'active' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to create driver profile');
        }
    };

    return (
        <DashboardLayout title="Drivers Register">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Drivers Register</h1>
                    <p>Manage fleet drivers and licenses</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading drivers..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Driver Profiles</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Add Driver
                                </button>
                            </div>
                            <ul className="space-y-2 text-sm mt-3">
                                {drivers.map((driver) => (
                                    <li key={driver.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{driver.employee_name}</div>
                                            <div className="text-slate-500 text-xs">ID: {driver.employee_no}</div>
                                        </div>
                                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{driver.license_number}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Add Driver Profile</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitDriver} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Employee</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={driverForm.employee} onChange={(e) => setDriverForm({ ...driverForm, employee: e.target.value })} required>
                                            <option value="">Select employee...</option>
                                            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.employee_no} - {emp.first_name} {emp.last_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">License Number</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. DL123456" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">License Class</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. BCE" value={driverForm.license_class} onChange={(e) => setDriverForm({ ...driverForm, license_class: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">License Expiry Date</label>
                                        <input type="date" className="w-full border rounded-lg px-3 py-2" value={driverForm.license_expiry} onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={driverForm.status} onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Driver Profile</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DriversPage;
