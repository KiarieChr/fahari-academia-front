import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, 
    ChevronRight, 
    AlertCircle, 
    ArrowRight,
    ClipboardCheck,
    UserCheck,
    Users,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { studentManagementService } from '../../services/studentManagementService';

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
        const fetchAlerts = async () => {
            try {
                // Fetch real data from the backend APIs
                const [hrRes, studentStatsRes] = await Promise.allSettled([
                    api.workforce.getHRAnalytics(),
                    studentManagementService.getDashboardStats()
                ]);
                
                const hrData = hrRes.status === 'fulfilled' ? (hrRes.value.data || hrRes.value) : {};
                const studentData = studentStatsRes.status === 'fulfilled' ? (studentStatsRes.value.data || studentStatsRes.value) : {};

                const alerts = [];

                // 1. Approvals Needed
                const pendingLeaves = hrData?.pending_leaves || hrData?.leave_requests_pending || 0;
                const pendingPO = hrData?.pending_purchase_orders || hrData?.pending_approvals || 0;
                const totalApprovals = pendingLeaves + pendingPO;

                if (totalApprovals > 0 || hrData?.approvals_needed > 0) {
                    alerts.push({
                        icon: ClipboardCheck,
                        title: 'Approvals Required',
                        description: `${pendingLeaves > 0 ? `${pendingLeaves} leave requests ` : ''}${pendingPO > 0 ? `and ${pendingPO} purchase orders ` : ''}are pending your approval.`.trim() || 'You have pending administrative approvals.',
                        actionText: 'Review Approvals',
                        type: 'warning'
                    });
                }

                // 2. New Students Enrolled
                const newEnrolled = studentData?.new_enrollments || studentData?.enrolled_today || studentData?.recent_admissions || 0;
                if (newEnrolled > 0) {
                    alerts.push({
                        icon: UserCheck,
                        title: 'New Enrolments',
                        description: `${newEnrolled} new students have successfully completed their enrolment.`,
                        actionText: 'View Students',
                        type: 'success'
                    });
                }

                // 3. New Applicants
                const pendingApps = studentData?.pending_applications || studentData?.applications_pending || studentData?.total_pending || 0;
                if (pendingApps > 0) {
                    alerts.push({
                        icon: Users,
                        title: 'Pending Applications',
                        description: `${pendingApps} admission applications have been received and require review.`,
                        actionText: 'Review Applications',
                        type: 'info'
                    });
                }

                // 4. New Enquiries
                const newEnquiries = studentData?.new_enquiries || studentData?.enquiries_today || studentData?.unread_enquiries || 0;
                if (newEnquiries > 0) {
                    alerts.push({
                        icon: MessageSquare,
                        title: 'Recent Enquiries',
                        description: `${newEnquiries} new enquiries from the institution website need follow-up.`,
                        actionText: 'View Enquiries',
                        type: 'info'
                    });
                }

                // Fallback if no urgent alerts exist (keeps the card from looking broken)
                if (alerts.length === 0) {
                    alerts.push({
                        icon: CheckCircle2,
                        title: 'All Caught Up!',
                        description: 'There are no pending approvals, new applications, or enquiries at this time.',
                        type: 'success'
                    });
                }

                setRecommendations(alerts);
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col"
        >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Alerts & Notifications</h2>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">Items requiring your attention</p>
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
                    View All Notifications <ChevronRight size={16} />
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
