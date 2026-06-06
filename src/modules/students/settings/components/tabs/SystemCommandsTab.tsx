import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Loader2, Terminal, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../../../services/api';

const SystemCommandsTab = () => {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningCommand, setRunningCommand] = useState(null);
    const [results, setResults] = useState({});

    const fetchCommands = async () => {
        try {
            setLoading(true);
            const data = await api.get('/api/system/commands/');
            setCommands(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('Failed to load commands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCommands(); }, []);

    const runCommand = async (commandName) => {
        if (runningCommand) return;
        setRunningCommand(commandName);
        setResults(prev => ({ ...prev, [commandName]: null }));

        try {
            const data = await api.post('/api/system/run-command/', { command: commandName });
            setResults(prev => ({ ...prev, [commandName]: data }));
            if (data.status === 'success') {
                toast.success(`"${commandName}" completed successfully`);
            }
        } catch (e) {
            const errData = e.data || {};
            setResults(prev => ({
                ...prev,
                [commandName]: {
                    status: 'error',
                    error: errData.error || e.message || 'Unknown error',
                    output: errData.output || '',
                },
            }));
            toast.error(`"${commandName}" failed`);
        } finally {
            setRunningCommand(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                Loading commands...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Commands</h3>
                    <p className="text-sm text-gray-500">Run management commands to seed data and configure the system.</p>
                </div>
                <button
                    onClick={fetchCommands}
                    className="btn btn-light px-3 py-2 d-flex align-items-center gap-2 rounded-pill border"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {commands.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    No commands available.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 px-3">
                    {commands.map((cmd) => {
                        const result = results[cmd.name];
                        const isRunning = runningCommand === cmd.name;

                        return (
                            <div
                                key={cmd.name}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                {/* Command header */}
                                <div className="flex items-center justify-between px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
                                            <Terminal size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-[0.95rem] font-bold text-gray-900">{cmd.label}</h4>
                                            <p className="text-sm text-gray-500 mt-0.5">{cmd.description}</p>
                                            <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-lg bg-gray-100 text-[0.7rem] font-mono text-gray-500">
                                                {cmd.app} &middot; {cmd.name}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => runCommand(cmd.name)}
                                        disabled={!!runningCommand}
                                        className={`
                                            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                            transition-all duration-200 shadow-sm
                                            ${isRunning
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-wait'
                                                : runningCommand
                                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50'
                                            }
                                        `}
                                    >
                                        {isRunning ? (
                                            <><Loader2 size={16} className="animate-spin" /> Running...</>
                                        ) : (
                                            <><Play size={16} /> Run</>
                                        )}
                                    </button>
                                </div>

                                {/* Output panel */}
                                {result && (
                                    <div className="border-t border-gray-100">
                                        {/* Status bar */}
                                        <div className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium ${
                                            result.status === 'success'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-red-50 text-red-700'
                                        }`}>
                                            {result.status === 'success'
                                                ? <><CheckCircle size={16} /> Completed successfully</>
                                                : <><XCircle size={16} /> {result.error || 'Command failed'}</>
                                            }
                                        </div>

                                        {/* Output log */}
                                        {result.output && (
                                            <div className="px-6 py-4 bg-gray-900 max-h-72 overflow-y-auto">
                                                <pre className="text-[0.78rem] text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                                                    {result.output}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SystemCommandsTab;
