import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, CheckCircle, RotateCcw, XCircle, ChevronDown, Loader2, AlertCircle, FileDown, Briefcase } from 'lucide-react';

const MOCK_CLASSES = [
    { id: 1, name: "Grade 5", students: 45 },
    { id: 2, name: "Grade 6", students: 50 },
];

const LETTER_TYPES = [
    { id: 'fee_reminder', name: 'Fee Arrears Reminder', description: 'Remind parents of outstanding balances.' },
    { id: 'general', name: 'General Announcement', description: 'Announce an upcoming event or term date.' },
    { id: 'disciplinary', name: 'Disciplinary Notice', description: 'Formal notice regarding student conduct.' },
];

const ParentLetters = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [letterType, setLetterType] = useState('fee_reminder');
    const [tone, setTone] = useState('professional');
    const [customContext, setCustomContext] = useState('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [isReviewMode, setIsReviewMode] = useState(false);

    const handleGenerate = async () => {
        if (!selectedClass || !letterType) return;
        
        setIsGenerating(true);
        setStreamedText('');
        setIsReviewMode(false);

        // Mock generation
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const lines = [
                "Dear Parent/Guardian,\n\n",
                "We hope this letter finds you well. ",
                "This is a formal communication from Fahari Academia regarding ",
                letterType === 'fee_reminder' ? "outstanding fee balances for the current term." : "important school updates.",
                "\n\nPlease ensure that all requirements are met by the end of the week. ",
                "Thank you for your continued cooperation.\n\n",
                "Sincerely,\nSchool Administration"
            ];

            for (const line of lines) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setStreamedText(prev => prev + line);
            }
        } catch (error) {
            setStreamedText(`Error: Failed to generate.`);
        } finally {
            setIsGenerating(false);
            setIsReviewMode(true);
        }
    };

    const inputClasses = "w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-md appearance-none";
    const labelClasses = "block text-[13px] font-bold text-gray-200 mb-2 tracking-wide uppercase";

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <MessageSquare className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Parent Letters</h2>
                        <p className="text-gray-300 text-sm mt-1">Generate personalized communications for parents.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row flex-1 p-6 sm:p-8 gap-8 relative">
                
                {/* Configuration Panel */}
                <div className="w-full xl:w-[350px] shrink-0 space-y-6">
                    <div>
                        <label className={labelClasses}>Select Class Target</label>
                        <div className="relative">
                            <select 
                                value={selectedClass} 
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={inputClasses}
                            >
                                <option value="" className="bg-gray-900 text-gray-400">Select a class...</option>
                                {MOCK_CLASSES.map(c => (
                                    <option key={c.id} value={c.id} className="bg-gray-900 text-white">{c.name} ({c.students} Students)</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Communication Type</label>
                        <div className="space-y-2">
                            {LETTER_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setLetterType(type.id)}
                                    className={`w-full flex flex-col text-left p-3 rounded-2xl border transition-all ${
                                        letterType === type.id
                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                    }`}
                                >
                                    <span className="font-bold text-sm text-white mb-0.5">{type.name}</span>
                                    <span className="text-xs">{type.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Tone</label>
                        <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {['Professional', 'Urgent', 'Warm'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t.toLowerCase())}
                                    className={`py-2 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
                                        tone === t.toLowerCase() 
                                        ? 'bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedClass}
                            className={`w-full relative group overflow-hidden rounded-2xl font-bold py-4 transition-all ${
                                isGenerating || !selectedClass
                                ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white border border-transparent shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]'
                            }`}
                        >
                            {!isGenerating && selectedClass && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                            )}
                            
                            <div className="relative z-10 flex items-center justify-center gap-2 text-[15px] tracking-wide">
                                {isGenerating ? <Loader2 size={20} className="animate-spin text-indigo-200" /> : <Sparkles size={20} className={!selectedClass ? 'text-gray-500' : 'text-white'} />}
                                {isGenerating ? 'Drafting Letter...' : 'Draft Letter'}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Output Panel - The Terminal / Chat area */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <div className="flex-1 bg-black/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col relative shadow-inner">
                        
                        <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                                <span className="text-xs font-mono text-gray-500">claude-3-5-sonnet-20240620</span>
                            </div>
                            {(isGenerating || streamedText) && (
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                                    WORDS: {streamedText.trim().split(/\s+/).filter(Boolean).length}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 p-6 sm:p-8 relative">
                            {!isGenerating && !streamedText && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                                        <Briefcase size={40} className="text-gray-400" />
                                    </div>
                                    <p className="font-medium text-lg text-white">Draft a Communication</p>
                                    <p className="text-sm mt-2 text-gray-300 max-w-xs text-center">Select target class and letter type to auto-generate a draft.</p>
                                </div>
                            )}

                            {(isGenerating || streamedText) && (
                                <div className="h-full">
                                    {isReviewMode ? (
                                        <textarea 
                                            className="w-full h-full bg-transparent text-gray-200 text-base leading-relaxed focus:outline-none resize-none font-sans custom-scrollbar"
                                            value={streamedText}
                                            onChange={(e) => setStreamedText(e.target.value)}
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full text-gray-200 text-base leading-relaxed font-sans overflow-y-auto custom-scrollbar">
                                            {streamedText.split('\n').map((line, i) => (
                                                <span key={i}>
                                                    {line}
                                                    <br/>
                                                </span>
                                            ))}
                                            {isGenerating && (
                                                <span className="inline-block w-2.5 h-5 bg-indigo-500 ml-1.5 translate-y-1 animate-[pulse_0.8s_infinite] shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Human Review Panel */}
                        <AnimatePresence>
                            {isReviewMode && streamedText && (
                                <motion.div 
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="absolute bottom-0 left-0 right-0 p-5 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between z-20"
                                >
                                    <div className="flex items-center gap-2 text-yellow-500/90 text-sm font-medium">
                                        <AlertCircle size={18}/> 
                                        Review draft before finalizing.
                                    </div>
                                    
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-red-400 font-bold text-sm rounded-xl hover:bg-red-500/10 border border-red-500/20 transition-colors">
                                            <XCircle size={18} /> Discard
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-indigo-300 font-bold text-sm rounded-xl hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors"
                                        >
                                            <FileDown size={18} /> Export PDF
                                        </button>
                                        <button className="flex-1 sm:flex-none px-6 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5 border border-emerald-400/50">
                                            <CheckCircle size={18} /> Send to Parents
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%) skewX(12deg); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};

export default ParentLetters;
