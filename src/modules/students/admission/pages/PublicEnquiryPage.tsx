import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    GraduationCap, CheckCircle, Mail, Phone, User, BookOpen, Building,
    Sparkles, ArrowRight, Loader2, AlertCircle, Home, Send, HelpCircle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../../../../services/api';

const PUBLIC_SOURCE_CHOICES = [
    { value: 'website', label: 'Website Form' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'email', label: 'Email Inquiry' },
    { value: 'phone', label: 'Phone Inquiry' },
    { value: 'other', label: 'Other / Advert' }
];

const PublicEnquiryPage = () => {
    const { intakeId } = useParams();
    const navigate = useNavigate();

    // Data dropdown options
    const [intakes, setIntakes] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [grades, setGrades] = useState([]);
    const [campuses, setCampuses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // Form inputs (Source is website by default, excluding Walk-in completely)
    const [formData, setFormData] = useState({
        full_name: '',
        child_name: '',
        phone_number: '',
        email: '',
        intake: '',
        curriculum: '',
        grade: '',
        campus: '',
        source: 'website',
        message: ''
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Publicly query basic settings metadata
                const [intakeRes, currRes, gradeRes, campusRes] = await Promise.allSettled([
                    api.get('/api/settings/intakes/'),
                    api.get('/api/settings/curricula/'),
                    api.get('/api/settings/classes/'),
                    api.get('/workforce/api/campuses/')
                ]);

                const intakesList = intakeRes.status === 'fulfilled' ? (intakeRes.value?.data || intakeRes.value || []) : [];
                const currList = currRes.status === 'fulfilled' ? (currRes.value?.data || currRes.value || []) : [];
                const gradeList = gradeRes.status === 'fulfilled' ? (gradeRes.value?.data || gradeRes.value || []) : [];
                
                let campusList = [];
                if (campusRes.status === 'fulfilled') {
                    const cData = campusRes.value?.data || campusRes.value;
                    campusList = Array.isArray(cData) ? cData : cData?.results || [];
                }

                setIntakes(intakesList);
                setCurriculums(currList);
                setGrades(gradeList);
                setCampuses(campusList);

                // If intakeId is passed in URL path, pre-select and seal it!
                if (intakeId) {
                    const matchedIntake = intakesList.find(i => String(i.id) === String(intakeId));
                    if (matchedIntake) {
                        setFormData(prev => ({ 
                            ...prev, 
                            intake: String(matchedIntake.id),
                            // Auto pre-fill default grade/curriculum from intake setup if configured
                            grade: matchedIntake.entry_grade ? String(matchedIntake.entry_grade) : ''
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to load enquiries setup filters:", err);
                toast.error("Unable to load registration parameters.");
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [intakeId]);

    // Handle auto-prefilling intake defaults
    useEffect(() => {
        if (!formData.intake || intakeId) return; // don't override manual URL setups
        const intake = intakes.find(i => String(i.id) === String(formData.intake));
        if (intake?.entry_grade) {
            const entryGrade = grades.find(g => Number(g.id) === Number(intake.entry_grade));
            if (entryGrade) {
                setFormData(prev => ({
                    ...prev,
                    grade: String(entryGrade.id),
                    curriculum: entryGrade.curriculum ? String(entryGrade.curriculum) : ''
                }));
            }
        }
    }, [formData.intake, intakes, grades, intakeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const tempErrors = {};
        if (!formData.full_name.trim()) tempErrors.full_name = 'Parent full name is required';
        if (!formData.phone_number.trim()) tempErrors.phone_number = 'Contact phone number is required';
        if (!formData.email.trim()) {
            tempErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Please input a valid email address';
        }
        if (!formData.intake) tempErrors.intake = 'Please choose a target Intake Cycle';
        if (!formData.curriculum) tempErrors.curriculum = 'Please choose a curriculum interest';
        if (!formData.grade) tempErrors.grade = 'Please choose applying Grade/Class';

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.warn('Please complete all required fields.');
            return;
        }

        setSubmitting(true);
        try {
            // submit enquiry payload publicly (since viewset is AllowAny on create)
            const payload = { ...formData };
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            await api.post('/api/student-management/enquiries/', payload);
            setSubmitted(true);
            toast.success('Your interest enquiry has been registered!');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to submit interest. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
                <Loader2 size={36} className="animate-spin text-indigo-500" />
                <p className="text-sm font-bold text-slate-400">Loading admissions portal info...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
            <ToastContainer position="top-right" autoClose={4000} />
            
            {/* Dynamic Glassmorphic Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full blur-[130px] bg-indigo-600/40 pointer-events-none mix-blend-screen animate-pulse duration-10000" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[150px] bg-fuchsia-600/30 pointer-events-none mix-blend-screen animate-pulse duration-[12000ms]" />
            <div className="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] rounded-full blur-[100px] bg-blue-500/30 pointer-events-none mix-blend-screen" />
            
            {/* Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 my-8">
                {/* ── Title / Header ── */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-indigo-600 rounded-3xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] mb-4 ring-4 ring-indigo-500/10 animate-bounce duration-[3000ms]">
                        <GraduationCap size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                        Admissions Interest Portal
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                        Expressed interest in our school curriculum? Submit your enquiry below, and our admissions team will contact you.
                    </p>
                </div>

                {/* ── Success view ── */}
                {submitted ? (
                    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 md:p-12 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] text-center space-y-6 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] relative z-10">
                            <CheckCircle size={40} className="animate-bounce" />
                        </div>
                        <div className="space-y-3 relative z-10">
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-none">Registration Received!</h3>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-sm mx-auto">
                                Thank you for your enquiry. Our admissions team will reach out to <span className="text-emerald-400 font-bold">{formData.email}</span> shortly.
                            </p>
                        </div>
                        
                        <div className="pt-6 border-t border-white/10 max-w-xs mx-auto relative z-10">
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105"
                            >
                                Submit another enquiry
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Form view ── */
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-6 md:p-10 rounded-[32px] space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 relative"
                    >
                        {/* Decorative inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[32px] pointer-events-none" />
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2 leading-none mb-4">
                                <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><User size={14} /></span>
                                1. Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Your Full Name (Parent/Guardian) *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl bg-white/5 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-sm ${errors.full_name ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10'}`}
                                    />
                                    {errors.full_name && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.full_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Child / Student's Name</label>
                                    <input
                                        type="text"
                                        name="child_name"
                                        value={formData.child_name}
                                        onChange={handleChange}
                                        placeholder="Kelvin Doe"
                                        className="w-full px-4 py-3.5 text-sm font-medium border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Mobile Phone Number *</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="e.g. +254 712 345678"
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl bg-white/5 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-sm ${errors.phone_number ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10'}`}
                                    />
                                    {errors.phone_number && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.phone_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="parent@example.com"
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl bg-white/5 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-sm ${errors.email ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10'}`}
                                    />
                                    {errors.email && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.email}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/10" />

                        {/* Academic target targets */}
                        <div className="space-y-4 pt-2 relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2 leading-none mb-4">
                                <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><BookOpen size={14} /></span>
                                2. Placement Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Target Intake Cycle *</label>
                                    <select
                                        name="intake"
                                        value={formData.intake}
                                        onChange={handleChange}
                                        disabled={!!intakeId}
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all ${intakeId ? 'bg-white/5 opacity-80 cursor-not-allowed border-indigo-400/30 text-indigo-200' : 'bg-white/5 focus:bg-slate-900 border-white/10 cursor-pointer backdrop-blur-sm'} ${errors.intake ? 'border-rose-400/50' : ''}`}
                                    >
                                        <option value="" className="bg-slate-900 text-slate-300">Choose Intake Cycle...</option>
                                        {intakes.map(i => (
                                            <option key={i.id} value={i.id} className="bg-slate-900">{i.name}</option>
                                        ))}
                                    </select>
                                    {errors.intake && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.intake}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Curriculum Interest *</label>
                                    <select
                                        name="curriculum"
                                        value={formData.curriculum}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer bg-white/5 focus:bg-slate-900 backdrop-blur-sm ${errors.curriculum ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10'}`}
                                    >
                                        <option value="" className="bg-slate-900 text-slate-300">Choose Curriculum...</option>
                                        {curriculums.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.curriculum && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.curriculum}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Grade / Class Level *</label>
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3.5 text-sm font-medium border rounded-xl text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer bg-white/5 focus:bg-slate-900 backdrop-blur-sm ${errors.grade ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10'}`}
                                    >
                                        <option value="" className="bg-slate-900 text-slate-300">Choose Class Level...</option>
                                        {grades
                                            .filter(g => !formData.curriculum || String(g.curriculum) === String(formData.curriculum))
                                            .map(g => (
                                                <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>
                                            ))}
                                    </select>
                                    {errors.grade && <p className="text-[10px] text-rose-400 mt-1.5 font-bold">{errors.grade}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Preferred Campus</label>
                                    <select
                                        name="campus"
                                        value={formData.campus}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 text-sm font-medium border border-white/10 rounded-xl text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer bg-white/5 focus:bg-slate-900 backdrop-blur-sm"
                                    >
                                        <option value="" className="bg-slate-900 text-slate-300">Choose Campus...</option>
                                        {campuses.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/10" />

                        {/* Additional notes */}
                        <div className="space-y-4 pt-2 relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2 leading-none mb-4">
                                <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><Sparkles size={14} /></span>
                                3. Discovery & Notes
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">How Did You Hear About Us? *</label>
                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 text-sm font-medium border border-white/10 rounded-xl text-white outline-none cursor-pointer bg-white/5 focus:bg-slate-900 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                                    >
                                        {PUBLIC_SOURCE_CHOICES.map(src => (
                                            <option key={src.value} value={src.value} className="bg-slate-900">{src.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">Enquiry message or comments (Optional)</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about specific queries, child's previous reports, co-curricular interests, etc."
                                    className="w-full px-4 py-3.5 text-sm font-medium border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-sm resize-y"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/10 flex justify-end relative z-10">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 cursor-pointer"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                <span>Submit Enquiry</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PublicEnquiryPage;
