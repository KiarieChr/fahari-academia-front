import React from 'react';
import { CreditCard, Smartphone, CheckCircle, Info } from 'lucide-react';

const ParentFeeBalances: React.FC = () => {
  // In a real scenario, this would be fetched from the backend API
  const studentName = "John Doe";
  const admissionNumber = "ADM-1002";
  const paybillNumber = "600000";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fee Balances</h1>
          <p className="text-gray-500 mt-1">Manage and pay school fees for {studentName}</p>
        </div>
      </div>

      {/* M-Pesa Payment Instructions Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 overflow-hidden shadow-sm">
        <div className="bg-green-500 text-white px-6 py-4 flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pay via M-Pesa (Auto-Receipting)</h2>
            <p className="text-green-50 text-sm">Payments are automatically validated and receipted instantly.</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg border-b pb-2">Payment Steps</h3>
              <ol className="space-y-4 relative border-l-2 border-green-200 ml-3">
                <li className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-green-50">1</span>
                  <p className="text-gray-700 font-medium">Go to M-Pesa Menu</p>
                  <p className="text-gray-500 text-sm">Select Lipa Na M-Pesa</p>
                </li>
                <li className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-green-50">2</span>
                  <p className="text-gray-700 font-medium">Select Paybill</p>
                  <p className="text-gray-500 text-sm">Enter Business Number</p>
                </li>
                <li className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-green-50">3</span>
                  <p className="text-gray-700 font-medium">Enter Account Number</p>
                  <p className="text-gray-500 text-sm">Use the student's admission number</p>
                </li>
                <li className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-green-50">4</span>
                  <p className="text-gray-700 font-medium">Enter Amount & PIN</p>
                  <p className="text-gray-500 text-sm">Wait for the confirmation SMS</p>
                </li>
              </ol>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm space-y-4 h-fit">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Business No. (Paybill)</p>
                <div className="text-3xl font-bold text-gray-900 font-mono tracking-widest">{paybillNumber}</div>
              </div>
              
              <div className="h-px bg-gray-100 w-full my-4"></div>
              
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Account No.</p>
                <div className="text-3xl font-bold text-green-600 font-mono tracking-widest bg-green-50 py-2 px-3 rounded-lg inline-block border border-green-100">
                  {admissionNumber}
                </div>
                <div className="mt-2 flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>You <strong>must</strong> enter the exact Admission Number above as the Account Number. If incorrect, the transaction will fail and your money will not be deducted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentFeeBalances;
