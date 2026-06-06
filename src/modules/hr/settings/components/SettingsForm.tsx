
import React from 'react';

// If not using headless UI, I'll implement a custom toggle or standard checkbox.
// For now, I'll implement a custom toggle button to avoid external deps if not confirmed.

const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        onClick={() => onChange(!enabled)}
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);

const SettingsForm = ({ fields = [] }) => {
    // Initialize state with default values to prevent uncontrolled inputs
    const [formValues, setFormValues] = React.useState(() => {
        const initial = {};
        if (Array.isArray(fields)) {
            fields.forEach(field => {
                initial[field.id] = field.value !== undefined ? field.value : '';
            });
        }
        return initial;
    });

    // Update state when fields prop changes
    React.useEffect(() => {
        if (Array.isArray(fields)) {
            setFormValues(prev => {
                const next = { ...prev };
                fields.forEach(field => {
                    // Only update if not already set or force sync if needed
                    // For now, we seed initial values.
                    if (next[field.id] === undefined) {
                        next[field.id] = field.value !== undefined ? field.value : '';
                    }
                });
                return next;
            });
        }
    }, [fields]);

    const handleChange = (id, value) => {
        setFormValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    if (!Array.isArray(fields)) {
        return <div className="p-4 text-red-500">Error: Invalid settings configuration</div>;
    }

    return (
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field) => (
                <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                    <div className="flex-1">
                        <label htmlFor={field.id} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                            {field.label}
                        </label>
                        {field.description && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{field.description}</p>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        {field.type === 'toggle' && (
                            <Toggle
                                enabled={!!formValues[field.id]}
                                onChange={(val) => handleChange(field.id, val)}
                            />
                        )}

                        {field.type === 'number' && (
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    id={field.id}
                                    value={formValues[field.id]}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className="block w-24 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                />
                                {field.suffix && (
                                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{field.suffix}</span>
                                )}
                            </div>
                        )}

                        {field.type === 'text' && (
                            <input
                                type="text"
                                id={field.id}
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="block w-full sm:w-64 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                id={field.id}
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="block w-full sm:w-64 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                            >
                                {field.options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            ))}
        </form>
    );
};

export default SettingsForm;
