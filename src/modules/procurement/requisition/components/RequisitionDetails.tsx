
import React from 'react';
import {
    Clock, CheckCircle, XCircle, ArrowLeft, Printer, ShoppingBag,
    FileText, User, Calendar, MapPin, AlertCircle
} from 'lucide-react';

const RequisitionDetails = ({ requisition, onBack }) => {
    if (!requisition) return null;

    const getStatusStep = (status) => {
        const steps = ['Draft', 'Submitted', 'Pending Approval', 'Approved', 'PO Created'];
        const index = steps.indexOf(status);
        if (index === -1 && status === 'Rejected') return 2; // Treat rejected as completion of approval phase
        return index === -1 ? 0 : index;
    };

    const currentStep = getStatusStep(requisition.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} /> <span className="font-medium">Back to List</span>
                </button>
                <div className="flex gap-2">
                    {requisition.status === 'Approved' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                            <ShoppingBag size={18} /> Convert to PO
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Tracker */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Request Status</h4>
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-500"
                                style={{ width: `${(currentStep / 4) * 100}%` }}
                            ></div>

                            <div className="relative flex justify-between">
                                {['Draft', 'Submitted', 'Pending', 'Approved', 'PO Created'].map((step, index) => {
                                    const isCompleted = index <= currentStep;
                                    const isCurrent = index === currentStep;
                                    const isRejected = requisition.status === 'Rejected' && index === 3; // Show rejected at Approved stage

                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors ${isRejected ? 'bg-red-500 border-red-500 text-white' :
                                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                        'bg-white border-gray-300 text-gray-300'
                                                }`}>
                                                {isRejected ? <XCircle size={16} /> :
                                                    isCompleted ? <CheckCircle size={16} /> :
                                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                                            </div>
                                            <span className={`text-xs font-medium ${isRejected ? 'text-red-600' :
                                                    isCurrent ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {isRejected ? 'Rejected' : step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{requisition.title}</h2>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <span className="font-mono bg-white border px-1.5 rounded">{requisition.id}</span>
                                    <span>•</span>
                                    <span>{requisition.requestDate}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm text-gray-500 uppercase tracking-widest">Total Amount</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {(requisition.totalAmount || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Requestor Info</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{requisition.requestedBy}</p>
                                            <p className="text-xs text-gray-500">Requestor</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{requisition.department}</p>
                                            <p className="text-xs text-gray-500">Department</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Logistics</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{requisition.requiredDate}</p>
                                            <p className="text-xs text-gray-500">Required Date</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                            <AlertCircle size={16} />
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${requisition.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {requisition.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Justification</h5>
                                <p className="text-sm text-gray-700 leading-relaxed">{requisition.description}</p>
                            </div>
                        </div>

                        {/* Items Table - Read Only */}
                        <div className="border-t border-gray-100">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(requisition.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{item.category}</td>
                                            <td className="px-6 py-3 text-sm text-gray-900 text-right">{item.quantity} {item.unit}</td>
                                            <td className="px-6 py-3 text-sm text-gray-900 text-right">{(item.unitCost || 0).toLocaleString()}</td>
                                            <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right bg-gray-50/30">
                                                {(item.total || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Approvals & Audit */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Approval Timeline</h4>
                        <div className="space-y-6">
                            {(requisition.approvals || []).length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No approvals yet.</p>
                            ) : (
                                requisition.approvals.map((approval, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-1">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white ${approval.status === 'Approved' ? 'border-green-500' : 'border-red-500'
                                            }`}></div>

                                        <div className="flex flex-col gap-1 -mt-1">
                                            <p className="text-sm font-bold text-gray-900">{approval.stage}</p>
                                            <p className={`text-xs font-medium ${approval.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {approval.status} by {approval.user}
                                            </p>
                                            <p className="text-xs text-gray-400">{approval.date}</p>
                                            {approval.comments && (
                                                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 italic">
                                                    "{approval.comments}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Budget Info</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Budget Line</p>
                                <p className="font-medium text-gray-900">{requisition.budgetLine}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded">
                                    <CheckCircle size={12} /> Validated
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequisitionDetails;
