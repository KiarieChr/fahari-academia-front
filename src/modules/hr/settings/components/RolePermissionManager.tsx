
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Edit2, Users, MoreHorizontal, Check } from 'lucide-react';

const RolePermissionManager = ({ roles }) => {
    return (
        <div className="space-y-4">
            {roles.map((role) => (
                <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.005 }}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{role.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{role.description}</p>

                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                        <Users size={12} />
                                        <span>{role.userCount} Users</span>
                                    </div>
                                    <div className="flex -space-x-1.5">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />
                                        ))}
                                        {(role.userCount > 3) && (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-300 font-bold">
                                                +{role.userCount - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100">
                                <Edit2 size={16} />
                            </button>
                            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Permissions
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}

            <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-500 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                + Create New Role
            </button>
        </div>
    );
};

export default RolePermissionManager;
