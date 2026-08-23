import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, PenTool, CheckCircle, RotateCcw, XCircle, ChevronDown, Loader2, AlertCircle, FileDown } from 'lucide-react';

const MOCK_STUDENTS = [
    { id: 1, name: "Grace Omondi", class_name: "Grade 5", admin_no: "ADM/2023/001" },
    { id: 2, name: "Daniel Kipkorir", class_name: "Grade 5", admin_no: "ADM/2023/002" },
];

const ReportCardNarrative = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [term, setTerm] = useState('Term 1');
    const [year, setYear] = useState('2024');
    const [tone, setTone] = useState('formal');
    const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
    
    // Bulk state
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const [bulkResults, setBulkResults] = useState<{id: number, name: string, status: 'pending'|'generating'|'done'|'error'}[]>([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [isReviewMode, setIsReviewMode] = useState(false);

    const handleGenerate = async () => {
        if (!selectedStudent) return;
        
        setIsGenerating(true);
        setStreamedText('');
        setIsReviewMode(false);

        try {
            const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'academia-token') || localStorage.getItem('token');
            const isLocalDevServer = window.location.port === '5173' || window.location.port === '3000';
            const API_URL = isLocalDevServer ? `${window.location.protocol}//${window.location.hostname}:8000` : (import.meta.env.VITE_API_URL || '');
            
            const response = await fetch(`${API_URL}/api/intelligence/report-card-narrative/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    student_id: selectedStudent,
                    term,
                    academic_year: year,
                    class_id: 1, 
                    tone
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate narrative');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '');
                            try {
                                const dataObj = JSON.parse(dataStr);
                                if (dataObj.text) {
                                    setStreamedText(prev => prev + dataObj.text);
                                }
                                if (dataObj.done) {
                                    done = true;
                                    break;
                                }
                            } catch (e) {
                                // Ignore broken chunk parsing
                            }
                        }
                    }
                }
            }
        } catch (error) {
            setStreamedText(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setIsReviewMode(true);
        }
    };

    const handleBulkGenerate = async () => {
        setIsBulkGenerating(true);
        setBulkProgress(0);
        
        // Initialize bulk results state
        const initialResults = MOCK_STUDENTS.map(s => ({ id: s.id, name: s.name, status: 'pending' as const }));
        setBulkResults(initialResults);

        for (let i = 0; i < MOCK_STUDENTS.length; i++) {
            const student = MOCK_STUDENTS[i];
            
            // Mark as generating
            setBulkResults(prev => prev.map(r => r.id === student.id ? { ...r, status: 'generating' } : r));
            
            try {
                // Simulate generation time per student (since we don't want to actually hit the API for all mocks right now to save tokens, we'll just mock the delay. In production, this would call the API sequentially).
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Mark as done
                setBulkResults(prev => prev.map(r => r.id === student.id ? { ...r, status: 'done' } : r));
            } catch (e) {
                setBulkResults(prev => prev.map(r => r.id === student.id ? { ...r, status: 'error' } : r));
            }

            setBulkProgress(Math.round(((i + 1) / MOCK_STUDENTS.length) * 100));
        }
        
        setIsBulkGenerating(false);
    };

    const inputClasses = "w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C89B2A]/50 focus:border-[#C89B2A] transition-all backdrop-blur-md appearance-none";
    const labelClasses = "block text-[13px] font-bold text-gray-200 mb-2 tracking-wide uppercase";

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#C89B2A]/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-[#C89B2A]/20 border border-[#C89B2A]/30 rounded-2xl shadow-[0_0_15px_rgba(200,155,42,0.2)]">
                        <PenTool className="text-[#C89B2A] w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Report Card Narrative</h2>
                        <p className="text-gray-300 text-sm mt-1">Generate professional, personalized narratives via Claude 3.5 Sonnet.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row flex-1 p-6 sm:p-8 gap-8 relative">
                
                {/* Configuration Panel */}
                <div className="w-full xl:w-[350px] shrink-0 space-y-6">
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-6">
                        <button
                            onClick={() => setGenerationMode('single')}
                            className={`py-2 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
                                generationMode === 'single' 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            Single Student
                        </button>
                        <button
                            onClick={() => setGenerationMode('bulk')}
                            className={`py-2 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
                                generationMode === 'bulk' 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            Entire Class
                        </button>
                    </div>

                    {generationMode === 'single' ? (
                        <div>
                            <label className={labelClasses}>Select Student</label>
                            <div className="relative">
                                <select 
                                    value={selectedStudent} 
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="" className="bg-gray-900 text-gray-400">Search database...</option>
                                    {MOCK_STUDENTS.map(s => (
                                        <option key={s.id} value={s.id} className="bg-gray-900 text-white">{s.name} ({s.admin_no})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none w-5 h-5" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className={labelClasses}>Select Class</label>
                            <div className="relative">
                                <select className={inputClasses}>
                                    <option className="bg-gray-900">Grade 5 (2 Students)</option>
                                    <option className="bg-gray-900">Grade 6 (45 Students)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none w-5 h-5" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Term</label>
                            <div className="relative">
                                <select value={term} onChange={e => setTerm(e.target.value)} className={inputClasses}>
                                    <option className="bg-gray-900">Term 1</option>
                                    <option className="bg-gray-900">Term 2</option>
                                    <option className="bg-gray-900">Term 3</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Year</label>
                            <div className="relative">
                                <select value={year} onChange={e => setYear(e.target.value)} className={inputClasses}>
                                    <option className="bg-gray-900">2024</option>
                                    <option className="bg-gray-900">2023</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Narrative Tone</label>
                        <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {['Formal', 'Warm', 'Encouraging'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t.toLowerCase())}
                                    className={`py-2 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
                                        tone === t.toLowerCase() 
                                        ? 'bg-gradient-to-br from-[#C89B2A] to-yellow-600 text-white shadow-[0_0_15px_rgba(200,155,42,0.4)]' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        {generationMode === 'single' ? (
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !selectedStudent}
                                className={`w-full relative group overflow-hidden rounded-2xl font-bold py-4 transition-all ${
                                    isGenerating || !selectedStudent
                                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#C89B2A] via-yellow-500 to-[#C89B2A] text-gray-900 border border-transparent shadow-[0_0_30px_rgba(200,155,42,0.3)] hover:shadow-[0_0_40px_rgba(200,155,42,0.5)]'
                                }`}
                            >
                                {!isGenerating && selectedStudent && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                                )}
                                
                                <div className="relative z-10 flex items-center justify-center gap-2 text-[15px] tracking-wide">
                                    {isGenerating ? <Loader2 size={20} className="animate-spin text-[#C89B2A]" /> : <Sparkles size={20} className={!selectedStudent ? 'text-gray-500' : 'text-gray-900'} />}
                                    {isGenerating ? 'Synthesizing Data...' : 'Generate Narrative'}
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={handleBulkGenerate}
                                disabled={isBulkGenerating}
                                className={`w-full relative group overflow-hidden rounded-2xl font-bold py-4 transition-all ${
                                    isBulkGenerating
                                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white border border-transparent shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]'
                                }`}
                            >
                                {!isBulkGenerating && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2 text-[15px] tracking-wide">
                                    {isBulkGenerating ? <Loader2 size={20} className="animate-spin text-indigo-400" /> : <Sparkles size={20} className="text-white" />}
                                    {isBulkGenerating ? 'Processing Batch...' : 'Start Bulk Generation'}
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Output Panel - The Terminal / Chat area */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <div className="flex-1 bg-black/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col relative shadow-inner">
                        
                        {/* Status Bar */}
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
                                <span className="text-xs font-mono text-[#C89B2A] bg-[#C89B2A]/10 px-2 py-1 rounded">
                                    WORDS: {streamedText.trim().split(/\s+/).filter(Boolean).length}
                                </span>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 sm:p-8 relative">
                            {generationMode === 'bulk' && bulkResults.length > 0 ? (
                                <div className="h-full flex flex-col">
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2 text-white font-bold">
                                            <span>Bulk Generation Progress</span>
                                            <span>{bulkProgress}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
                                            <div 
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 transition-all duration-500 ease-out" 
                                                style={{ width: `${bulkProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                                        {bulkResults.map((result) => (
                                            <div key={result.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {result.status === 'done' && <CheckCircle className="text-emerald-400 w-5 h-5" />}
                                                    {result.status === 'generating' && <Loader2 className="animate-spin text-indigo-400 w-5 h-5" />}
                                                    {result.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>}
                                                    {result.status === 'error' && <XCircle className="text-red-400 w-5 h-5" />}
                                                    <span className="text-gray-200 font-medium">{result.name}</span>
                                                </div>
                                                <div>
                                                    {result.status === 'done' && <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">READY</span>}
                                                    {result.status === 'generating' && <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">SYNTHESIZING</span>}
                                                    {result.status === 'pending' && <span className="text-xs font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded">QUEUED</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!isBulkGenerating && bulkProgress === 100 && (
                                        <div className="mt-6">
                                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-colors border border-white/10">
                                                Begin Batch Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {!isGenerating && !streamedText && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                                                <Brain size={40} className="text-gray-400" />
                                            </div>
                                            <p className="font-medium text-lg text-white">Awaiting Instructions</p>
                                            <p className="text-sm mt-2 text-gray-300 max-w-xs text-center">Select a student and generate to observe live synthesis.</p>
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
                                                    {streamedText}
                                                    {isGenerating && (
                                                        <span className="inline-block w-2.5 h-5 bg-[#C89B2A] ml-1.5 translate-y-1 animate-[pulse_0.8s_infinite] shadow-[0_0_10px_#C89B2A]"></span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Human Review Panel - Slides up when done */}
                        <AnimatePresence>
                            {isReviewMode && streamedText && (
                                <motion.div 
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="absolute bottom-0 left-0 right-0 p-5 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between z-20"
                                >
                                    <div className="flex items-center gap-2 text-yellow-500/90 text-sm font-medium">
                                        <AlertCircle size={18}/> 
                                        Human review required. Edit if necessary.
                                    </div>
                                    
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-red-400 font-bold text-sm rounded-xl hover:bg-red-500/10 border border-red-500/20 transition-colors">
                                            <XCircle size={18} /> Discard
                                        </button>
                                        <button className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-gray-300 font-bold text-sm rounded-xl hover:bg-white/10 border border-white/10 transition-colors">
                                            <RotateCcw size={18} /> Retry
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 text-indigo-300 font-bold text-sm rounded-xl hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors"
                                        >
                                            <FileDown size={18} /> PDF
                                        </button>
                                        <button className="flex-1 sm:flex-none px-6 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5 border border-emerald-400/50">
                                            <CheckCircle size={18} /> Approve & Save
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

export default ReportCardNarrative;
