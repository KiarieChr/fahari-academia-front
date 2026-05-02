import React, { useState, useEffect } from 'react';
import { Calendar, User, BookOpen, School, Phone, Users, Download, Image as ImageIcon } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import LazyImage from '../../../../components/common/LazyImage';
import { toast } from 'react-toastify';
import { institutionService } from '../../../../services/institutionService';
import { documentService } from '../../../../services/documentService';

const ApplicationDetailsModal = ({ app, onClose, onAdmit }) => {
    const [institution, setInstitution] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (app) {
            institutionService.getProfile().then(res => setInstitution(res.data || res)).catch(() => {});
        }
    }, [app]);

    const handleDownload = async (docType) => {
        try {
            setIsGenerating(true);
            await documentService.generateAndDownload(docType, app, institution || {});
        } catch (err) {
            toast.error('Failed to generate document');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!app) return null;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            size="lg"
            title={`${app.first_name} ${app.last_name}`}
            subtitle={`Application Reference: #${app.id}`}
            icon={User}
            footer={
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-3">
                        {app.application_status === 'accepted' && (
                            <>
                                <Modal.SubmitButton 
                                    onClick={() => handleDownload('offer_letter')}
                                    loading={isGenerating}
                                    className="!bg-indigo-50 !text-indigo-700 !shadow-none hover:!bg-indigo-100"
                                >
                                    <Download size={14} /> Offer Letter
                                </Modal.SubmitButton>
                                <Modal.SubmitButton 
                                    onClick={() => handleDownload('admission_letter')}
                                    loading={isGenerating}
                                    className="!bg-indigo-50 !text-indigo-700 !shadow-none hover:!bg-indigo-100"
                                >
                                    <Download size={14} /> Admission Letter
                                </Modal.SubmitButton>
                            </>
                        )}
                        {app.application_status === 'pending' && (
                            <Modal.SubmitButton 
                                onClick={() => onAdmit(app)}
                                className="!bg-emerald-500 hover:!bg-emerald-600 shadow-emerald-200"
                            >
                                <Check size={16} /> Admit Student Now
                            </Modal.SubmitButton>
                        )}
                    </div>
                    <Modal.CancelButton onClick={onClose} />
                </div>
            }
        >
            <div className="space-y-10">
                {/* Executive Summary Bar */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                app.application_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                app.application_status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {app.application_status}
                            </span>
                        </div>
                        <div className="w-px h-10 bg-slate-200" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied For</p>
                            <p className="text-sm font-bold text-slate-700">{app.grade_name || '-'}</p>
                        </div>
                    </div>
                    {app.score && (
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entry Score</p>
                            <p className="text-2xl font-black text-indigo-600 tabular-nums leading-none">{app.score}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Identity Profile */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <User size={14} className="text-indigo-500" />
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Profile</h3>
                        </div>
                        
                        <div className="relative group">
                            {app.passport_photo && (
                                <div className="mb-6 flex justify-center">
                                    <LazyImage
                                        src={app.passport_photo}
                                        alt={app.first_name}
                                        aspectRatio="aspect-square"
                                        className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                                    <p className="text-sm font-bold text-slate-700">{app.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Birth Date</p>
                                    <p className="text-sm font-bold text-slate-700">{app.dob || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application Date</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(app.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Intent */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <BookOpen size={14} className="text-indigo-500" />
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Intent</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <School size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Previous School</p>
                                    <p className="text-sm font-bold text-slate-700">{app.previous_school || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Curriculum</p>
                                    <p className="text-sm font-bold text-slate-700">{app.curriculum_name || 'Standard'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guardian Info */}
                    <div className="md:col-span-2 space-y-4 pt-4">
                        <div className="flex items-center gap-2 px-1">
                            <Users size={14} className="text-indigo-500" />
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Guardian Contact</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Parent</p>
                                <p className="text-sm font-bold text-slate-700">{app.guardian_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Phone size={12} className="text-slate-400" /> {app.guardian_phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-sm font-bold text-slate-700 truncate">{app.guardian_email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ApplicationDetailsModal;
