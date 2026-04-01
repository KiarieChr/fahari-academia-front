import React, { useState, useMemo } from 'react';

const AdminNumberSetupModal = ({ isOpen, onClose }) => {
  const [prefix, setPrefix] = useState('SCH');
  const [yearFormat, setYearFormat] = useState('YYYY');
  const [seqLen, setSeqLen] = useState(4);
  const [sep, setSep] = useState('/');
  const [autoInc, setAutoInc] = useState(true);
  const [resetYear, setResetYear] = useState(true);

  const preview = useMemo(() => {
    const year = yearFormat === 'YYYY' ? new Date().getFullYear().toString() : new Date().getFullYear().toString().slice(2);
    const seq = String(1).padStart(seqLen, '0');
    return `${prefix}${sep}${year}${sep}${seq}`;
  }, [prefix, yearFormat, seqLen, sep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Admission Number Format</h3>
            <p className="text-[0.8rem] text-gray-400 mt-0.5">Configure the auto-generated student ID pattern</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-gray-400 text-lg">&times;</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prefix</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year Format</label>
              <select value={yearFormat} onChange={(e) => setYearFormat(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-white">
                <option value="YYYY">YYYY</option>
                <option value="YY">YY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sequence Length</label>
              <input type="number" min={1} value={seqLen} onChange={(e) => setSeqLen(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Separator</label>
              <input value={sep} onChange={(e) => setSep(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-white" />
            </div>
          </div>

          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={autoInc} onChange={(e) => setAutoInc(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              Auto Increment
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={resetYear} onChange={(e) => setResetYear(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              Reset Per Academic Year
            </label>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Preview</p>
            <div className="font-mono text-base text-gray-800 tracking-wide">{preview}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">Cancel</button>
          <button onClick={() => { onClose(); }} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">Save Format</button>
        </div>
      </div>
    </div>
  );
};

export default AdminNumberSetupModal;
