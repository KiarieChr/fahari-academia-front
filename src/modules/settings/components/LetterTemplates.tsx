import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, FileText, CheckCircle, Copy, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../../components/common/Button';
import institutionService from '../../../services/institutionService';

// Default templates just in case nothing is saved
const DEFAULT_OFFER_TEMPLATE = `
  <p>Dear <strong>{{guardian_name}}</strong>,</p>
  <p><br></p>
  <p><strong>RE: CONDITIONAL OFFER OF ADMISSION — {{student_name}}</strong></p>
  <p><br></p>
  <p>We are pleased to offer <strong>{{student_name}}</strong> a place at our institution in <strong>{{class_name}}</strong> for the <strong>{{intake_name}}</strong> intake.</p>
  <p><br></p>
  <p>This offer is conditional upon receipt of all required documents and the prescribed admission fee deposit by the deadline.</p>
  <p><br></p>
  <p><strong>Required Documents:</strong></p>
  <ul>
    <li>Certified copy of Birth Certificate</li>
    <li>Original Primary/Junior School Leaving Certificate</li>
    <li>4 recent passport-size photographs</li>
    <li>Medical examination form</li>
  </ul>
  <p><br></p>
  <p>Yours faithfully,</p>
`;

const DEFAULT_ADMISSION_TEMPLATE = `
  <p>Dear <strong>{{guardian_name}}</strong>,</p>
  <p><br></p>
  <p><strong>RE: ADMISSION OF {{student_name}} — {{class_name}}</strong></p>
  <p><br></p>
  <p>We are pleased to inform you that, following a careful review of the application submitted on behalf of <strong>{{student_name}}</strong>, the School Admissions Committee has resolved to <strong>offer admission</strong> for the <strong>{{intake_name}}</strong> intake.</p>
  <p><br></p>
  <p>The student has been assigned to <strong>{{class_name}}</strong> with Admission Number <strong>{{admission_number}}</strong>. Please retain this letter as it will be required during the reporting and registration process.</p>
  <p><br></p>
  <p>We look forward to welcoming {{student_name}} to the school family. For any enquiries, please do not hesitate to contact the school office.</p>
  <p><br></p>
  <p>Yours faithfully,</p>
`;

const MERGE_TAGS = [
    { tag: '{{student_name}}', desc: "Student's Full Name" },
    { tag: '{{guardian_name}}', desc: "Parent/Guardian's Name" },
    { tag: '{{admission_number}}', desc: "Admission/Application ID" },
    { tag: '{{class_name}}', desc: "Grade/Class Level" },
    { tag: '{{intake_name}}', desc: "Intake Cycle" },
    { tag: '{{date}}', desc: "Current Date" },
    { tag: '{{guardian_phone}}', desc: "Guardian's Phone" },
    { tag: '{{guardian_email}}', desc: "Guardian's Email" },
];

const LetterTemplates = () => {
    const [activeTab, setActiveTab] = useState('offer');
    
    const [templates, setTemplates] = useState({
        offer: DEFAULT_OFFER_TEMPLATE,
        admission: DEFAULT_ADMISSION_TEMPLATE,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedTag, setCopiedTag] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await institutionService.getProfile();
            const profile = res.data || res;
            setTemplates({
                offer: profile.offer_letter_template || DEFAULT_OFFER_TEMPLATE,
                admission: profile.admission_letter_template || DEFAULT_ADMISSION_TEMPLATE,
            });
        } catch (error) {
            console.error('Failed to fetch templates from DB:', error);
            toast.error('Failed to load templates.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditorChange = (content) => {
        setTemplates(prev => ({ ...prev, [activeTab]: content }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                offer_letter_template: templates.offer,
                admission_letter_template: templates.admission,
            };
            await institutionService.updateProfile(payload);
            toast.success(`${activeTab === 'offer' ? 'Offer' : 'Admission'} Letter template saved successfully!`);
        } catch (error) {
            console.error('Failed to save template:', error);
            toast.error('Failed to save template to the database.');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (tag) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(''), 2000);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Document Templates</h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">Customize the rich-text format for auto-generated letters.</p>
                </div>
                
                <Button 
                    variant="primary" 
                    icon={isSaving ? undefined : Save} 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-10 text-xs font-black uppercase tracking-wider"
                >
                    {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Editor Section */}
                
                <div className="flex-1 space-y-4">
                    {/* Tabs */}
                    <div className="flex neo-card p-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700 mb-2">
                        <button
                            onClick={() => setActiveTab('offer')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider  rounded-lg transition-all ${activeTab === 'offer' ? 'bg-white  dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <FileText size={14} /> Offer Letter
                        </button>
                        <button
                            onClick={() => setActiveTab('admission')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'admission' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <FileText size={14} /> Admission Letter
                        </button>
                    </div>

                    <div className="neo-card bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 flex gap-3">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                                <strong>Note:</strong> The letterhead (School Logo, Name, Address) and the footer (Signature, Stamp) are <strong>automatically appended</strong> to the printed document. You only need to design the <strong>body</strong> of the letter here.
                            </p>
                        </div>
                        
                        <div className="h-[500px] relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                                    <Loader className="animate-spin text-indigo-500" size={32} />
                                </div>
                            ) : null}
                            <ReactQuill 
                                theme="snow" 
                                value={templates[activeTab]} 
                                onChange={handleEditorChange}
                                modules={modules}
                                className="h-[458px] border-none custom-quill"
                            />
                        </div>
                    </div>
                </div>

                {/* Merge Tags Sidebar */}
                <div className="sm:w-full xl:w-100 lg:w-80 shrink-0">
                    <div className="neo-card p-5 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm sticky top-6">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">Dynamic Parameters</h3>
                        <p className="text-xs font-medium text-slate-500 mb-4">Click to copy a merge tag, then paste it into the editor.</p>
                        
                        <div className="space-y-2">
                            {MERGE_TAGS.map((mt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => copyToClipboard(mt.tag)}
                                    className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group text-left"
                                >
                                    <div>
                                        <div className="text-[11px] font-black font-mono text-indigo-600 dark:text-indigo-400 mb-0.5">{mt.tag}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mt.desc}</div>
                                    </div>
                                    {copiedTag === mt.tag ? (
                                        <CheckCircle size={14} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-quill .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid var(--border-color-light) !important;
                    background: var(--bg-light);
                    font-family: inherit;
                }
                .custom-quill .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: 14px;
                }
                .custom-quill .ql-editor {
                    padding: 24px;
                }
            `}} />
        </div>
    );
};

export default LetterTemplates;
