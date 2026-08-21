import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import GradingHeader from './components/GradingHeader';
import GradingSummaryCards from './components/GradingSummaryCards';
import GradingScaleTable from './components/GradingScaleTable';
import GradingSimulator from './components/GradingSimulator';
import { examService } from '../../../services/examService';

const GradingSystemDashboard = () => {
    const [scales, setScales] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [activeCurriculum, setActiveCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchScales = async () => {
        try {
            setLoading(true);
            const data = await examService.getGradingScales();
            const list = data.results || data;
            setScales(list);

            // Extract unique curricula
            const currMap = {};
            list.forEach(s => {
                if (!currMap[s.curriculum]) {
                    currMap[s.curriculum] = { id: s.curriculum, name: s.curriculum_name, code: s.curriculum_code };
                }
            });
            const currList = Object.values(currMap);
            setCurricula(currList);
            if (currList.length > 0 && !activeCurriculum) {
                setActiveCurriculum(currList[0].id);
            }
        } catch (err) {
            toast.error('Failed to load grading scales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchScales(); }, []);

    const activeScales = scales.filter(s => s.curriculum === activeCurriculum);
    const activeCurrCode = curricula.find(c => c.id === activeCurriculum)?.code || '';

    return (
        <DashboardLayout title="Grading System">
            <div className="min-h-screen neo-bg pb-20 relative">
                <div className="p-3 space-y-6 max-w-[1600px] mx-auto">
                    <GradingHeader
                        curricula={curricula}
                        activeCurriculum={activeCurriculum}
                        setActiveCurriculum={setActiveCurriculum}
                    />

                    <GradingSummaryCards scales={scales} activeScales={activeScales} loading={loading} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {loading ? (
                                <div className="neo-card border-none p-12 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">Loading grading scales...</p>
                                </div>
                            ) : activeScales.length === 0 ? (
                                <div className="neo-card border-none p-12 text-center flex flex-col items-center justify-center">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                                        <AlertCircle size={32} />
                                    </div>
                                    <p className="text-slate-700 font-bold text-lg mb-2">No grading scales found for this curriculum.</p>
                                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                                        To set up grading scales, please navigate to the 
                                        <span className="font-bold mx-1">Settings</span> 
                                        module under Student Management and configure the grading assessments.
                                    </p>
                                </div>
                            ) : (
                                activeScales.map(scale => (
                                    <GradingScaleTable
                                        key={scale.id}
                                        scale={scale}
                                        onUpdate={fetchScales}
                                    />
                                ))
                            )}
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <GradingSimulator
                                scales={activeScales}
                                curriculumCode={activeCurrCode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GradingSystemDashboard;
