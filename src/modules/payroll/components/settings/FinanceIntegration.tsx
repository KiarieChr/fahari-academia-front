import React, { useState } from 'react';
import { Building2, CreditCard, Landmark, Save, AlertCircle } from 'lucide-react';

const FinanceIntegration = () => {
    const [accounts, setAccounts] = useState({
        salaryExpense: '6001 - Salaries & Wages',
        taxLiability: '2001 - PAYE Payable',
        nssfPayable: '2002 - NSSF Payable',
        nhifPayable: '2003 - NHIF Payable',
        housingLevy: '2004 - Housing Levy Payable',
        pensionLiability: '2005 - Pension Payable',
        netPayPayable: '2010 - Net Salary Payable',
        bankAccount: '1001 - Equity Bank Main'
    });

    const chartOfAccounts = [
        '6001 - Salaries & Wages',
        '6002 - Staff Bonuses',
        '6003 - Overtime Expense',
        '2001 - PAYE Payable',
        '2002 - NSSF Payable',
        '2003 - NHIF Payable',
        '2004 - Housing Levy Payable',
        '2005 - Pension Payable',
        '2010 - Net Salary Payable',
        '1001 - Equity Bank Main',
        '1002 - KCB Bank Operations',
        '1003 - Co-operative Bank'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Landmark size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Finance & Accounts Integration</h2>
                    <p className="text-sm text-gray-500">Map payroll components to General Ledger (GL) accounts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Mapping */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" /> Expense Accounts
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Gross Salary Expense</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={accounts.salaryExpense}
                                onChange={(e) => setAccounts({ ...accounts, salaryExpense: e.target.value })}
                            >
                                {chartOfAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Debit account for total gross pay</p>
                        </div>
                    </div>
                </div>

                {/* Liability Mapping */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-gray-400" /> Statutory Liabilities
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'PAYE (Tax) Payable', key: 'taxLiability' },
                            { label: 'NSSF Payable', key: 'nssfPayable' },
                            { label: 'NHIF / SHIF Payable', key: 'nhifPayable' },
                            { label: 'Housing Levy Payable', key: 'housingLevy' }
                        ].map((item) => (
                            <div key={item.key}>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">{item.label}</label>
                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={accounts[item.key]}
                                    onChange={(e) => setAccounts({ ...accounts, [item.key]: e.target.value })}
                                >
                                    {chartOfAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disbursement Settings */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" /> Disbursement Accounts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Net Pay Liability</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={accounts.netPayPayable}
                                onChange={(e) => setAccounts({ ...accounts, netPayPayable: e.target.value })}
                            >
                                {chartOfAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Control account for net salary before payment</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Source Bank Account</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={accounts.bankAccount}
                                onChange={(e) => setAccounts({ ...accounts, bankAccount: e.target.value })}
                            >
                                {chartOfAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Bank account credited during disbursement</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceIntegration;
