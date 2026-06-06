import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Save, CheckCircle, Loader2, FileText, X } from 'lucide-react';
import { recruitmentService } from '../services/recruitmentService';
import { toast } from 'react-toastify';
import { isDeadlineExpired } from '../utils/deadlineUtils';

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
    switch (name) {
        case 'first_name':
        case 'last_name':
            return value && value.trim() ? null : 'This field is required.';
        case 'email':
            if (!value || !value.trim()) return 'Email is required.';
            return EMAIL_RE.test(value) ? null : 'Please enter a valid email address.';
        case 'phone':
            return value && value.trim() ? null : 'Phone number is required.';
        case 'address':
            return value && value.trim() ? null : 'Address is required.';
        case 'city':
            return value && value.trim() ? null : 'City is required.';
        case 'state':
            return value && value.trim() ? null : 'State / Province is required.';
        case 'country':
            return value && value.trim() ? null : 'Country is required.';
        case 'resume':
            return value ? null : 'Resume is required.';
        case 'consent_to_process_data':
            return value ? null : 'You must consent to data processing to continue.';
        case 'privacy_policy_accepted':
            return value ? null : 'You must accept the privacy policy to continue.';
        default:
            return null;
    }
}

const REQUIRED_FIELDS = [
    'first_name', 'last_name', 'email', 'phone',
    'address', 'city', 'state', 'country', 'resume',
];
const PUBLIC_REQUIRED = [...REQUIRED_FIELDS, 'consent_to_process_data', 'privacy_policy_accepted'];

/* ─── FieldInput ────────────────────────────────────────────────────────────── */
const FieldInput = ({ label, name, type = 'text', value, onChange, onBlur, error, touched, valid, required, ...rest }) => {
    const borderCls = error && touched
        ? 'border-red-400 focus:ring-red-300'
        : valid && touched
            ? 'border-green-400 focus:ring-green-200'
            : 'border-slate-300 focus:ring-blue-200';

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${borderCls}`}
                    {...rest}
                />
                {touched && valid && (
                    <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                )}
            </div>
            {error && touched && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

/* ─── FileDropZone ──────────────────────────────────────────────────────────── */
const FileDropZone = ({ name, label, accept, required, file, onChange, error, touched }) => {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const handle = (f) => {
        if (!f) return;
        const synth = { target: { name, type: 'file', files: [f] } };
        onChange(synth);
    };

    const onDrop = (e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); };
    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const borderCls = error && touched
        ? 'border-red-400 bg-red-50'
        : dragging
            ? 'border-blue-500 bg-blue-50'
            : file
                ? 'border-green-400 bg-green-50'
                : 'border-slate-300 hover:border-slate-400';

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                role="button"
                tabIndex={0}
                aria-label={`Upload ${label}`}
                className={`mt-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${borderCls}`}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                {file ? (
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                        <FileText size={24} className="text-green-500" />
                        <span className="font-medium truncate max-w-xs">{file.name}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange({ target: { name, type: 'file', files: [] } }); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            aria-label="Remove file"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="h-10 w-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                            {' '}or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX up to 10 MB</p>
                    </>
                )}
            </div>
            <input ref={inputRef} type="file" name={name} className="sr-only" onChange={onChange} accept={accept} />
            {error && touched && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

/* ─── Success State ─────────────────────────────────────────────────────────── */
const SuccessPanel = ({ isPublic, onClose }) => (
    <div className="text-center py-12 px-4">
        <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6"
            style={{ animation: 'scaleIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both' }}
        >
            <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-2">
            Thank you for applying. We will review your application and contact you via email.
        </p>
        <p className="text-xs text-slate-400 mb-8">Check your inbox for a confirmation.</p>
        {isPublic ? (
            <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                Submit Another Application
            </button>
        ) : (
            <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors text-sm"
            >
                Close
            </button>
        )}
        <style>{`
            @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
    </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */
const JobApplicationForm = ({
    jobOpeningId,
    onSuccess,
    onCancel,
    isPublic = false,
    closingDate,
    onDeadlineExpired,
}) => {
    const formRef  = useRef(null);
    const [loading, setLoading]     = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [jobs, setJobs]           = useState([]);

    const [formData, setFormData] = useState({
        job_opening:               jobOpeningId || '',
        first_name:                '',
        last_name:                 '',
        email:                     '',
        phone:                     '',
        address:                   '',
        city:                      '',
        state:                     '',
        country:                   '',
        postal_code:               '',
        current_employer:          '',
        current_position:          '',
        total_experience_years:    '',
        notice_period_days:        '30',
        preferred_contact_method:  'email',
        resume:                    null,
        cover_letter:              null,
        notes:                     '',
        consent_to_process_data:   false,
        consent_to_store_data:     false,
        privacy_policy_accepted:   false,
        application_source:        isPublic ? 'portal' : 'walk_in',
    });

    const [errors,  setErrors]  = useState({});
    const [touched, setTouched] = useState({});

    /* Fetch jobs for internal unbound form */
    useEffect(() => {
        if (!jobOpeningId && !isPublic) {
            recruitmentService.getJobOpenings()
                .then(r => setJobs(Array.isArray(r) ? r : r.results || []))
                .catch(() => {});
        } else if (jobOpeningId) {
            setFormData(p => ({ ...p, job_opening: jobOpeningId }));
        }
    }, [jobOpeningId, isPublic]);

    /* ── onChange ── */
    const handleChange = useCallback((e) => {
        const { name, value, type, checked, files } = e.target;
        let next;
        if (type === 'file') {
            next = files && files[0] ? files[0] : null;
        } else if (type === 'checkbox') {
            next = checked;
        } else {
            next = value;
        }

        setFormData(p => ({ ...p, [name]: next }));
        setTouched(p => ({ ...p, [name]: true }));
        setErrors(p  => ({ ...p, [name]: validateField(name, next) }));
    }, []);

    /* ── onBlur ── */
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(p => ({ ...p, [name]: true }));
        setErrors(p  => ({ ...p, [name]: validateField(name, value) }));
    }, []);

    /* ── Full validation before submit ── */
    const validateAll = useCallback(() => {
        const required = isPublic ? PUBLIC_REQUIRED : REQUIRED_FIELDS;
        const newErrors  = {};
        const newTouched = {};

        required.forEach(name => {
            newTouched[name] = true;
            const err = validateField(name, formData[name] ?? '');
            if (err) newErrors[name] = err;
        });

        setTouched(p => ({ ...p, ...newTouched }));
        setErrors(p  => ({ ...p, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    }, [formData, isPublic]);

    /* ── Scroll to first error ── */
    const scrollToFirstError = () => {
        if (!formRef.current) return;
        const el = formRef.current.querySelector('[data-error="true"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Client-side deadline re-check
        if (closingDate && isDeadlineExpired({ closing_date: closingDate })) {
            onDeadlineExpired?.();
            return;
        }

        if (!validateAll()) {
            setTimeout(scrollToFirstError, 50);
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val === null || val === undefined) return;
                if (key === 'total_experience_years' && val === '') { data.append(key, '0'); return; }
                if (key === 'notice_period_days'      && val === '') { data.append(key, '0'); return; }
                data.append(key, val);
            });

            if (!isPublic) {
                data.set('consent_to_process_data', 'true');
                data.set('consent_to_store_data',   'true');
                data.set('privacy_policy_accepted',  'true');
            }
            if (!data.has('application_source')) {
                data.set('application_source', isPublic ? 'portal' : 'walk_in');
            }

            await recruitmentService.createApplication(data);

            setSubmitted(true);
            toast.success('Application submitted successfully!');
            onSuccess?.();

        } catch (error) {
            console.error('Submission error', error);
            const serverErrors = error.data || {};

            // Server says deadline expired → show the expired state
            if (serverErrors.error === 'Application deadline has expired.') {
                onDeadlineExpired?.();
                return;
            }

            if (typeof serverErrors === 'object') {
                const mapped = {};
                Object.entries(serverErrors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : v;
                });
                setErrors(p => ({ ...p, ...mapped }));
                setTouched(p => {
                    const t = { ...p };
                    Object.keys(mapped).forEach(k => { t[k] = true; });
                    return t;
                });
                setTimeout(scrollToFirstError, 50);
            }

            toast.error(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Success view ── */
    if (submitted) return <SuccessPanel isPublic={isPublic} onClose={onCancel} />;

    /* ── Field-props helper ── */
    const fp = (name, required = false) => ({
        name,
        value:   formData[name],
        onChange: handleChange,
        onBlur:   handleBlur,
        error:    errors[name],
        touched:  touched[name],
        valid:    !errors[name] && !!formData[name],
        required,
    });

    const errAttr = (name) => errors[name] && touched[name] ? 'true' : 'false';

    /* ────────────────────────────────────────────────────────────────────────── */
    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Progress indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    1
                </span>
                <span className="font-medium text-slate-700">Application Details</span>
                <span className="text-slate-300 mx-1">—</span>
                <span>Step 1 of 1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Job selection (unbound internal use) */}
                {!jobOpeningId && (
                    <div className="md:col-span-2" data-error={errAttr('job_opening')}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Position Applied For <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="job_opening"
                            value={formData.job_opening}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2
                                ${errors.job_opening && touched.job_opening
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-slate-300 focus:ring-blue-200'}`}
                        >
                            <option value="">Select a position…</option>
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                        {errors.job_opening && touched.job_opening && (
                            <p className="text-xs text-red-500 mt-1">{errors.job_opening}</p>
                        )}
                    </div>
                )}

                {/* Application source (internal) */}
                {!isPublic && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Source of Application</label>
                        <select
                            name="application_source"
                            value={formData.application_source}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="walk_in">Walk-In</option>
                            <option value="email">Email</option>
                            <option value="referral">Employee Referral</option>
                            <option value="agency">Recruitment Agency</option>
                            <option value="portal">Career Portal</option>
                        </select>
                    </div>
                )}

                {/* Personal info */}
                <div data-error={errAttr('first_name')}>
                    <FieldInput label="First Name" {...fp('first_name', true)} />
                </div>
                <div data-error={errAttr('last_name')}>
                    <FieldInput label="Last Name" {...fp('last_name', true)} />
                </div>

                <div className="md:col-span-2" data-error={errAttr('email')}>
                    <FieldInput label="Email Address" type="email" {...fp('email', true)} />
                </div>

                <div data-error={errAttr('phone')}>
                    <FieldInput label="Phone Number" type="tel" {...fp('phone', true)} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Contact Method</label>
                    <select
                        name="preferred_contact_method"
                        value={formData.preferred_contact_method}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2" data-error={errAttr('address')}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors
                            ${errors.address && touched.address
                                ? 'border-red-400 focus:ring-red-300'
                                : !errors.address && touched.address && formData.address
                                    ? 'border-green-400 focus:ring-green-200'
                                    : 'border-slate-300 focus:ring-blue-200'}`}
                    />
                    {errors.address && touched.address && (
                        <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                    )}
                </div>

                <div data-error={errAttr('city')}>
                    <FieldInput label="City" {...fp('city', true)} />
                </div>
                <div data-error={errAttr('state')}>
                    <FieldInput label="State / Province" {...fp('state', true)} />
                </div>
                <div data-error={errAttr('country')}>
                    <FieldInput label="Country" {...fp('country', true)} />
                </div>
                <div>
                    <FieldInput label="Postal Code" {...fp('postal_code')} />
                </div>

                {/* Professional */}
                <div>
                    <FieldInput label="Current Employer" {...fp('current_employer')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                    <input
                        type="number"
                        name="total_experience_years"
                        value={formData.total_experience_years}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period (Days)</label>
                    <input
                        type="number"
                        name="notice_period_days"
                        value={formData.notice_period_days}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {/* Resume drag-and-drop */}
                <div data-error={errAttr('resume')} className="contents">
                    <FileDropZone
                        name="resume"
                        label="Resume / CV"
                        accept=".pdf,.doc,.docx"
                        required
                        file={formData.resume}
                        onChange={handleChange}
                        error={errors.resume}
                        touched={touched.resume}
                    />
                </div>

                {/* Cover letter textarea */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cover Letter{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        name="notes"
                        rows={5}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Tell us why you are a great fit for this role…"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                    />
                </div>
            </div>

            {/* Consents — public only */}
            {isPublic && (
                <div className="space-y-3 bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Privacy &amp; Consents
                    </p>
                    {[
                        {
                            id: 'consent_to_process_data',
                            name: 'consent_to_process_data',
                            label: 'I consent to the processing of my personal data for recruitment purposes.',
                            required: true,
                        },
                        {
                            id: 'consent_to_store_data',
                            name: 'consent_to_store_data',
                            label: 'I consent to the storage of my data for future opportunities.',
                            required: false,
                        },
                        {
                            id: 'privacy_policy_accepted',
                            name: 'privacy_policy_accepted',
                            label: 'I have read and agree to the Privacy Policy.',
                            required: true,
                        },
                    ].map(({ id, name, label, required }) => (
                        <div key={id} className="flex items-start gap-2" data-error={errAttr(name)}>
                            <input
                                id={id}
                                name={name}
                                type="checkbox"
                                checked={formData[name]}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer leading-snug">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                        </div>
                    ))}
                    {(errors.consent_to_process_data || errors.privacy_policy_accepted) &&
                        (touched.consent_to_process_data || touched.privacy_policy_accepted) && (
                            <p className="text-xs text-red-500 pt-1">
                                Please accept the required consents to proceed.
                            </p>
                        )}
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg
                               hover:bg-blue-700 active:bg-blue-800 transition-colors
                               disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting…
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Submit Application
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default JobApplicationForm;
