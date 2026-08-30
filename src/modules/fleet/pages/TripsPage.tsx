import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const TripsPage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
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

    const loadData = async () => {
        setLoading(true);
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                fleetService.trips.list(),
                fleetService.vehicles.list(),
                fleetService.drivers.list(),
            ]);
            setTrips(tripsRes.results || tripsRes || []);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
            setDrivers(driversRes.results || driversRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitTrip = async (e) => {
        e.preventDefault();
        try {
            await fleetService.trips.create(tripForm);
            toast.success('Trip logged');
            setTripForm({ reference_number: '', vehicle: '', driver: '', purpose: '', origin: '', destination: '', departure_time: '', status: 'planned' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to log trip');
        }
    };

    return (
        <DashboardLayout title="Trips Log">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Trips Log</h1>
                    <p>Manage fleet trips and journeys</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading trips..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Recent Trips</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Log Trip
                                </button>
                            </div>
                            <ul className="space-y-2 text-sm mt-3">
                                {trips.map((trip) => (
                                    <li key={trip.id} className="border border-slate-200 rounded-lg p-3">
                                        <div className="font-semibold text-slate-800">{trip.reference_number} - {trip.vehicle_registration}</div>
                                        <div className="text-slate-500 mt-1">{trip.origin} to {trip.destination} | <span className="font-medium text-indigo-600">{trip.status}</span></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Log Trip</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitTrip} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Reference Number</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. TRP-1001" value={tripForm.reference_number} onChange={(e) => setTripForm({ ...tripForm, reference_number: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Departure Time</label>
                                        <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={tripForm.departure_time} onChange={(e) => setTripForm({ ...tripForm, departure_time: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={tripForm.vehicle} onChange={(e) => setTripForm({ ...tripForm, vehicle: e.target.value })} required>
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Driver</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={tripForm.driver} onChange={(e) => setTripForm({ ...tripForm, driver: e.target.value })} required>
                                            <option value="">Select driver...</option>
                                            {drivers.map((d) => <option key={d.id} value={d.id}>{d.employee_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Origin</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="Starting Point" value={tripForm.origin} onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Destination</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="Ending Point" value={tripForm.destination} onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Purpose</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="Reason for trip" value={tripForm.purpose} onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Trip</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TripsPage;
