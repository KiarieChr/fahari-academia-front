import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Lightbulb, 
    ChevronRight, 
    AlertCircle, 
    Clock, 
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const RecommendationItem = ({ icon: Icon, title, description, actionText, type = 'info' }) => {
    const colors = {
        info: 'blue',
        warning: 'amber',
        error: 'rose',
        success: 'emerald'
    };
    
    const color = colors[type];

    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 mt-1`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">{description}</p>
                {actionText && (
                    <button className={`text-xs font-bold text-${color}-600 flex items-center gap-1 group-hover:gap-2 transition-all`}>
                        {actionText} <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

const RecommendationsCard = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const finance = await api.fees.getInsights();
                const data = finance.data || finance;
                
                const recs = [];

                // 1. Invoicing Alert
                if (data.invoicing?.not_invoiced > 0) {
                    recs.push({
                        icon: AlertCircle,
                        title: 'Pending Invoicing',
                        description: `${data.invoicing.not_invoiced} students in ${data.current_term || 'this term'} have not yet been invoiced.`,
                        actionText: 'Generate Bulk Invoices',
                        type: 'warning'
                    });
                }

                // 2. Payables Alert
                if (data.payables?.overdue?.count > 0) {
                    recs.push({
                        icon: Clock,
                        title: 'Overdue Supplier Payments',
                        description: `You have ${data.payables.overdue.count} supplier invoices past their due date totaling ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(data.payables.overdue.total)}.`,
                        actionText: 'View Payables',
                        type: 'error'
                    });
                }

                // 3. Attendance Insight (Placeholder logic based on backend check)
                if (data.attendance?.low_attendance?.count > 0) {
                    recs.push({
                        icon: Lightbulb,
                        title: 'Attendance Alert',
                        description: `${data.attendance.low_attendance.count} classes have attendance below 80% this week.`,
                        actionText: 'View Report',
                        type: 'info'
                    });
                }

                // Default if empty
                if (recs.length === 0) {
                    recs.push({
                        icon: CheckCircle2,
                        title: 'System Healthy',
                        description: 'No urgent administrative tasks detected. All students are invoiced and payments are up to date.',
                        type: 'success'
                    });
                }

                setRecommendations(recs);
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col"
        >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Admin Insights</h2>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">Smart Recommendations</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-2 space-y-1 overflow-y-auto max-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center">
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="inline-block"
                        >
                            <Loader2 size={24} className="text-slate-300" />
                        </motion.div>
                    </div>
                ) : (
                    recommendations.map((rec, index) => (
                        <RecommendationItem key={index} {...rec} />
                    ))
                )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    View All Activity <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

const Loader2 = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default RecommendationsCard;
