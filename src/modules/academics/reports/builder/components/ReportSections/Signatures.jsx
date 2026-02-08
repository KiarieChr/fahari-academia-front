import React from 'react';

const Signatures = () => {
    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
                <div className="border-b border-slate-400 mb-2 h-10 flex items-end justify-center">
                    <span className="font-script text-2xl text-blue-900 opacity-80 rotate-[-5deg] block">Robert K.</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500">Class Teacher Signature</span>
            </div>

            <div className="text-center">
                <div className="border-b border-slate-400 mb-2 h-10 flex items-end justify-center">
                    <span className="font-script text-2xl text-slate-900 opacity-80 block">Principal M.</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500">Head Teacher Signature</span>
            </div>

            <div className="text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 border-double border-4 border-blue-900 rounded-full flex items-center justify-center opacity-20 rotate-12 pointer-events-none">
                    <span className="font-bold text-[8px] text-center leading-tight uppercase text-blue-900">
                        Fahari Academy<br />Official<br />Stamp
                    </span>
                </div>
                <div className="border-b border-slate-400 mb-2 h-10"></div>
                <span className="text-xs font-bold uppercase text-slate-500">Date & Stamp</span>
            </div>
        </div>
    );
};

export default Signatures;
