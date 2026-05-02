import React, { useEffect, useMemo, useState } from 'react';
import { Car, Fuel, Wrench, Route, DollarSign, Users, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StatCardMini from '../../dashboard/components/StatCardMini';
import { fleetService } from '../../services/fleetService';
import { api } from '../../services/api';
import '../../dashboard/dashboard.css';

const initialVehicleForm = {
    registration_number: '',
    make: '',
    model: '',
    year: '',
    vehicle_type: 'van',
    fuel_type: 'diesel',
    status: 'active',
    capacity: 0,
    current_odometer_km: 0,
};

const FleetDashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('vehicles');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
    const [tripForm, setTripForm] = useState({
        reference_number: '',
        vehicle: '',
        driver: '',
        purpose: '',
        origin: '',
        destination: '',
        departure_time: '',
        status: 'planned',
    });
    const [fuelForm, setFuelForm] = useState({
        vehicle: '',
        driver: '',
        filled_at: '',
        odometer_km: 0,
        liters: 0,
        unit_price: 0,
        total_cost: 0,
        payment_method: 'cash',
        station_name: '',
    });
    const [maintenanceForm, setMaintenanceForm] = useState({
        vehicle: '',
        maintenance_type: 'preventive',
        scheduled_date: '',
        description: '',
        status: 'scheduled',
        labor_cost: 0,
        parts_cost: 0,
        total_cost: 0,
    });
    const [expenseForm, setExpenseForm] = useState({
        vehicle: '',
        expense_type: 'fuel',
        expense_date: '',
        amount: 0,
        description: '',
    });
    const [driverForm, setDriverForm] = useState({
        employee: '',
        license_number: '',
        license_class: '',
        license_expiry: '',
        status: 'active',
    });

    const tabs = useMemo(() => ([
        { key: 'vehicles', label: 'Vehicles' },
        { key: 'drivers', label: 'Drivers' },
        { key: 'trips', label: 'Trips' },
        { key: 'fuel', label: 'Fuel Logs' },
        { key: 'maintenance', label: 'Maintenance' },
        { key: 'expenses', label: 'Expenses' },
    ]), []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [
                summaryRes,
                vehiclesRes,
                driversRes,
                tripsRes,
                fuelRes,
                maintenanceRes,
                expensesRes,
                employeesRes,
                departmentsRes,
            ] = await Promise.all([
                fleetService.getDashboardSummary(),
                fleetService.vehicles.list(),
                fleetService.drivers.list(),
                fleetService.trips.list(),
                fleetService.fuelLogs.list(),
                fleetService.maintenanceRecords.list(),
                fleetService.expenses.list(),
                api.get('/workforce/api/employees/'),
                api.get('/workforce/api/departments/'),
            ]);

            setSummary(summaryRes);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
            setDrivers(driversRes.results || driversRes || []);
            setTrips(tripsRes.results || tripsRes || []);
            setFuelLogs(fuelRes.results || fuelRes || []);
            setMaintenanceRecords(maintenanceRes.results || maintenanceRes || []);
            setExpenses(expensesRes.results || expensesRes || []);
            setEmployees(employeesRes.results || employeesRes || []);
            setDepartments(departmentsRes.results || departmentsRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load fleet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'expenses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const submitVehicle = async (e) => {
        e.preventDefault();
        try {
            await fleetService.vehicles.create(vehicleForm);
            toast.success('Vehicle created');
            setVehicleForm(initialVehicleForm);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to create vehicle');
        }
    };

    const submitDriver = async (e) => {
        e.preventDefault();
        try {
            await fleetService.drivers.create(driverForm);
            toast.success('Driver profile created');
            setDriverForm({ employee: '', license_number: '', license_class: '', license_expiry: '', status: 'active' });
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to create driver profile');
        }
    };

    const submitTrip = async (e) => {
        e.preventDefault();
        try {
            await fleetService.trips.create(tripForm);
            toast.success('Trip logged');
            setTripForm({ reference_number: '', vehicle: '', driver: '', purpose: '', origin: '', destination: '', departure_time: '', status: 'planned' });
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to log trip');
        }
    };

    const submitFuel = async (e) => {
        e.preventDefault();
        try {
            await fleetService.fuelLogs.create(fuelForm);
            toast.success('Fuel log saved');
            setFuelForm({ vehicle: '', driver: '', filled_at: '', odometer_km: 0, liters: 0, unit_price: 0, total_cost: 0, payment_method: 'cash', station_name: '' });
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save fuel log');
        }
    };

    const submitMaintenance = async (e) => {
        e.preventDefault();
        try {
            await fleetService.maintenanceRecords.create(maintenanceForm);
            toast.success('Maintenance record saved');
            setMaintenanceForm({ vehicle: '', maintenance_type: 'preventive', scheduled_date: '', description: '', status: 'scheduled', labor_cost: 0, parts_cost: 0, total_cost: 0 });
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save maintenance record');
        }
    };

    const submitExpense = async (e) => {
        e.preventDefault();
        try {
            await fleetService.expenses.create(expenseForm);
            toast.success('Expense saved');
            setExpenseForm({ vehicle: '', expense_type: 'fuel', expense_date: '', amount: 0, description: '' });
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save expense');
        }
    };

    return (
        <DashboardLayout title="Fleet Management">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Fleet Management</h1>
                    <p>Manage vehicles, mileage, services, maintenance, trips, drivers, and expenses.</p>
                </div>

                <div className="stats-grid-dense mb-4">
                    <StatCardMini title="Total Vehicles" value={summary?.total_vehicles || 0} icon={Car} color="#dbeafe" iconColor="#1d4ed8" />
                    <StatCardMini title="Active Vehicles" value={summary?.active_vehicles || 0} icon={Route} color="#dcfce7" iconColor="#15803d" />
                    <StatCardMini title="Monthly Fuel Cost" value={summary?.month_fuel_cost || 0} icon={Fuel} color="#fef3c7" iconColor="#d97706" />
                    <StatCardMini title="Maintenance Cost" value={summary?.month_maintenance_cost || 0} icon={Wrench} color="#fee2e2" iconColor="#dc2626" />
                    <StatCardMini title="Trips This Month" value={summary?.trips_this_month || 0} icon={Route} color="#e0e7ff" iconColor="#4338ca" />
                    <StatCardMini title="Drivers" value={drivers.length} icon={Users} color="#f3e8ff" iconColor="#7e22ce" />
                    <StatCardMini title="Due Service" value={summary?.due_service || 0} icon={Wrench} color="#ffedd5" iconColor="#c2410c" />
                    <StatCardMini title="Total Cost" value={summary?.month_total_cost || 0} icon={DollarSign} color="#d1fae5" iconColor="#065f46" />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="chart-container-compact"><p>Loading fleet data...</p></div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {activeTab === 'vehicles' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Add Vehicle</h3></div>
                                    <form onSubmit={submitVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="border rounded-lg px-3 py-2" placeholder="Registration" value={vehicleForm.registration_number} onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="Make" value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="Model" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} required />
                                        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Year" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) || '' })} />
                                        <select className="border rounded-lg px-3 py-2" value={vehicleForm.vehicle_type} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}>
                                            <option value="bus">Bus</option><option value="van">Van</option><option value="pickup">Pickup</option><option value="saloon">Saloon</option><option value="truck">Truck</option><option value="motorbike">Motorbike</option><option value="ambulance">Ambulance</option><option value="other">Other</option>
                                        </select>
                                        <select className="border rounded-lg px-3 py-2" value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}>
                                            <option value="active">Active</option><option value="maintenance">Under Maintenance</option><option value="grounded">Grounded</option><option value="disposed">Disposed</option>
                                        </select>
                                        <input className="border rounded-lg px-3 py-2" placeholder="Fuel Type" value={vehicleForm.fuel_type} onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })} />
                                        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Capacity" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) || 0 })} />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Current Odometer (km)" value={vehicleForm.current_odometer_km} onChange={(e) => setVehicleForm({ ...vehicleForm, current_odometer_km: Number(e.target.value) || 0 })} />
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold inline-flex items-center justify-center gap-2"><Plus size={16} /> Save Vehicle</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Vehicle Register</h3></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-left border-b"><th className="py-2">Reg.</th><th>Vehicle</th><th>Status</th><th>Odometer</th></tr></thead>
                                            <tbody>
                                                {vehicles.slice(0, 20).map((vehicle) => (
                                                    <tr key={vehicle.id} className="border-b border-slate-100"><td className="py-2 font-semibold">{vehicle.registration_number}</td><td>{vehicle.make} {vehicle.model}</td><td>{vehicle.status}</td><td>{vehicle.current_odometer_km}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'drivers' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Add Driver Profile</h3></div>
                                    <form onSubmit={submitDriver} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <select className="border rounded-lg px-3 py-2" value={driverForm.employee} onChange={(e) => setDriverForm({ ...driverForm, employee: e.target.value })} required>
                                            <option value="">Select employee</option>
                                            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.employee_no} - {emp.first_name} {emp.last_name}</option>)}
                                        </select>
                                        <input className="border rounded-lg px-3 py-2" placeholder="License Number" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="License Class" value={driverForm.license_class} onChange={(e) => setDriverForm({ ...driverForm, license_class: e.target.value })} required />
                                        <input type="date" className="border rounded-lg px-3 py-2" value={driverForm.license_expiry} onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })} required />
                                        <select className="border rounded-lg px-3 py-2 md:col-span-2" value={driverForm.status} onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}><option value="active">Active</option><option value="suspended">Suspended</option><option value="inactive">Inactive</option></select>
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Driver Profile</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Driver Profiles</h3></div>
                                    <ul className="space-y-2">
                                        {drivers.slice(0, 25).map((driver) => (
                                            <li key={driver.id} className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex justify-between">
                                                <span>{driver.employee_no} - {driver.employee_name}</span>
                                                <span className="text-slate-500">{driver.license_number}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeTab === 'trips' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Log Trip</h3></div>
                                    <form onSubmit={submitTrip} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="border rounded-lg px-3 py-2" placeholder="Reference Number" value={tripForm.reference_number} onChange={(e) => setTripForm({ ...tripForm, reference_number: e.target.value })} required />
                                        <input type="datetime-local" className="border rounded-lg px-3 py-2" value={tripForm.departure_time} onChange={(e) => setTripForm({ ...tripForm, departure_time: e.target.value })} required />
                                        <select className="border rounded-lg px-3 py-2" value={tripForm.vehicle} onChange={(e) => setTripForm({ ...tripForm, vehicle: e.target.value })} required><option value="">Select vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select>
                                        <select className="border rounded-lg px-3 py-2" value={tripForm.driver} onChange={(e) => setTripForm({ ...tripForm, driver: e.target.value })} required><option value="">Select driver</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.employee_name}</option>)}</select>
                                        <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Purpose" value={tripForm.purpose} onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="Origin" value={tripForm.origin} onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="Destination" value={tripForm.destination} onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })} required />
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Trip</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Recent Trips</h3></div>
                                    <ul className="space-y-2 text-sm">
                                        {trips.slice(0, 25).map((trip) => (
                                            <li key={trip.id} className="border border-slate-200 rounded-lg p-2">
                                                <div className="font-semibold">{trip.reference_number} - {trip.vehicle_registration}</div>
                                                <div className="text-slate-600">{trip.origin} to {trip.destination} | {trip.status}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeTab === 'fuel' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Add Fuel Log</h3></div>
                                    <form onSubmit={submitFuel} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <select className="border rounded-lg px-3 py-2" value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })} required><option value="">Select vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select>
                                        <select className="border rounded-lg px-3 py-2" value={fuelForm.driver} onChange={(e) => setFuelForm({ ...fuelForm, driver: e.target.value })}><option value="">Select driver</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.employee_name}</option>)}</select>
                                        <input type="datetime-local" className="border rounded-lg px-3 py-2" value={fuelForm.filled_at} onChange={(e) => setFuelForm({ ...fuelForm, filled_at: e.target.value })} required />
                                        <input className="border rounded-lg px-3 py-2" placeholder="Station" value={fuelForm.station_name} onChange={(e) => setFuelForm({ ...fuelForm, station_name: e.target.value })} />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Odometer km" value={fuelForm.odometer_km} onChange={(e) => setFuelForm({ ...fuelForm, odometer_km: Number(e.target.value) || 0 })} required />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: Number(e.target.value) || 0 })} required />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Unit Price" value={fuelForm.unit_price} onChange={(e) => setFuelForm({ ...fuelForm, unit_price: Number(e.target.value) || 0 })} required />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Total Cost" value={fuelForm.total_cost} onChange={(e) => setFuelForm({ ...fuelForm, total_cost: Number(e.target.value) || 0 })} required />
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Fuel Log</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Recent Fuel Logs</h3></div>
                                    <ul className="space-y-2 text-sm">
                                        {fuelLogs.slice(0, 25).map((log) => (
                                            <li key={log.id} className="border border-slate-200 rounded-lg p-2 flex justify-between">
                                                <span>{log.vehicle_registration} | {log.liters}L</span>
                                                <span className="font-semibold">{log.total_cost}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeTab === 'maintenance' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Add Maintenance Record</h3></div>
                                    <form onSubmit={submitMaintenance} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <select className="border rounded-lg px-3 py-2" value={maintenanceForm.vehicle} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicle: e.target.value })} required><option value="">Select vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select>
                                        <select className="border rounded-lg px-3 py-2" value={maintenanceForm.maintenance_type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value })}><option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="inspection">Inspection</option><option value="tire">Tire</option><option value="other">Other</option></select>
                                        <input type="date" className="border rounded-lg px-3 py-2" value={maintenanceForm.scheduled_date} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduled_date: e.target.value })} required />
                                        <select className="border rounded-lg px-3 py-2" value={maintenanceForm.status} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}><option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select>
                                        <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} required />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Labor Cost" value={maintenanceForm.labor_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, labor_cost: Number(e.target.value) || 0 })} />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" placeholder="Parts Cost" value={maintenanceForm.parts_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, parts_cost: Number(e.target.value) || 0 })} />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Total Cost" value={maintenanceForm.total_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, total_cost: Number(e.target.value) || 0 })} />
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Maintenance</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Maintenance Records</h3></div>
                                    <ul className="space-y-2 text-sm">
                                        {maintenanceRecords.slice(0, 25).map((record) => (
                                            <li key={record.id} className="border border-slate-200 rounded-lg p-2 flex justify-between">
                                                <span>{record.vehicle_registration} | {record.maintenance_type}</span>
                                                <span>{record.total_cost}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeTab === 'expenses' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Quick Add Expense</h3></div>
                                    <form onSubmit={submitExpense} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <select className="border rounded-lg px-3 py-2" value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })} required><option value="">Select vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select>
                                        <select className="border rounded-lg px-3 py-2" value={expenseForm.expense_type} onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}><option value="fuel">Fuel</option><option value="service">Service</option><option value="repair">Repair</option><option value="tires">Tires</option><option value="insurance">Insurance</option><option value="license">License</option><option value="allowance">Allowance</option><option value="other">Other</option></select>
                                        <input type="date" className="border rounded-lg px-3 py-2" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
                                        <input type="number" step="0.01" className="border rounded-lg px-3 py-2" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) || 0 })} required />
                                        <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Expense</button>
                                    </form>
                                </div>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact"><h3>Expense Ledger</h3></div>
                                    <ul className="space-y-2 text-sm">
                                        {expenses.slice(0, 25).map((expense) => (
                                            <li key={expense.id} className="border border-slate-200 rounded-lg p-2 flex justify-between">
                                                <span>{expense.vehicle_registration} | {expense.expense_type}</span>
                                                <span>{expense.amount}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default FleetDashboard;
