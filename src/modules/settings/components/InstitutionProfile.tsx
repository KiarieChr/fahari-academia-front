import React, { useState, useEffect, useRef } from 'react';
import {
    Save, Upload, Building2, Mail, Phone, Loader2,
    Globe, MapPin, Palette, PenTool, Stamp, X, Trash2, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import institutionService from '../../../services/institutionService';
import ContentLoader from '../../../components/common/ContentLoader';

const inputClass = 'w-full px-4 py-3 bg-gray-50/80 rounded-xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-200 outline-none text-sm transition-all text-slate-700 placeholder-slate-400';
const labelClass = 'text-[13px] font-bold text-slate-600 block mb-2 tracking-wide ml-1';

const neoCardClass = 'bg-[#f8f9fa] rounded-3xl shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] border border-white p-6 space-y-6';

const INSTITUTION_TYPES = [
    { value: 'lower_primary', label: 'Lower Primary' },
    { value: 'upper_primary', label: 'Upper Primary' },
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'mixed', label: 'Mixed (Primary & Secondary)' },
    { value: 'tertiary', label: 'Tertiary College' },
    { value: 'university', label: 'University' },
    { value: 'tvet', label: 'TVET Institution' },
];

// ── Signature Canvas Component ───────────────────────────────────────────────
const SignatureCanvas = ({ onSave }) => {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [hasStrokes, setHasStrokes] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const source = e.touches ? e.touches[0] : e;
        return {
            x: (source.clientX - rect.left) * (canvasRef.current.width / rect.width),
            y: (source.clientY - rect.top) * (canvasRef.current.height / rect.height),
        };
    };

    const startDraw = (e) => {
        e.preventDefault();
        setDrawing(true);
        setHasStrokes(true);
        const pos = getPos(e);
        lastPos.current = pos;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!drawing) return;
        const ctx = canvasRef.current.getContext('2d');
        const pos = getPos(e);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        lastPos.current = pos;
    };

    const stopDraw = (e) => {
        if (e) e.preventDefault();
        setDrawing(false);
    };

    const clear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasStrokes(false);
    };

    const save = () => {
        canvasRef.current.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'signature.png', { type: 'image/png' });
            onSave(file, URL.createObjectURL(blob));
        }, 'image/png');
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={480}
                    height={160}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/80 cursor-crosshair touch-none hover:border-indigo-300 transition-colors"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
                {!hasStrokes && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-gray-400 font-medium select-none">Draw your signature here</p>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <X size={13} /> Clear
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={!hasStrokes}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <CheckCircle size={13} /> Save Signature
                </button>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const InstitutionProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Logos / images state
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [stampPreview, setStampPreview] = useState(null);
    const [stampFile, setStampFile] = useState(null);

    // Signature panel tab
    const [sigTab, setSigTab] = useState('draw'); // 'draw' | 'upload'

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await institutionService.getProfile();
            const data = res.data || res;
            setProfile(data);
            if (data.logo) setLogoPreview(data.logo);
            if (data.signature_image) setSignaturePreview(data.signature_image);
            if (data.stamp_image) setStampPreview(data.stamp_image);
        } catch (error) {
            console.error('Failed to load institution profile:', error);
            toast.error('Failed to load institution profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) { toast.error('Signature image must be under 1MB'); return; }
        setSignatureFile(file);
        setSignaturePreview(URL.createObjectURL(file));
    };

    const handleSignatureDrawSave = (file, previewUrl) => {
        setSignatureFile(file);
        setSignaturePreview(previewUrl);
        toast.success('Signature drawn — click "Save Changes" to apply');
    };

    const clearSignature = () => { setSignatureFile(null); setSignaturePreview(null); handleChange('signature_image', null); };

    const handleStampUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) { toast.error('Stamp image must be under 1MB'); return; }
        setStampFile(file);
        setStampPreview(URL.createObjectURL(file));
    };

    const clearStamp = () => { setStampFile(null); setStampPreview(null); handleChange('stamp_image', null); };

    const uploadImageField = async (file, fieldName) => {
        const fd = new FormData();
        fd.append(fieldName, file);
        await institutionService.updateProfile(fd);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (logoFile) { await institutionService.uploadLogo(logoFile); setLogoFile(null); }
            if (signatureFile) { await uploadImageField(signatureFile, 'signature_image'); setSignatureFile(null); }
            if (stampFile) { await uploadImageField(stampFile, 'stamp_image'); setStampFile(null); }

            const { logo, signature_image, stamp_image, id, ...data } = profile;
            if (data.established_date === '') data.established_date = null;
            if (data.website === '') data.website = null;
            if (data.portal_url === '') data.portal_url = null;
            if (data.email === '') data.email = null;

            await institutionService.updateProfile(data);
            toast.success('Institution profile saved');
        } catch (error) {
            console.error('Save failed:', error, error.data);
            const errData = error.data || error.response?.data;
            const msg = errData
                ? Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join(', ')
                : error.message || 'Failed to save profile';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <ContentLoader size="lg" message="Loading institution profile..." />
        </div>
    );

    if (!profile) return (
        <div className="text-center py-20">
            <Building2 className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">Could not load institution profile.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-300 p-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-indigo-800 drop-shadow-sm">Institution Profile</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Manage your school's identity, contacts, branding and document signing.</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-indigo-700 bg-[#f8f9fa] rounded-xl shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all disabled:opacity-50 border border-white">
                    {saving ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Save size={18} className="text-indigo-600" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-8">
                {/* ── Left Column ── */}
                <div className="space-y-8">

                    {/* Logo & Branding */}
                    <div className={neoCardClass}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Palette size={14} className="text-indigo-500" /> Branding
                        </h3>
                        <div className="text-center py-2">
                            <div className="w-36 h-36 mx-auto rounded-3xl border border-white shadow-[inset_4px_4px_10px_#e5e7eb,inset_-4px_-4px_10px_#ffffff] flex items-center justify-center overflow-hidden bg-gray-50/50 transition-all duration-300 group">
                                {logoPreview
                                    ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                    : <Building2 className="text-indigo-200 group-hover:text-indigo-400 transition-colors" size={48} />
                                }
                            </div>
                            <label className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-600 cursor-pointer font-bold bg-[#f8f9fa] shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] px-5 py-2.5 rounded-xl transition-all border border-white">
                                <Upload size={16} /> Upload Logo
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                            </label>
                            <p className="text-[11px] text-slate-400 mt-2 font-medium">PNG or JPG, max 2MB</p>
                        </div>
                        <div className="space-y-5 pt-4 border-t border-slate-100/50">
                            <div>
                                <label className={labelClass}>Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={profile.primary_color || '#4f46e5'}
                                        onChange={e => handleChange('primary_color', e.target.value)}
                                        className="w-12 h-12 rounded-xl border border-white shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] cursor-pointer p-1 bg-[#f8f9fa]" />
                                    <input type="text" value={profile.primary_color || '#4f46e5'}
                                        onChange={e => handleChange('primary_color', e.target.value)}
                                        className={inputClass + ' flex-1 font-mono uppercase text-slate-600'} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Secondary Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={profile.secondary_color || '#f59e0b'}
                                        onChange={e => handleChange('secondary_color', e.target.value)}
                                        className="w-12 h-12 rounded-xl border border-white shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] cursor-pointer p-1 bg-[#f8f9fa]" />
                                    <input type="text" value={profile.secondary_color || '#f59e0b'}
                                        onChange={e => handleChange('secondary_color', e.target.value)}
                                        className={inputClass + ' flex-1'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Document Signing Card ── */}
                    <div className={neoCardClass}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PenTool size={14} className="text-indigo-500" /> Document Signing
                        </h3>

                        {/* Principal Details */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Principal Details</p>
                            <div>
                                <label className={labelClass}>Principal / Head Name</label>
                                <input type="text" value={profile.principal_name || ''}
                                    onChange={e => handleChange('principal_name', e.target.value)}
                                    placeholder="e.g. Dr. Jane Wanjiru" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Title</label>
                                <input type="text" value={profile.principal_title || 'PRINCIPAL'}
                                    onChange={e => handleChange('principal_title', e.target.value)}
                                    placeholder="e.g. PRINCIPAL, HEAD TEACHER" className={inputClass} />
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Signature</p>
                                {signaturePreview && (
                                    <button type="button" onClick={clearSignature}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                                        <Trash2 size={11} /> Remove
                                    </button>
                                )}
                            </div>

                            {signaturePreview ? (
                                <div className="rounded-2xl border border-white shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] bg-[#f8f9fa] p-4 flex items-center justify-center">
                                    <img src={signaturePreview} alt="Signature" className="max-h-20 object-contain drop-shadow-sm opacity-80" />
                                </div>
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div className="flex rounded-xl p-1 bg-[#f8f9fa] shadow-[inset_3px_3px_6px_#e5e7eb,inset_-3px_-3px_6px_#ffffff] overflow-hidden text-xs font-bold border border-white/50">
                                        {['draw', 'upload'].map(tab => (
                                            <button key={tab} type="button"
                                                onClick={() => setSigTab(tab)}
                                                className={`flex-1 py-2.5 rounded-lg capitalize transition-all ${sigTab === tab ? 'bg-white text-indigo-700 shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff]' : 'text-slate-500 hover:text-slate-700'}`}>
                                                {tab === 'draw' ? '✍️ Draw' : '⬆️ Upload'}
                                            </button>
                                        ))}
                                    </div>

                                    {sigTab === 'draw' && (
                                        <SignatureCanvas onSave={handleSignatureDrawSave} />
                                    )}

                                    {sigTab === 'upload' && (
                                        <div className="pt-2">
                                            <label className="flex flex-col items-center gap-3 border border-white bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] rounded-2xl py-8 cursor-pointer hover:shadow-[inset_4px_4px_10px_#d1d5db,inset_-4px_-4px_10px_#ffffff] transition-all duration-300">
                                                <Upload size={24} className="text-indigo-400 drop-shadow-sm" />
                                                <span className="text-sm font-bold text-slate-500">Upload signature</span>
                                                <span className="text-xs text-slate-400 font-medium">PNG with transparent background recommended</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                                            </label>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Stamp */}
                        <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Stamp size={12} /> Official Stamp
                                </p>
                                {stampPreview && (
                                    <button type="button" onClick={clearStamp}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                                        <Trash2 size={11} /> Remove
                                    </button>
                                )}
                            </div>

                            {stampPreview ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full border border-white shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] overflow-hidden flex items-center justify-center bg-[#f8f9fa]">
                                        <img src={stampPreview} alt="Stamp" className="w-full h-full object-contain p-2 opacity-80" />
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        <p>Stamp preview</p>
                                        <p className="mt-1">PNG with transparent{'\n'}background works best</p>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center gap-3 border border-white bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] rounded-2xl py-8 cursor-pointer hover:shadow-[inset_4px_4px_10px_#d1d5db,inset_-4px_-4px_10px_#ffffff] transition-all duration-300">
                                    <Stamp size={24} className="text-indigo-400 drop-shadow-sm" />
                                    <span className="text-sm font-bold text-slate-500">Upload stamp image</span>
                                    <span className="text-xs text-slate-400 font-medium">PNG with transparent background</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                                </label>
                            )}
                        </div>

                        <div className="bg-transparent rounded-xl p-2 flex items-start gap-3">
                            <PenTool size={16} className="text-indigo-400/70 mt-0.5" />
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                The signature and stamp will appear on all generated school letters (Admission Letter, Offer Letter, Registration Confirmation).
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="lg:col-span-2 space-y-8 p-3">
                    {/* Basic Information */}
                    <div className={neoCardClass}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                            <Building2 size={14} className="text-indigo-500" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Institution Name *</label>
                                <input type="text" value={profile.name || ''}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder="e.g. Fahari Academia" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Short Name / Abbreviation</label>
                                <input type="text" value={profile.short_name || ''}
                                    onChange={e => handleChange('short_name', e.target.value)}
                                    placeholder="e.g. FA" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Institution Type</label>
                                <select value={profile.institution_type || ''}
                                    onChange={e => handleChange('institution_type', e.target.value)}
                                    className={inputClass}>
                                    <option value="">Select Type</option>
                                    {INSTITUTION_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Registration Number</label>
                                <input type="text" value={profile.registration_number || ''}
                                    onChange={e => handleChange('registration_number', e.target.value)}
                                    placeholder="e.g. REG/2024/001" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Established Date</label>
                                <input type="date" value={profile.established_date || ''}
                                    onChange={e => handleChange('established_date', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Motto</label>
                                <input type="text" value={profile.motto || ''}
                                    onChange={e => handleChange('motto', e.target.value)}
                                    placeholder="e.g. Excellence in Education" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Digital */}
                    <div className={neoCardClass}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                            <Mail size={14} className="text-indigo-500" /> Contact & Digital
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}><Mail size={12} className="inline mr-1" />Email</label>
                                <input type="email" value={profile.email || ''}
                                    onChange={e => handleChange('email', e.target.value)}
                                    placeholder="info@school.ac.ke" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}><Phone size={12} className="inline mr-1" />Phone</label>
                                <input type="text" value={profile.phone || ''}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    placeholder="+254 700 000 000" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}><Globe size={12} className="inline mr-1" />Website</label>
                                <input type="url" value={profile.website || ''}
                                    onChange={e => handleChange('website', e.target.value)}
                                    placeholder="https://school.ac.ke" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}><Globe size={12} className="inline mr-1" />Portal URL</label>
                                <input type="url" value={profile.portal_url || ''}
                                    onChange={e => handleChange('portal_url', e.target.value)}
                                    placeholder="https://portal.school.ac.ke" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className={neoCardClass}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                            <MapPin size={14} className="text-indigo-500" /> Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address Line 1</label>
                                <input type="text" value={profile.address_line_1 || ''}
                                    onChange={e => handleChange('address_line_1', e.target.value)}
                                    placeholder="Street address" className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address Line 2</label>
                                <input type="text" value={profile.address_line_2 || ''}
                                    onChange={e => handleChange('address_line_2', e.target.value)}
                                    placeholder="Building, floor, etc." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>City / Town</label>
                                <input type="text" value={profile.city || ''}
                                    onChange={e => handleChange('city', e.target.value)}
                                    placeholder="e.g. Nairobi" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>County</label>
                                <input type="text" value={profile.county || ''}
                                    onChange={e => handleChange('county', e.target.value)}
                                    placeholder="e.g. Nairobi County" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Postal Code</label>
                                <input type="text" value={profile.postal_code || ''}
                                    onChange={e => handleChange('postal_code', e.target.value)}
                                    placeholder="e.g. 00100" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Country</label>
                                <input type="text" value={profile.country || 'Kenya'}
                                    onChange={e => handleChange('country', e.target.value)}
                                    className={inputClass} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstitutionProfile;
