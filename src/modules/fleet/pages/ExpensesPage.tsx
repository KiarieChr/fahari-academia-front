import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const ExpensesPage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [expenseForm, setExpenseForm] = useState({
        vehicle: '',
        expense_type: 'fuel',
        expense_date: '',
        amount: 0,
        description: '',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [expensesRes, vehiclesRes] = await Promise.all([
                fleetService.expenses.list(),
                fleetService.vehicles.list(),
            ]);
            setExpenses(expensesRes.results || expensesRes || []);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitExpense = async (e) => {
        e.preventDefault();
        try {
            await fleetService.expenses.create(expenseForm);
            toast.success('Expense recorded');
            setExpenseForm({ vehicle: '', expense_type: 'fuel', expense_date: '', amount: 0, description: '' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to record expense');
        }
    };

    return (
        <DashboardLayout title="Other Expenses">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Other Fleet Expenses</h1>
                    <p>Track miscellaneous fleet expenses (insurance, tolls, parking, etc.)</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading expenses..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Miscellaneous Expenses</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Record Expense
                                </button>
                            </div>
                            <ul className="space-y-2 text-sm mt-3">
                                {expenses.map((expense) => (
                                    <li key={expense.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-slate-800">{expense.vehicle_registration}</div>
                                            <div className="text-slate-500 text-xs mt-1">{expense.description}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-700 bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-100">KES {expense.amount}</span>
                                            <div className="text-xs text-slate-400 mt-1 capitalize">{expense.expense_type}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Record Expense</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitExpense} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })} required>
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Expense Type</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={expenseForm.expense_type} onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}>
                                            <option value="fuel">Fuel (Other)</option>
                                            <option value="maintenance">Maintenance (Other)</option>
                                            <option value="insurance">Insurance</option>
                                            <option value="toll">Toll / Parking</option>
                                            <option value="cleaning">Cleaning / Washing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Date</label>
                                        <input type="date" className="w-full border rounded-lg px-3 py-2" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="What was this for?" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (KES)</label>
                                        <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) || 0 })} required />
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Expense</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExpensesPage;
