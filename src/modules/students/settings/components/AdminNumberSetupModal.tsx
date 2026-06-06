import React, { useState, useMemo } from 'react';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admission Number Format"
      subtitle="Configure the auto-generated student ID pattern"
      footer={
        <>
          <Modal.CancelButton onClick={onClose} />
          <Modal.SubmitButton onClick={() => { onClose(); }}>Save Format</Modal.SubmitButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Prefix</label>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Year Format</label>
            <select value={yearFormat} onChange={(e) => setYearFormat(e.target.value)} className={inputClass}>
              <option value="YYYY">YYYY</option>
              <option value="YY">YY</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Sequence Length</label>
            <input type="number" min={1} value={seqLen} onChange={(e) => setSeqLen(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Separator</label>
            <input value={sep} onChange={(e) => setSep(e.target.value)} className={inputClass} />
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
    </Modal>
  );
};

export default AdminNumberSetupModal;
