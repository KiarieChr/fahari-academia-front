import React from 'react';
import { Phone, Mail } from 'lucide-react';

const TeacherRemarks = ({ showProfile }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <div className="border border-slate-300 rounded-lg p-5 h-full">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Class Teacher's Remarks</h4>
                    <p className="font-serif italic text-slate-800 leading-relaxed">
                        "Alex has shown remarkable improvement this term, particularly in Mathematics and Sciences.
                        He is a disciplined student who engages well with his peers. I encourage him to continue reading widely
                        to improve his language expression."
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase">Closing Status:</span>
                        <span className="ml-2 font-bold text-emerald-600 text-sm">Promoted to Grade 5</span>
                    </div>
                </div>
            </div>

            {showProfile && (
                <div className="md:col-span-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 h-full flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                            MR
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Mr. Robert K.</h4>
                        <p className="text-xs text-slate-500 mb-4">Class Teacher - Grade 4 East</p>

                        <div className="flex flex-col gap-2 text-xs text-slate-600">
                            <div className="flex items-center justify-center gap-2">
                                <Phone size={12} /> +254 712 345 678
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Mail size={12} /> robert.k@school.com
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherRemarks;
