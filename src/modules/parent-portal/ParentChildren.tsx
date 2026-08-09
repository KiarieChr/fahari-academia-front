import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { Users, Loader2, CreditCard, Award, ArrowRight } from 'lucide-react';
import ParentLayout from '../../layouts/ParentLayout';
import { portalService } from '../student-portal/portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ParentChildren = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await portalService.getChildren();
                setChildren(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load children');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <ParentLayout title="My Children">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            </ParentLayout>
        );
    }

    return (
        <ParentLayout title="My Children">
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-6 p-1">
                <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">My Children</h2>
                            <p className="text-indigo-200 text-sm">{children.length} {children.length === 1 ? 'child' : 'children'} enrolled</p>
                        </div>
                    </div>
                </motion.div>

                {children.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {children.map(child => (
                            <motion.div key={child.id} variants={itemVariants}
                                onClick={() => navigate(`/parent/children/${child.id}`)}
                                className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
                                        {child.full_name?.[0] || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 truncate">{child.full_name}</h3>
                                        <p className="text-xs text-gray-500">{child.admission_number}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1"><Award size={12} /> Grade</span>
                                        <span className="font-medium text-gray-800">
                                            {child.current_grade_name || 'N/A'}
                                            {child.current_stream_name ? ` (${child.current_stream_name})` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1"><CreditCard size={12} /> Fee Balance</span>
                                        <span className={`font-bold ${(child.fee_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {fmtCurrency(child.fee_balance)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                        <Users size={36} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No children found</p>
                    </div>
                )}
            </motion.div>
        </ParentLayout>
    );
};

export default ParentChildren;
