import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Users } from 'lucide-react';
import studentSettingsService from '../../../../../services/studentSettingsService';
import { toast } from 'react-toastify';

const CalendarTab = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentSettingsService.getCalendar()
            .then(res => setEvents(res.results || res))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">School Calendar</h3>
                    <p className="text-sm text-gray-500">Manage holidays, exams, and important school events</p>
                </div>
                <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm">
                    <Plus size={18} /> Add Event
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No school events scheduled yet.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${event.event_type === 'holiday' ? 'bg-orange-50 text-orange-600' :
                                    event.event_type === 'exam' ? 'bg-red-50 text-red-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                    <Calendar size={20} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${event.event_type === 'holiday' ? 'bg-orange-100 text-orange-700' :
                                    event.event_type === 'exam' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {event.event_type}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 truncate">{event.event_name}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock size={14} />
                                    <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users size={14} />
                                    <span>{event.all_students ? 'All Students' : event.curriculum_name || 'Specific Group'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CalendarTab;

