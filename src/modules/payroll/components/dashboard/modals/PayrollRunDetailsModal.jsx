import React from 'react';
import { X, Printer, Download, Calendar, DollarSign, Users, Building2, FileText, PieChart } from 'lucide-react';

const PayrollRunDetailsModal = ({ run, onClose }) => {
    if (!run) return null;

    // Mock detailed data enrichment based on the simple run prop
    const details = {
        ...run,
        processedOn: '28th, ' + run.period.split(' ')[1], // e.g., 28th, 2025
        payDate: '30th, ' + run.period.split(' ')[1],
        breakdown: [
            { label: 'Basic Salaries', amount: 3200000, color: 'bg-indigo-500' },
            { label: 'Allowances', amount: 900000, color: 'bg-blue-400' },
            { label: 'Overtime & Bonuses', amount: 200000, color: 'bg-cyan-400' },
        ],
        statutory: [
            { name: 'PAYE (Tax)', amount: 650000, ref: 'P055112233' },
            { name: 'NSSF', amount: 120000, ref: 'SF-99282' },
            { name: 'SHIF / NHIF', amount: 85000, ref: 'NH-11221' },
            { name: 'Housing Levy', amount: 105000, ref: 'HL-88332' },
        ],
        departments: [
            { name: 'Teaching Staff', count: 85, cost: 2800000 },
            { name: 'Administration', count: 12, cost: 850000 },
            { name: 'Support Staff', count: 38, cost: 450000 },
        ]
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-200">
                            {run.period.split(' ')[0].substring(0, 3)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Payroll Run: {run.period}</h2>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${run.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {run.status}
                                </span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> Paid: {details.payDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Print Report">
                            <Printer size={20} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Export CSV">
                            <Download size={20} />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">

                    {/* Top Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users size={48} className="text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Employees</p>
                            <p className="text-2xl font-bold text-gray-800">{run.employees}</p>
                            <div className="mt-2 text-xs text-green-600 flex items-center font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span> 100% Processed
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign size={48} className="text-indigo-500" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Gross Pay</p>
                            <p className="text-2xl font-bold text-gray-800">{run.grossPay}</p>
                            <div className="mt-2 text-xs text-gray-400 flex items-center font-medium">
                                Base + Allowances
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PieChart size={48} className="text-amber-500" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Deductions</p>
                            <p className="text-2xl font-bold text-gray-800">KES 1.1M</p>
                            <div className="mt-2 text-xs text-amber-600 flex items-center font-medium">
                                Statutory + Voluntary
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Building2 size={48} className="text-emerald-500" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Net Pay Disbursed</p>
                            <p className="text-2xl font-bold text-gray-800">{run.netPay}</p>
                            <div className="mt-2 text-xs text-emerald-600 flex items-center font-medium">
                                Final Payout
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Breakdown Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Salary Breakdown */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-gray-400" /> Earnings Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {details.breakdown.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-gray-600 font-medium">{item.label}</span>
                                                <span className="text-gray-900 font-bold">KES {new Intl.NumberFormat().format(item.amount)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.color}`}
                                                    style={{ width: `${(item.amount / 4300000) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Departmental Cost */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Building2 size={18} className="text-gray-400" /> Departmental Cost
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {details.departments.map((dept, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="text-xs text-gray-500 mb-1">{dept.name}</div>
                                            <div className="text-sm font-bold text-gray-800 mb-1">KES {new Intl.NumberFormat().format(dept.cost)}</div>
                                            <div className="text-xs text-indigo-500 font-medium">{dept.count} Employees</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Statutory Side Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Statutory Remittances</h3>
                                <div className="space-y-4">
                                    {details.statutory.map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-700">{stat.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">Ref: {stat.ref}</div>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                KES {new Intl.NumberFormat().format(stat.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-bold text-gray-700">Total Statutory</span>
                                        <span className="text-sm font-bold text-indigo-600">KES 960,000</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                                <FileText size={16} /> View Full Payroll Register
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-white text-sm font-medium">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollRunDetailsModal;
