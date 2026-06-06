import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Save, CheckCircle, School, Book, Clock, Users, LayoutTemplate, FileText, Check } from 'lucide-react';
import { toast } from 'react-toastify';

// Import Steps
import AcademicSetupStep from './steps/AcademicSetupStep';
import ClassStructureStep from './steps/ClassStructureStep';
import TimeSlotsStep from './steps/TimeSlotsStep';
import SubjectsAllocationStep from './steps/SubjectsAllocationStep';
import TeacherAssignmentStep from './steps/TeacherAssignmentStep';
import RoomAllocationStep from './steps/RoomAllocationStep';
import ReviewPublishStep from './steps/ReviewPublishStep';

const STEPS = [
    { id: 1, title: 'Academic Setup', icon: School, component: AcademicSetupStep },
    { id: 2, title: 'Class Structure', icon: LayoutTemplate, component: ClassStructureStep },
    { id: 3, title: 'Time Slots', icon: Clock, component: TimeSlotsStep },
    { id: 4, title: 'Subjects', icon: Book, component: SubjectsAllocationStep },
    { id: 5, title: 'Teachers', icon: Users, component: TeacherAssignmentStep },
    { id: 6, title: 'Rooms', icon: LayoutTemplate, component: RoomAllocationStep },
    { id: 7, title: 'Review', icon: CheckCircle, component: ReviewPublishStep },
];

const CreateTimetablePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        academicYear: '2026',
        term: 'Term 1',
        name: '',
        status: 'Draft',
        selectedClasses: ['Grade 1'],
        timeSlots: null // Will be populated by default in step component if null
    });

    const updateData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            // Publish Logic
            toast.success("Timetable Published Successfully!");
            navigate('/dashboard/students/class-times');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        } else {
            navigate('/dashboard/students/class-times');
        }
    };

    const handleSaveDraft = () => {
        toast.success("Draft saved successfully");
    };

    const CurrentComponent = STEPS[currentStep - 1].component;
    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20">
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard/students/class-times')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <ChevronLeft size={20} className="text-slate-500" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create Timetable</h1>
                                <span className="text-xs text-slate-500">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveDraft}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Save size={16} /> <span className="hidden sm:inline">Save Draft</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stepper Navigation (Desktop) */}
                <div className="hidden lg:flex justify-between items-center mb-10 px-4">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-24 group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/20' :
                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                        'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-400'
                                    }`}>
                                    {isCompleted ? <Check size={20} /> : <Icon size={18} />}
                                </div>
                                <span className={`text-xs font-semibold mt-2 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' :
                                    isCompleted ? 'text-green-600 dark:text-green-400' :
                                        'text-slate-400'
                                    }`}>
                                    {step.title}
                                </span>

                                {/* Connector */}
                                {index < STEPS.length - 1 && (
                                    <div className={`absolute top-5 left-1/2 w-[calc(100%+5rem)] h-[2px] -z-10 ${step.id < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`} style={{ left: '50%', width: `calc((100vw - 4rem) / ${STEPS.length})`, maxWidth: '200px' }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CurrentComponent data={formData} updateData={updateData} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-30 lg:pl-64">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${currentStep === 1
                            ? 'text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-500'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={handleNext}
                        className={`px-8 py-2.5 text-sm font-bold text-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${currentStep === STEPS.length
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-green-900/30'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/30'
                            }`}
                    >
                        {currentStep === STEPS.length ? 'Publish Timetable' : 'Next Step'}
                        {currentStep === STEPS.length ? <CheckCircle size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTimetablePage;

