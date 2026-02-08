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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold">Admission Number Format</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Prefix</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Year Format</label>
              <select value={yearFormat} onChange={(e) => setYearFormat(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50">
                <option value="YYYY">YYYY</option>
                <option value="YY">YY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Sequence Length</label>
              <input type="number" min={1} value={seqLen} onChange={(e) => setSeqLen(Number(e.target.value))} className="w-full p-2.5 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Separator</label>
              <input value={sep} onChange={(e) => setSep(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={autoInc} onChange={(e) => setAutoInc(e.target.checked)} /> Auto Increment</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={resetYear} onChange={(e) => setResetYear(e.target.checked)} /> Reset Per Academic Year</label>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Preview</p>
            <div className="mt-2 font-mono text-sm text-gray-800">{preview}</div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg">Cancel</button>
            <button onClick={() => { /* TODO: call API to save settings */ onClose(); }} className="px-4 py-2 bg-indigo-600 text-black rounded-lg">Save Format</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNumberSetupModal;
