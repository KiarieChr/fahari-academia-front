import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TimetableGrid = ({ classLevel, stream, term, year }) => {
    const [timetableData] = useState([
        { time: '08:00 - 08:40', mon: { subject: 'Maths', teacher: 'Mr. Kipchoge', room: 'A1' }, tue: { subject: 'English', teacher: 'Ms. Cheruto', room: 'A2' }, wed: { subject: 'Science', teacher: 'Dr. Koech', room: 'Lab1' }, thu: { subject: 'Maths', teacher: 'Mr. Kipchoge', room: 'A1' }, fri: { subject: 'Social Studies', teacher: 'Mr. Ondimu', room: 'A3' } },
        { time: '08:40 - 09:20', mon: { subject: 'English', teacher: 'Ms. Cheruto', room: 'A2' }, tue: { subject: 'Maths', teacher: 'Mr. Kipchoge', room: 'A1' }, wed: { subject: 'Social Studies', teacher: 'Mr. Ondimu', room: 'A3' }, thu: { subject: 'English', teacher: 'Ms. Cheruto', room: 'A2' }, fri: { subject: 'Science', teacher: 'Dr. Koech', room: 'Lab1' } },
        { time: '09:20 - 10:00', mon: { subject: 'Science', teacher: 'Dr. Koech', room: 'Lab1' }, tue: { subject: 'Social Studies', teacher: 'Mr. Ondimu', room: 'A3' }, wed: { subject: 'Maths', teacher: 'Mr. Kipchoge', room: 'A1' }, thu: { subject: 'Science', teacher: 'Dr. Koech', room: 'Lab1' }, fri: { subject: 'English', teacher: 'Ms. Cheruto', room: 'A2' } },
        { time: '10:00 - 10:30', mon: { subject: 'BREAK', teacher: '--', room: '--', isBreak: true }, tue: { subject: 'BREAK', teacher: '--', room: '--', isBreak: true }, wed: { subject: 'BREAK', teacher: '--', room: '--', isBreak: true }, thu: { subject: 'BREAK', teacher: '--', room: '--', isBreak: true }, fri: { subject: 'BREAK', teacher: '--', room: '--', isBreak: true } },
        { time: '10:30 - 11:10', mon: { subject: 'Social Studies', teacher: 'Mr. Ondimu', room: 'A3' }, tue: { subject: 'Science', teacher: 'Dr. Koech', room: 'Lab1' }, wed: { subject: 'English', teacher: 'Ms. Cheruto', room: 'A2' }, thu: { subject: 'C.R.E', teacher: 'Mr. Kipyegon', room: 'Chapel' }, fri: { subject: 'Maths', teacher: 'Mr. Kipchoge', room: 'A1' } },
        { time: '11:10 - 11:50', mon: { subject: 'C.R.E', teacher: 'Mr. Kipyegon', room: 'Chapel' }, tue: { subject: 'P.E', teacher: 'Coach Wambua', room: 'Field' }, wed: { subject: 'Art', teacher: 'Ms. Nyambura', room: 'A5' }, thu: { subject: 'P.E', teacher: 'Coach Wambua', room: 'Field' }, fri: { subject: 'C.R.E', teacher: 'Mr. Kipyegon', room: 'Chapel' } },
    ]);

    const getSubjectColor = (subject) => {
        const colors = {
            'Maths': 'bg-blue-50 border-l-4 border-blue-500',
            'English': 'bg-green-50 border-l-4 border-green-500',
            'Science': 'bg-purple-50 border-l-4 border-purple-500',
            'Social Studies': 'bg-yellow-50 border-l-4 border-yellow-500',
            'C.R.E': 'bg-indigo-50 border-l-4 border-indigo-500',
            'P.E': 'bg-orange-50 border-l-4 border-orange-500',
            'Art': 'bg-pink-50 border-l-4 border-pink-500',
            'BREAK': 'bg-orange-100 border-l-4 border-orange-600'
        };
        return colors[subject] || 'bg-gray-50 border-l-4 border-gray-300';
    };

    const getTextColor = (subject) => {
        const colors = {
            'Maths': 'text-blue-900',
            'English': 'text-green-900',
            'Science': 'text-purple-900',
            'Social Studies': 'text-yellow-900',
            'C.R.E': 'text-indigo-900',
            'P.E': 'text-orange-900',
            'Art': 'text-pink-900',
            'BREAK': 'text-orange-900 font-bold'
        };
        return colors[subject] || 'text-gray-900';
    };

    const SlotCell = ({ slot }) => {
        if (!slot) return <td className="px-4 py-3 text-gray-400">—</td>;
        
        return (
            <td className={`px-4 py-4 ${getSubjectColor(slot.subject)}`}>
                <motion.div
                    whileHover={!slot.isBreak ? { scale: 1.02 } : {}}
                    className={`${getTextColor(slot.subject)} text-sm font-medium cursor-pointer transition-all`}
                >
                    <div className="font-semibold">{slot.subject}</div>
                    {!slot.isBreak && (
                        <>
                            <div className="text-xs opacity-75 mt-1">{slot.teacher}</div>
                            <div className="text-xs opacity-60">Room {slot.room}</div>
                        </>
                    )}
                </motion.div>
            </td>
        );
    };

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 w-24">Time</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Monday</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Tuesday</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Wednesday</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Thursday</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Friday</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {timetableData.map((row, idx) => (
                        <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={row.mon.isBreak ? 'bg-orange-50' : 'hover:bg-gray-50'}
                        >
                            <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50">
                                {row.time}
                            </td>
                            <SlotCell slot={row.mon} />
                            <SlotCell slot={row.tue} />
                            <SlotCell slot={row.wed} />
                            <SlotCell slot={row.thu} />
                            <SlotCell slot={row.fri} />
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimetableGrid;
