import React from 'react';
import { X, Printer, Download, Calendar, DollarSign, Users, Building2, FileText, PieChart, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const PayrollRunDetailsModal = ({ run, onClose }) => {
    if (!run) return null;

    // Derived values
    const gross = parseFloat(run.gross_pay) || 0;
    const net = parseFloat(run.net_pay) || 0;
    const deductions = gross - net;

    // Dynamic mock breakdown based on actual gross
    const details = {
        payDate: run.payment_date ? new Date(run.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending',
        breakdown: [
            { label: 'Basic Salaries', amount: gross * 0.75, color: 'bg-blue-500' },
            { label: 'Allowances', amount: gross * 0.20, color: 'bg-indigo-400' },
            { label: 'Overtime & Bonuses', amount: gross * 0.05, color: 'bg-sky-400' },
        ],
        statutory: [
            { name: 'PAYE (Tax)', amount: deductions * 0.65, ref: 'P055112233' },
            { name: 'NSSF', amount: deductions * 0.15, ref: 'SF-99282' },
            { name: 'SHIF / NHIF', amount: deductions * 0.10, ref: 'NH-11221' },
            { name: 'Housing Levy', amount: deductions * 0.10, ref: 'HL-88332' },
        ],
        departments: [
            { name: 'Teaching Staff', count: Math.ceil(run.employees * 0.65), cost: gross * 0.65 },
            { name: 'Administration', count: Math.ceil(run.employees * 0.15), cost: gross * 0.20 },
            { name: 'Support Staff', count: Math.floor(run.employees * 0.20), cost: gross * 0.15 },
        ]
    };

    const formatKES = (value) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    // Status Timeline
    const steps = ['calculated', 'approved', 'processing', 'paid'];
    const currentStepIndex = steps.indexOf((run.status || '').toLowerCase());
    
    // Fallback if status is something else
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

    const getStatusHeaderColor = () => {
        return 'bg-slate-900'; // Match sidebar theme color
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-2 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200/50">
                
                {/* Premium Header with Dynamic Gradient */}
                <div className={`${getStatusHeaderColor()} px-3 py-3 text-white relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20">
                                    {run.status}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                                    <Calendar size={14} /> Paid: {details.payDate}
                                </span>
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight">Payroll: {run.period}</h2>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all font-medium text-sm">
                                <Printer size={16} /> Print
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 hover:bg-gray-50 shadow-lg rounded-xl transition-all font-bold text-sm">
                                <Download size={16} /> Export CSV
                            </button>
                            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors ml-2">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Status Tracker */}
                    <div className="relative z-10 mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-between max-w-2xl">
                            {['Calculated', 'Approved', 'Processing', 'Paid'].map((step, idx) => {
                                const isCompleted = idx <= activeIndex;
                                return (
                                    <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm border-2 transition-colors ${isCompleted ? 'bg-white border-white text-emerald-500' : 'bg-white/10 border-white/30 text-white/50 backdrop-blur-md'}`}>
                                            {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={10} fill="currentColor" />}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-white/60'}`}>{step}</span>
                                        {/* Connector Line */}
                                        {idx < 3 && (
                                            <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-10 ${idx < activeIndex ? 'bg-white' : 'bg-white/20'}`}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Top KPI Cards */}
                    <div className="row g-4 mb-8">
                        <div className="col-sm-6 col-lg-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all h-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Users size={20} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-0">Employees</h3>
                                </div>
                                <p className="text-2xl font-black text-gray-800 mb-0">{run.employees}</p>
                            </div>
                        </div>
                        
                        <div className="col-sm-6 col-lg-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all h-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <DollarSign size={20} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-0">Gross Pay</h3>
                                </div>
                                <p className="text-2xl font-black text-gray-800 mb-0">{formatKES(gross)}</p>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all h-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <PieChart size={20} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-0">Deductions</h3>
                                </div>
                                <p className="text-2xl font-black text-gray-800 mb-0">{formatKES(deductions)}</p>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all h-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Building2 size={20} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-0">Net Pay</h3>
                                </div>
                                <p className="text-2xl font-black text-emerald-600 mb-0">{formatKES(net)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Columns */}
                    <div className="row g-4">
                        {/* Left Column */}
                        <div className="col-lg-8 space-y-6">
                            {/* Earnings Breakdown */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <FileText className="text-blue-500" size={20} /> Earnings Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {details.breakdown.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="font-semibold text-gray-600">{item.label}</span>
                                                <span className="font-bold text-gray-900">{formatKES(item.amount)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${(item.amount / gross) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Departmental Split */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <Building2 className="text-indigo-500" size={20} /> Departmental Cost Center
                                </h3>
                                <div className="row g-3">
                                    {details.departments.map((dept, idx) => (
                                        <div key={idx} className="col-sm-4">
                                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group h-100">
                                                <p className="text-sm font-semibold text-gray-500 mb-1 group-hover:text-indigo-600 transition-colors">{dept.name}</p>
                                                <p className="text-lg font-black text-gray-800 mb-1">{formatKES(dept.cost)}</p>
                                                <div className="text-xs font-bold text-indigo-500 flex items-center gap-1 bg-indigo-50 inline-flex px-2 py-1 rounded-md">
                                                    <Users size={12} /> {dept.count} Staff
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-lg-4 space-y-6">
                            {/* Statutory Remittances */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-50 rounded-bl-full -z-0 opacity-50"></div>
                                <h3 className="text-lg font-bold text-gray-800 mb-6 relative z-10 flex items-center gap-2">
                                    <PieChart className="text-amber-500" size={20} /> Statutory
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {details.statutory.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">{stat.name}</p>
                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5">Ref: {stat.ref}</p>
                                            </div>
                                            <p className="font-bold text-gray-900">{formatKES(stat.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 relative z-10">
                                    <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                                        <span className="font-bold text-amber-900">Total</span>
                                        <span className="font-black text-amber-700">{formatKES(deductions)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Action */}
                            <button className="w-full group relative overflow-hidden rounded-2xl bg-slate-900 p-[1px] shadow-lg shadow-slate-900/30 transition-transform active:scale-[0.98]">
                                <div className="relative flex items-center justify-between gap-2 rounded-2xl bg-slate-900 px-6 py-4 transition-all group-hover:bg-slate-800">
                                    <span className="font-bold text-white text-sm">View Full Payroll Register</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform group-hover:translate-x-1">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PayrollRunDetailsModal;
