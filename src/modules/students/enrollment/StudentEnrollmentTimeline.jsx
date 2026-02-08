import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ArrowRight, Calendar, BookOpen, Users } from 'lucide-react';
import studentSettingsService from '../../../services/studentSettingsService';

const StudentEnrollmentTimeline = ({ studentId }) => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchTimeline();
        }
    }, [studentId]);

    const fetchTimeline = async () => {
        try {
            setLoading(true);
            const response = await studentSettingsService.getStudentTimeline(studentId);
            setTimeline(response.data.timeline || []);
            setError(null);
        } catch (err) {
            setError('Failed to load enrollment timeline');
            console.error('Timeline fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-300',
            promoted: 'bg-blue-100 text-blue-800 border-blue-300',
            repeated: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            transferred_out: 'bg-purple-100 text-purple-800 border-purple-300',
            completed: 'bg-gray-100 text-gray-800 border-gray-300',
            withdrawn: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'promoted':
                return <ArrowRight className="w-4 h-4" />;
            case 'repeated':
                return <RefreshCw className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading timeline...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (timeline.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No enrollment history found for this student.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Timeline</h3>
                <button
                    onClick={fetchTimeline}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline items */}
                <div className="space-y-6">
                    {timeline.map((enrollment, index) => (
                        <div key={enrollment.id} className="relative flex gap-4">
                            {/* Timeline dot */}
                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${enrollment.is_active ? 'bg-green-500' : 'bg-gray-300'
                                }`}>
                                {getStatusIcon(enrollment.status)}
                            </div>

                            {/* Content card */}
                            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{enrollment.grade}</h4>
                                        <p className="text-sm text-gray-600">{enrollment.curriculum}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(enrollment.status)}`}>
                                        {enrollment.status_display}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{enrollment.academic_year} - {enrollment.term}</span>
                                    </div>
                                    {enrollment.stream && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{enrollment.stream}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        {enrollment.type_display}
                                    </span>
                                    <div className="flex gap-4">
                                        <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                                        {enrollment.exit_date && (
                                            <span>Exited: {new Date(enrollment.exit_date).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentEnrollmentTimeline;
