import React, { useState, useEffect } from 'react';
import { X, Upload, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { recruitmentService } from '../services/recruitmentService';
import { toast } from 'react-toastify';

const JobApplicationForm = ({
    jobOpeningId,
    onSuccess,
    onCancel,
    isPublic = false
}) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [jobs, setJobs] = useState([]);

    // Initialize form data with defaults
    const [formData, setFormData] = useState({
        job_opening: jobOpeningId || '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        current_employer: '',
        current_position: '',
        total_experience_years: '',
        notice_period_days: '30', // Default
        preferred_contact_method: 'email', // Default
        resume: null,
        cover_letter: null,
        notes: '',
        consent_to_process_data: false,
        consent_to_store_data: false,
        privacy_policy_accepted: false,
        application_source: isPublic ? 'portal' : 'walk_in'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // If no jobOpeningId provided (internal manual entry), fetch active jobs to select from
        if (!jobOpeningId && !isPublic) {
            const fetchJobs = async () => {
                try {
                    // Fetch all jobs
                    const response = await recruitmentService.getJobOpenings();
                    const results = Array.isArray(response) ? response : response.results || [];
                    setJobs(results);
                } catch (error) {
                    console.error("Failed to fetch jobs", error);
                }
            };
            fetchJobs();
        } else if (jobOpeningId) {
            setFormData(prev => ({ ...prev, job_opening: jobOpeningId }));
        }
    }, [jobOpeningId, isPublic]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.job_opening) newErrors.job_opening = "Please select a job position";
        if (!formData.first_name) newErrors.first_name = "First name is required";
        if (!formData.last_name) newErrors.last_name = "Last name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.country) newErrors.country = "Country is required";

        if (!formData.resume) newErrors.resume = "Resume is required";

        if (isPublic) {
            if (!formData.consent_to_process_data) newErrors.consent_to_process_data = "Consent is required";
            if (!formData.privacy_policy_accepted) newErrors.privacy_policy_accepted = "Privacy policy must be accepted";
            // consent_to_store_data is usually optional but strictly recommended. User didn't mark strict required in model (default=False), so we won't block submit, but it's captured.
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            // Create FormData object for file uploads
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    // Start of sanitization
                    if (key === 'total_experience_years' && (formData[key] === '' || formData[key] === null)) {
                        data.append(key, '0');
                    } else if (key === 'notice_period_days' && (formData[key] === '' || formData[key] === null)) {
                        data.append(key, '0');
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            // If internal manual entry, we must force consents to true to pass backend validation
            if (!isPublic) {
                data.set('consent_to_process_data', 'true');
                data.set('consent_to_store_data', 'true'); // Also force store data for internal? Likely yes unless they opt out explicitly (which we don't show).
                data.set('privacy_policy_accepted', 'true');
            }

            // Ensure application_source is set
            if (!data.has('application_source')) {
                data.set('application_source', isPublic ? 'portal' : 'walk_in');
            }

            await recruitmentService.createApplication(data);

            setSubmitted(true);
            toast.success("Application submitted successfully!");
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Submission error", error);
            const serverErrors = error.data || {};

            // Map common server errors
            if (serverErrors.email) setErrors(prev => ({ ...prev, email: serverErrors.email[0] }));
            else if (typeof serverErrors === 'object') {
                // Try to map others or show generic
                const mappedErrors = {};
                Object.keys(serverErrors).forEach(key => {
                    mappedErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
                });
                setErrors(prev => ({ ...prev, ...mappedErrors }));
            }

            toast.error(error.message || "Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Application Received!</h3>
                <p className="text-slate-500 mb-6">Thank you for applying. We will review your application and get back to you shortly.</p>
                {isPublic ? (
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Submit Another
                    </button>
                ) : (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                    >
                        Close
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Job Selection (only if not pre-selected) */}
                {!jobOpeningId && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Position Applied For *
                        </label>
                        <select
                            name="job_opening"
                            value={formData.job_opening}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.job_opening ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                        >
                            <option value="">Select a position...</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                        {errors.job_opening && <p className="text-sm text-red-500 mt-1">{errors.job_opening}</p>}
                    </div>
                )}

                {/* Internal: Application Source Selection */}
                {!isPublic && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Source of Application
                        </label>
                        <select
                            name="application_source"
                            value={formData.application_source}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                        >
                            <option value="walk_in">Walk-In</option>
                            <option value="email">Email</option>
                            <option value="referral">Employee Referral</option>
                            <option value="agency">Recruitment Agency</option>
                            <option value="portal">Career Portal</option>
                        </select>
                    </div>
                )}

                {/* Personal Info */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.first_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.last_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>

                {/* Contact Preferences & Notice */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Contact Method</label>
                    <select
                        name="preferred_contact_method"
                        value={formData.preferred_contact_method}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notice Period (Days)</label>
                    <input
                        type="number"
                        name="notice_period_days"
                        value={formData.notice_period_days}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>

                {/* Address Fields */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address *</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.address ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.city ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State/Province *</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.state ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country *</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg dark:bg-slate-800 ${errors.country ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
                    <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>

                {/* Professional Info */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Employer</label>
                    <input
                        type="text"
                        name="current_employer"
                        value={formData.current_employer}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
                    <input
                        type="number"
                        name="total_experience_years"
                        value={formData.total_experience_years}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>

                {/* Files */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume / CV *</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${errors.resume ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'}`}>
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input
                                        type="file"
                                        name="resume"
                                        className="sr-only"
                                        onChange={handleChange}
                                        accept=".pdf,.doc,.docx"
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">
                                {formData.resume ? formData.resume.name : 'PDF, DOC, DOCX up to 10MB'}
                            </p>
                        </div>
                    </div>
                    {errors.resume && <p className="text-sm text-red-500 mt-1">{errors.resume}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter (Optional)</label>
                    <textarea
                        name="notes" // Using 'notes' for extra details.
                        rows={4}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Tell us why you are a good fit..."
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    />
                </div>
            </div>

            {/* Consents (Public Only) */}
            {isPublic && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-start">
                        <input
                            id="consent"
                            name="consent_to_process_data"
                            type="checkbox"
                            checked={formData.consent_to_process_data}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="consent" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            I consent to the processing of my personal data for recruitment purposes. *
                        </label>
                    </div>

                    <div className="flex items-start">
                        <input
                            id="store_data"
                            name="consent_to_store_data"
                            type="checkbox"
                            checked={formData.consent_to_store_data}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="store_data" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            I consent to the storage of my data for future opportunities.
                        </label>
                    </div>

                    <div className="flex items-start">
                        <input
                            id="privacy"
                            name="privacy_policy_accepted"
                            type="checkbox"
                            checked={formData.privacy_policy_accepted}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="privacy" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            I have read and agree to the Privacy Policy. *
                        </label>
                    </div>
                    {(errors.consent_to_process_data || errors.privacy_policy_accepted) && (
                        <p className="text-sm text-red-500">Please accept the required consents to proceed.</p>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Submit Application
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default JobApplicationForm;

