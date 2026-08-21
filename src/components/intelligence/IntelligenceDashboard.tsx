import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, PenTool, MessageSquare, Clock, FileText, 
    Settings, ShieldAlert, Zap, TrendingUp 
} from 'lucide-react';
import ReportCardNarrative from './ReportCardNarrative';
import ParentLetters from './ParentLetters';

const IntelligenceDashboard = () => {
    const [activeTab, setActiveTab] = useState('narratives');

    return (
        <div className="relative min-h-screen bg-[#0B0A10] text-gray-200 overflow-hidden font-sans">
            
            {/* Animated Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C89B2A]/20 blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/30 blur-[150px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]" />
                <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[100px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]" />
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none opacity-50" />
            </div>

            <div className="relative z-10 p-4 sm:p-8 max-w-[1400px] mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 flex items-center gap-4 tracking-tight">
                            <Sparkles className="text-[#C89B2A] w-8 h-8 drop-shadow-[0_0_15px_rgba(200,155,42,0.5)]" />
                            Fahari Intelligence 
                            <span className="bg-[#C89B2A]/10 text-[#C89B2A] text-xs px-3 py-1 rounded-full border border-[#C89B2A]/30 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(200,155,42,0.2)]">Beta</span>
                        </h1>
                        <p className="text-gray-400 mt-3 font-medium text-lg ml-12">Your institutional AI assistant for automated reporting and communication.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-200">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            </div>
                            System Active
                        </div>
                        <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <Settings size={22} />
                        </button>
                    </div>
                </motion.div>

                {/* Privacy Warning */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10 bg-indigo-900/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-l-3xl"></div>
                    <ShieldAlert className="text-indigo-400 shrink-0 mt-0.5 w-6 h-6" />
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1.5 tracking-wide">Data Privacy & Security Guarantee</h4>
                        <p className="text-[13px] text-indigo-100 leading-relaxed max-w-4xl">
                            Fahari Intelligence uses an automated anonymisation layer. No personally identifiable information (like national IDs or parent phone numbers) is transmitted to external AI services. <strong className="text-white">All AI outputs require human review before saving.</strong>
                        </p>
                    </div>
                </motion.div>

                {/* Quick Stats - Glass Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: FileText, label: 'Documents Generated', value: '142', color: 'from-purple-500 to-indigo-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' },
                        { icon: Clock, label: 'Hours Saved', value: '35.5', unit: 'hrs', color: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
                        { icon: TrendingUp, label: 'Approval Rate', value: '96%', color: 'from-blue-400 to-cyan-500', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]' },
                        { icon: Zap, label: 'Pending Reviews', value: '3', color: 'from-rose-400 to-orange-500', glow: 'shadow-[0_0_20px_rgba(251,113,133,0.15)]' }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className={`bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex items-center gap-5 hover:bg-white/[0.05] transition-all group ${stat.glow}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-[1px]`}>
                                <div className="w-full h-full bg-[#0B0A10]/80 rounded-[15px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                                    <stat.icon className="text-white drop-shadow-md w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold text-white tracking-tight">
                                    {stat.value} {stat.unit && <span className="text-sm text-gray-500 font-medium ml-1">{stat.unit}</span>}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Navigation Sidebar - Floating Glass Dock */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full lg:w-72 shrink-0"
                    >
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl sticky top-8">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4 mt-2">AI Modules</p>
                            <nav className="space-y-2">
                                {[
                                    { id: 'narratives', icon: PenTool, label: 'Report Cards' },
                                    { id: 'letters', icon: MessageSquare, label: 'Parent Letters' },
                                    { id: 'query', icon: Sparkles, label: 'Ask AI' }
                                ].map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => {
                                            if (item.id === 'query') {
                                                window.dispatchEvent(new Event('open-ai-chat'));
                                            } else {
                                                setActiveTab(item.id);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden ${
                                            activeTab === item.id && item.id !== 'query'
                                            ? 'text-[#C89B2A] bg-gradient-to-r from-[#C89B2A]/20 to-transparent border border-[#C89B2A]/30' 
                                            : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        {activeTab === item.id && item.id !== 'query' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C89B2A] rounded-r-full shadow-[0_0_10px_#C89B2A]"></div>
                                        )}
                                        <item.icon size={20} className={activeTab === item.id && item.id !== 'query' ? 'drop-shadow-[0_0_8px_rgba(200,155,42,0.8)]' : ''} /> 
                                        <span className="tracking-wide text-white">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Content Panel */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {activeTab === 'narratives' && <ReportCardNarrative />}
                                
                                {activeTab === 'letters' && <ParentLetters />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default IntelligenceDashboard;
