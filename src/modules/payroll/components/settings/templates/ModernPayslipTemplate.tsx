import React from 'react';
import { Share2, Image } from 'lucide-react';

const ModernPayslipTemplate = () => {
    return (
        <div className="bg-white w-full max-w-2xl mx-auto border border-gray-200 shadow-lg rounded-none p-8 font-sans text-sm relative z-[100]">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Image size={400} />
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                        <Image size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Fahari Academia</h1>
                        <p className="text-slate-500">P.O Box 1234 - 00100, Nairobi, Kenya</p>
                        <p className="text-slate-500">info@fahari.co.ke | +254 712 345 678</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-200 uppercase tracking-widest">Payslip</h2>
                    <p className="font-bold text-slate-800 mt-1">December 2025</p>
                </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Employee Name</p>
                    <p className="font-bold text-slate-800 text-lg">John Doe</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Designation</p>
                    <p className="font-semibold text-slate-700">Senior Lecturer</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Employee ID</p>
                    <p className="font-mono text-slate-700">EMP-00123</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">KRA PIN</p>
                    <p className="font-mono text-slate-700">A123456789Z</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Departments</p>
                    <p className="font-semibold text-slate-700">Science Faculty</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Bank Account</p>
                    <p className="font-mono text-slate-700">Equity Bank - 123***789</p>
                </div>
            </div>

            {/* Financials Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Earnings */}
                <div>
                    <h3 className="font-bold text-emerald-700 uppercase text-xs tracking-wider border-b border-emerald-200 pb-2 mb-3">Earnings</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Basic Salary</span>
                            <span className="font-semibold text-slate-900">80,000.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">House Allowance</span>
                            <span className="font-semibold text-slate-900">20,000.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Commuter Allowance</span>
                            <span className="font-semibold text-slate-900">5,000.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Medical Allowance</span>
                            <span className="font-semibold text-slate-900">3,000.00</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between">
                        <span className="font-bold text-slate-700">Gross Pay</span>
                        <span className="font-bold text-slate-900">108,000.00</span>
                    </div>
                </div>

                {/* Deductions */}
                <div>
                    <h3 className="font-bold text-red-700 uppercase text-xs tracking-wider border-b border-red-200 pb-2 mb-3">Deductions</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600">PAYE (Income Tax)</span>
                            <span className="font-semibold text-slate-900">18,450.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">NSSF (Tier I & II)</span>
                            <span className="font-semibold text-slate-900">1,080.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">SHIF / NHIF</span>
                            <span className="font-semibold text-slate-900">2,970.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Housing Levy</span>
                            <span className="font-semibold text-slate-900">1,620.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">HELB Loan</span>
                            <span className="font-semibold text-slate-900">3,500.00</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between">
                        <span className="font-bold text-slate-700">Total Deductions</span>
                        <span className="font-bold text-slate-900">27,620.00</span>
                    </div>
                </div>
            </div>

            {/* Net Pay & Footer */}
            <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between shadow-2xl overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Pay Disbursed</p>
                    <p className="text-4xl font-black tracking-tight">KES 80,380.00</p>
                </div>
                <div className="text-right relative z-10">
                    <div className="inline-flex flex-col items-end">
                        <span className="text-xs text-slate-400 mb-1">Payment Date</span>
                        <span className="font-bold text-lg">30 Dec 2025</span>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -right-6 -top-12 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="absolute -left-6 -bottom-12 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
            </div>

            {/* Note */}
            <div className="mt-8 text-center border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 italic">
                    "This is a system generated payslip. Signature not required."
                </p>
            </div>

        </div>
    );
};

export default ModernPayslipTemplate;
