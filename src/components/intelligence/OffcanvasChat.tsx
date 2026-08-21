import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, History, MessageSquare, Send, BarChart2, CornerDownLeft, Clock, MessageCircle, Maximize, Minimize, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../services/apiClient';

interface OffcanvasChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const OffcanvasChat: React.FC<OffcanvasChatProps> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<'chat' | 'history'>('chat');
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Get current user details from localStorage
    const userDataStr = localStorage.getItem(import.meta.env.VITE_USER_KEY || 'academia-user') || localStorage.getItem('user');
    let currentUserName = 'You';
    if (userDataStr) {
        try {
            const userObj = JSON.parse(userDataStr);
            currentUserName = userObj.first_name ? `${userObj.first_name} ${userObj.last_name || ''}`.trim() : (userObj.username || 'You');
        } catch (e) {}
    }
    
    const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
        {
            role: 'ai',
            content: "Hello! I am Fahari Intelligence. I have access to your institution's academic, financial, and HR records. How can I help you today?"
        }
    ]);

    useEffect(() => {
        if (view === 'history') {
            loadHistory();
        }
    }, [view]);

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get('/api/intelligence/chat-sessions/');
            setSessions(response.results || response || []);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const loadSession = (session: any) => {
        setSessionId(session.id);
        const loadedMessages = session.messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'ai' : 'user',
            content: m.content
        }));
        setMessages(loadedMessages);
        setView('chat');
    };

    const startNewChat = () => {
        setSessionId(null);
        setMessages([
            {
                role: 'ai',
                content: "Hello! I am Fahari Intelligence. How can I help you today?"
            }
        ]);
        setView('chat');
    };

    const handleSend = async () => {
        if (!query.trim() || isAnalyzing) return;
        
        const userMessage = query;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setQuery('');
        setIsAnalyzing(true);
        
        // Add empty AI message to stream into
        setMessages(prev => [...prev, { role: 'ai', content: '' }]);

        try {
            const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'academia-token') || localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            
            const response = await fetch(`${apiUrl}/api/intelligence/ask/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Token ${token}` : ''
                },
                body: JSON.stringify({
                    query: userMessage,
                    history: messages.slice(1).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');

            if (!reader) throw new Error('No reader available');

            setIsAnalyzing(false); 

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.session_id && !sessionId) {
                                setSessionId(data.session_id);
                            }
                            
                            if (data.error) {
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].content = `Error: ${data.error}`;
                                    return newMsgs;
                                });
                                break;
                            }
                            if (data.done) {
                                break;
                            }
                            if (data.text) {
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    // Deep copy the last message to avoid React StrictMode double mutation
                                    const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                                    lastMsg.content += data.text;
                                    newMsgs[newMsgs.length - 1] = lastMsg;
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            // Ignore broken chunks
                        }
                    }
                }
            }
        } catch (error) {
            setIsAnalyzing(false);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Sorry, I encountered an error connecting to Fahari Intelligence.";
                return newMsgs;
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - High Z-Index to cover everything */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
                    />

                    {/* Drawer - Also very high Z-Index */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ width: isFullscreen ? '100%' : '50%' }}
                        className="fixed top-0 right-0 bottom-0 z-[9999] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ml-2">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="p-2 text-sm uppercase font-bold text-slate-800 dark:text-white tracking-tight leading-tight">Fahari AI</h3>
                                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">Conversational</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center p-2 gap-3">
                                {/* Toggle Chat / History */}
                                <div className="bg-slate-100 dark:bg-slate-900 px-1 py-2 rounded-xl flex border border-slate-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => setView('chat')}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${view === 'chat' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <MessageSquare size={14} /> Chat
                                    </button>
                                    <button 
                                        onClick={() => setView('history')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${view === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <History size={14} /> History
                                    </button>
                                </div>

                                <button 
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                </button>

                                <button 
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {view === 'history' ? (
                                <div className="h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Previous Conversations</h4>
                                        <button 
                                            onClick={startNewChat}
                                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            + New Chat
                                        </button>
                                    </div>
                                    
                                    {loadingHistory ? (
                                        <div className="flex justify-center py-10">
                                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center mt-20 text-slate-400 dark:text-slate-500">
                                            <History size={48} className="mb-4 opacity-50 text-slate-300 dark:text-slate-600" />
                                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No History Yet</p>
                                            <p className="text-sm text-center max-w-[250px] mt-2">Past queries and generated charts will appear here once you start chatting.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessions.map(session => (
                                                <button 
                                                    key={session.id}
                                                    onClick={() => loadSession(session)}
                                                    className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group flex flex-col gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <MessageCircle size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{session.title}</h5>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-6">
                                                        <Clock size={12} />
                                                        <span>{new Date(session.updated_at).toLocaleDateString()} {new Date(session.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-4 text-[14.5px] leading-relaxed shadow-sm mb-3 ${
                                                msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium rounded-tr-sm shadow-indigo-500/20' 
                                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                            }`}>
                                                {msg.role === 'ai' ? (
                                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                                        <Sparkles size={14} />
                                                        <span className="text-[11px] font-bold uppercase tracking-wider">Fahari AI</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 mb-2 text-indigo-100 dark:text-indigo-200">
                                                        <User size={14} />
                                                        <span className="text-[11px] font-bold uppercase tracking-wider">{currentUserName}</span>
                                                    </div>
                                                )}
                                                {msg.role === 'ai' && msg.content === '' ? (
                                                    <div className="flex space-x-1.5 py-1.5 items-center h-5">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-td:border-slate-200 dark:prose-td:border-slate-700">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {view === 'chat' && (
                            <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-10 mt-3">
                                <div className="relative shadow-sm rounded-2xl">
                                    <textarea 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask me anything..."
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-5 pr-5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[60px] max-h-[150px] custom-scrollbar text-sm"
                                        rows={2}
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!query.trim() || isAnalyzing}
                                        className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(79,70,229,0.3)]"
                                    >
                                        <CornerDownLeft size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400 px-1">
                                    <p>Shift + Enter for new line</p>
                                    <p>AI can make mistakes. Verify important data.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OffcanvasChat;
