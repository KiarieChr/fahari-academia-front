import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogIn, LogOut, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../../services/api';
import TeachingSchedulePanel from './TeachingSchedulePanel';

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

    // ── Read logged-in user from local storage ──────────────────
    const currentUserId = useMemo(() => {
        try {
            const raw = localStorage.getItem(
                import.meta.env.VITE_USER_KEY || 'academia-user'
            );
            if (!raw) return undefined;
            const parsed = JSON.parse(raw);
            return parsed?.id ?? parsed?.pk ?? undefined;
        } catch {
            return undefined;
        }
    }, []);

    const fetchClockPolicy = async () => {
        setPolicyLoading(true);
        try {
            // Try fetching personal policy first
            const data = await api.get('/workforce/api/attendance/my_clock_policy/');
            setClockPolicy(data);
            if (data?.allowed_methods?.length) {
                setSelectedMethod(data.allowed_methods[0]);
            }
        } catch (error) {
            // If personal policy fails (e.g. 400 Bad Request when not assigned), try general policy
            console.warn("Personal policy not found, attempting to fetch general policy...");
            try {
                const generalData = await api.get('/workforce/api/attendance/general_policy/');
                setClockPolicy(generalData);
                if (generalData?.allowed_methods?.length) {
                    setSelectedMethod(generalData.allowed_methods[0]);
                }
            } catch (genError) {
                setClockPolicy(null);
                console.error("Failed to fetch both personal and general policies", genError);
            }
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
        <div className={`relative overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ${compact ? 'p-2' : 'p-3'} h-full flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]`}>
            {/* High-End Ambient Backgrounds */}
            <div className="absolute -top-32 -right-32 w-72 h-150 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-72 h-150 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 flex flex-col h-full mb-1">
                {/* Refined Header Section */}
                <div className="flex items-start justify-between mb-9">
                    <div className="space-y-1">
                        <h1 className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none" style={{fontSize:'14px'}}>
                            ATTENDANCE <br /> TERMINAL
                        </h1>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 rounded-full">
                                <MapPin size={10} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                    {clockPolicy?.campus?.name || 'Main Campus'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })}
                        </div>
                        <div className="text-xs font-bold text-slate-300 mt-1">{currentTime.getFullYear()}</div>
                    </div>
                </div>

                {/* Hero Clock Section - Fixed Layout */}
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                    <div className="relative mb-5 flex items-center justify-center">
                        {/* High-Precision SVG Progress Ring */}
                        <svg className="absolute w-[180px] h-[180px] transform -rotate-90">
                            <circle
                                cx="90"
                                cy="90"
                                r="82"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="transparent"
                                className="text-slate-100 dark:text-slate-800/50"
                            />
                            <motion.circle
                                cx="90"
                                cy="90"
                                r="82"
                                stroke="url(#terminalGradient)"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 82}
                                initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
                                animate={{ 
                                    strokeDashoffset: 2 * Math.PI * 82 * (1 - currentTime.getSeconds() / 60) 
                                }}
                                transition={{ duration: 1, ease: "linear" }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="terminalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Centered Clock Content */}
                        <div className="relative z-10 text-center">
                            <div className="flex items-baseline justify-center gap-1">
                                <div className={`${compact ? 'text-5xl' : 'text-6xl'} font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none`}>
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="text-lg font-black text-blue-500 tabular-nums w-8">
                                    {currentTime.toLocaleTimeString([], { second: '2-digit' })}
                                </div>
                            </div>
                            <div className="text-[11px] font-black text-slate-400 tracking-[0.3em] mt-2 uppercase">
                                {currentTime.toLocaleTimeString([], { hour12: true }).split(' ')[1]}
                            </div>
                        </div>
                    </div>

                    {/* Interactive Controls Area */}
                    <div className="w-full space-y-6">
                        {!policyLoading && clockPolicy && (
                            <div className="flex justify-center">
                                <div className="inline-flex p-2 bg-slate-100/50 dark:bg-slate-800/40 backdrop-blur-md rounded-[20px] border border-slate-200/50 dark:border-slate-700/50 shadow-inner mb-2">
                                    {clockPolicy.allowed_methods?.map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setSelectedMethod(method)}
                                            className={`relative py-1 px-3 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all duration-500 ${
                                                selectedMethod === method
                                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/5'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {METHOD_LABELS[method] || method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {policyLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="flex gap-3 items-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    Synchronizing Terminal...
                                </div>
                            </div>
                        ) : !clockPolicy ? (
                            <div className="flex justify-center py-2">
                                <div className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-4 py-2.5 rounded-2xl border border-rose-500/20 uppercase tracking-wider">
                                     Terminal Offline - Check Connection
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleClockAction('clock_in')}
                                    disabled={loading}
                                    className="flex-1 group relative h-18 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30 border border-white/20"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                                            <LogIn size={18} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clock In</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleClockAction('clock_out')}
                                    disabled={loading}
                                    className="flex-1 group relative h-18 overflow-hidden rounded-[28px] bg-slate-900 dark:bg-black text-white shadow-xl shadow-black/40 border border-white/5"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                                        <div className="p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                            <LogOut size={18} strokeWidth={3} className="text-orange-500" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clock Out</span>
                                    </div>
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Refined Footer Insight */}
                {clockPolicy && !policyLoading && (
                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            </div>
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                {clockPolicy.employee_name || 'System Authorized'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <ArrowUpRight size={10} className="text-orange-500" />
                                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">
                                    {clockPolicy.holiday_work_multiplier || '1.0'}x RATE
                                </span>
                            </div>
                            <div className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">SECURE v2.4.1</div>
                        </div>
                    </div>
                )}

                {/* Today's Teaching Schedule */}
                <TeachingSchedulePanel
                    userId={currentUserId}
                    compact={compact}
                />
            </div>
        </div>
    );
};

export default ClockInOutWidget;

