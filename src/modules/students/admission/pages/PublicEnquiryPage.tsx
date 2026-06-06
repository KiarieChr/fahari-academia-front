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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
            <ToastContainer position="top-right" autoClose={4000} />
            
            {/* Background design elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] bg-indigo-500/10 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[100px] bg-indigo-500/5 pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
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
                    <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-[32px] shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-black text-white leading-none">Thank you for your enquiry!</h3>
                            <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-sm mx-auto">
                                We have successfully received your details. A member of our admissions committee will reach out to you at <span className="text-indigo-400">{formData.email}</span> shortly.
                            </p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800/80 max-w-xs mx-auto">
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                                Submit another enquiry
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Form view ── */
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-slate-900/30 border border-slate-800/80 backdrop-blur-xl p-6 md:p-10 rounded-[32px] shadow-2xl space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                        {/* Parent Details section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 leading-none">
                                <User size={13} /> 1. Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Your Full Name (Parent/Guardian) *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-950/20 text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all ${errors.full_name ? 'border-rose-500' : 'border-slate-800'}`}
                                    />
                                    {errors.full_name && <p className="text-[10px] text-rose-500 mt-1">{errors.full_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Child / Student's Name</label>
                                    <input
                                        type="text"
                                        name="child_name"
                                        value={formData.child_name}
                                        onChange={handleChange}
                                        placeholder="Kelvin Doe"
                                        className="w-full px-4 py-3 text-xs font-bold border border-slate-800 rounded-xl bg-slate-950/20 text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mobile Phone Number *</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="e.g. +254 712 345678"
                                        className={`w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-950/20 text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all ${errors.phone_number ? 'border-rose-500' : 'border-slate-800'}`}
                                    />
                                    {errors.phone_number && <p className="text-[10px] text-rose-500 mt-1">{errors.phone_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="parent@example.com"
                                        className={`w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-950/20 text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all ${errors.email ? 'border-rose-500' : 'border-slate-800'}`}
                                    />
                                    {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Academic target targets */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 leading-none">
                                <BookOpen size={13} /> 2. Placement Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Target Intake Cycle *</label>
                                    <select
                                        name="intake"
                                        value={formData.intake}
                                        onChange={handleChange}
                                        disabled={!!intakeId}
                                        className={`w-full px-3 py-3 text-xs font-bold border rounded-xl text-white bg-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all ${intakeId ? 'opacity-75 cursor-not-allowed border-indigo-900' : 'border-slate-800 cursor-pointer'}`}
                                    >
                                        <option value="">Choose Intake Cycle...</option>
                                        {intakes.map(i => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        ))}
                                    </select>
                                    {errors.intake && <p className="text-[10px] text-rose-500 mt-1">{errors.intake}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Curriculum Interest *</label>
                                    <select
                                        name="curriculum"
                                        value={formData.curriculum}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-3 text-xs font-bold border rounded-xl text-white bg-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all cursor-pointer ${errors.curriculum ? 'border-rose-500' : 'border-slate-800'}`}
                                    >
                                        <option value="">Choose Curriculum...</option>
                                        {curriculums.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.curriculum && <p className="text-[10px] text-rose-500 mt-1">{errors.curriculum}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Grade / Class Level *</label>
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-3 text-xs font-bold border rounded-xl text-white bg-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all cursor-pointer ${errors.grade ? 'border-rose-500' : 'border-slate-800'}`}
                                    >
                                        <option value="">Choose Class Level...</option>
                                        {grades
                                            .filter(g => !formData.curriculum || String(g.curriculum) === String(formData.curriculum))
                                            .map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                    </select>
                                    {errors.grade && <p className="text-[10px] text-rose-500 mt-1">{errors.grade}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Preferred Campus</label>
                                    <select
                                        name="campus"
                                        value={formData.campus}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 text-xs font-bold border border-slate-800 rounded-xl text-white bg-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all cursor-pointer"
                                    >
                                        <option value="">Choose Campus...</option>
                                        {campuses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Additional notes */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 leading-none">
                                <Send size={13} /> 3. Discovery & Notes
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">How Did You Hear About Us? *</label>
                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 text-xs font-bold border border-slate-800 rounded-xl text-white bg-slate-900 outline-none cursor-pointer"
                                    >
                                        {PUBLIC_SOURCE_CHOICES.map(src => (
                                            <option key={src.value} value={src.value}>{src.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Enquiry message or comments (Optional)</label>
                                <textarea
                                    name="message"
                                    rows={3}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about specific queries, child's previous reports, co-curricular interests, etc."
                                    className="w-full px-4 py-3 text-xs font-bold border border-slate-800 rounded-xl bg-slate-950/20 text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10 hover:translate-y-[-1px] cursor-pointer"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                                Submit Enquiry
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PublicEnquiryPage;
