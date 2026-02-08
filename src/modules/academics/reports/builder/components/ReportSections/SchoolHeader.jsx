import React from 'react';

const SchoolHeader = () => {
    return (
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs text-center p-2">
                    LOGO
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-wide">Fahari Academy</h1>
                    <p className="text-sm font-serif italic text-slate-600">"Excellence in Everything"</p>
                </div>
            </div>

            <div className="text-right text-xs font-medium text-slate-600 space-y-1">
                <p>P.O. Box 12345 - 00100</p>
                <p>Nairobi, Kenya</p>
                <p>+254 700 000 000</p>
                <p>info@fahariacademy.com</p>
            </div>
        </div>
    );
};

export default SchoolHeader;
