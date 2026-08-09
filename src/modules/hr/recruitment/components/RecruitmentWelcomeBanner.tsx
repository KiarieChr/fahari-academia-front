import React from 'react';
import { motion } from 'framer-motion';

const RecruitmentWelcomeBanner = ({ newApplicationsCount = 0, userName = 'HR' }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-primary text-white rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg mb-6"
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-32 -mb-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-white max-w-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                        Hello {userName}!
                    </h2>
                    <p className="text-slate-100 text-sm sm:text-base leading-relaxed mb-4">
                        You have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">{newApplicationsCount} new applications</span>. 
                        It is a lot of work for today! So let's start 🤔
                    </p>
                    <button className="text-sm font-semibold text-white underline decoration-slate-300 hover:decoration-white transition-all underline-offset-4">
                        review it!
                    </button>
                </div>
                
                {/* Illustration Placeholder / Abstract art for the user */}
                <div className="hidden sm:block">
                    <div className="w-40 h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                        {/* Could replace with actual SVG illustration */}
                        <div className="relative w-full h-full">
                            <div className="absolute inset-x-4 bottom-4 h-16 bg-white/20 rounded-xl"></div>
                            <div className="absolute top-4 right-4 w-12 h-12 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RecruitmentWelcomeBanner;
