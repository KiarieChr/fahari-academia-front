import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogIn, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../../services/api';

const METHOD_LABELS = {
    biometric: 'Biometric',
    geolocation: 'On-Site',
    remote: 'Remote',
};

const getGeoPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        },
        () => reject(new Error('Unable to fetch your current location')),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
});

const ClockInOutWidget = ({ onClockUpdate, compact = false }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [policyLoading, setPolicyLoading] = useState(true);
    const [clockPolicy, setClockPolicy] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('remote');

    const fetchClockPolicy = async () => {
        setPolicyLoading(true);
        try {
            const data = await api.get('/workforce/api/attendance/my_clock_policy/');
            setClockPolicy(data);
            if (data?.allowed_methods?.length) {
                setSelectedMethod(data.allowed_methods[0]);
            }
        } catch (error) {
            setClockPolicy(null);
            console.error(error);
        } finally {
            setPolicyLoading(false);
        }
    };

    useEffect(() => {
        fetchClockPolicy();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const buildPayload = async () => {
        const payload = {
            method: selectedMethod,
            location_text: selectedMethod === 'remote' ? 'Remote clocking' : 'Campus clocking',
        };

        if (selectedMethod === 'geolocation') {
            const position = await getGeoPosition();
            payload.latitude = position.latitude;
            payload.longitude = position.longitude;
        }

        return payload;
    };

    const handleClockAction = async (action) => {
        if (policyLoading || !clockPolicy) {
            toast.error('Attendance policy is not available yet');
            return;
        }

        if (!clockPolicy.allowed_methods?.includes(selectedMethod)) {
            toast.error('Selected clocking method is not allowed for your profile');
            return;
        }

        setLoading(true);
        const endpoint = `/workforce/api/attendance/${action}/`;

        try {
            const payload = await buildPayload();
            await api.post(endpoint, payload);
            toast.success(`Successfully clocked ${action === 'clock_in' ? 'in' : 'out'}`);
            if (onClockUpdate) onClockUpdate();
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.error || `Failed to clock ${action === 'clock_in' ? 'in' : 'out'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/50 rounded-[32px] shadow-xl shadow-slate-200/40 dark:shadow-black/20 ${compact ? 'p-5' : 'p-8'} h-full flex flex-col`}>
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Attendance Terminal</h3>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                            <MapPin size={10} />
                            <span>{clockPolicy?.campus?.name || 'Central Campus'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400">{currentTime.toDateString().toUpperCase()}</div>
                    </div>
                </div>

                {/* Modern Clock Visual */}
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <div className="relative mb-6">
                        {/* Styled Ring */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-slate-800 scale-110" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-[spin_10s_linear_infinite] scale-110" />
                        
                        <div className="text-center">
                            <div className={`${compact ? 'text-4xl' : 'text-5xl'} font-black text-slate-800 dark:text-white tracking-tighter tabular-nums leading-none`}>
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 tracking-[0.3em] mt-1 ml-1">
                                :{currentTime.toLocaleTimeString([], { second: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {!policyLoading && clockPolicy && (
                        <div className="w-full max-w-[240px] mb-6">
                            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                {clockPolicy.allowed_methods?.map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setSelectedMethod(method)}
                                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                                            selectedMethod === method
                                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {METHOD_LABELS[method] || method}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {policyLoading ? (
                        <div className="flex gap-2 items-center text-xs text-slate-400 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-blue-400" /> Initializing Terminal...
                        </div>
                    ) : !clockPolicy ? (
                        <div className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                             Policy Load Failed - Contact Admin
                        </div>
                    ) : (
                        <div className="flex gap-4 w-full">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleClockAction('clock_in')}
                                disabled={loading}
                                className="flex-1 group relative h-24 overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 border border-white/10"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                    <div className="p-2 bg-white/10 rounded-xl mb-1">
                                        <LogIn size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Clock In</span>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleClockAction('clock_out')}
                                disabled={loading}
                                className="flex-1 group relative h-24 overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-black/20 border border-white/5"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                    <div className="p-2 bg-white/5 rounded-xl mb-1 text-orange-400">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Clock Out</span>
                                </div>
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                {clockPolicy && !policyLoading && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-slate-500 dark:text-slate-400">{clockPolicy.employee_name}</span>
                        </div>
                        <div className="font-medium text-slate-300">v2.4.1 SECURE</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClockInOutWidget;

