import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
                <GradingHeader
                    curricula={curricula}
                    activeCurriculum={activeCurriculum}
                    setActiveCurriculum={setActiveCurriculum}
                />

                <GradingSummaryCards scales={scales} activeScales={activeScales} loading={loading} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                                <p className="text-slate-500">Loading grading scales...</p>
                            </div>
                        ) : activeScales.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                                <p className="text-slate-500">No grading scales found for this curriculum.</p>
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
        </DashboardLayout>
    );
};

export default GradingSystemDashboard;
