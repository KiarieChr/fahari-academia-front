import React, { useState } from 'react';
import { ArrowLeft, Save, GraduationCap, Layers, Book, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AddLearningAreaModal from './modals/AddLearningAreaModal';
import AddDepartmentModal from './modals/AddDepartmentModal';

const CurriculumSettings = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
    const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

    // Mock Data
    const [learningAreas, setLearningAreas] = useState([
        { id: 1, name: 'Sciences', head: 'Mr. Omondi', subjects: 4 },
        { id: 2, name: 'Languages', head: 'Mrs. Wanjiku', subjects: 3 },
        { id: 3, name: 'Humanities', head: 'Mr. Kamau', subjects: 5 },
        { id: 4, name: 'Technical', head: 'Ms. Atieno', subjects: 2 },
    ]);

    const [departments, setDepartments] = useState([
        { id: 1, name: 'Mathematics Department', hod: 'Mr. Peter', members: 8 },
        { id: 2, name: 'Languages Department', hod: 'Mrs. Mary', members: 12 },
        { id: 3, name: 'Science Department', hod: 'Dr. John', members: 10 },
    ]);

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const handleAddArea = (newArea) => {
        setLearningAreas([...learningAreas, {
            id: learningAreas.length + 1,
            name: newArea.name,
            head: newArea.head,
            subjects: 0
        }]);
    };

    const handleAddDept = (newDept) => {
        setDepartments([...departments, {
            id: departments.length + 1,
            name: newDept.name,
            hod: newDept.hod,
            members: newDept.members || 0
        }]);
    };

    const handleDeleteDept = (id) => {
        if (confirm("Are you sure you want to delete this department?")) {
            setDepartments(departments.filter(d => d.id !== id));
            toast.success("Department removed");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-2 text-sm font-medium"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Curriculum Settings</h2>
                    <p className="text-gray-500">Configure learning areas, departments, and general preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 space-y-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                            }`}
                    >
                        <Book size={18} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('areas')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'areas' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                            }`}
                    >
                        <Layers size={18} /> Learning Areas
                    </button>
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'departments' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                            }`}
                    >
                        <GraduationCap size={18} /> Departments
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 min-h-[400px]">
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">General Configuration</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Auto-Assign Subjects</h4>
                                        <p className="text-xs text-gray-500">Automatically assign compulsory subjects when enrolling students</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Default Curriculum</label>
                                    <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                        <option>Competency Based Curriculum (CBC)</option>
                                        <option>8-4-4 System</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> Applied to new student admissions by default
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'areas' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <h3 className="text-lg font-bold text-gray-900">Learning Areas</h3>
                                <button
                                    onClick={() => setIsAddAreaOpen(true)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    + Add Area
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {learningAreas.map((area) => (
                                    <div key={area.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                <Layers size={20} />
                                            </div>
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">ID: {area.id}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900">{area.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">HOD: {area.head}</p>
                                        <div className="mt-3 text-xs font-medium text-gray-400">
                                            {area.subjects} Subjects Linked
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'departments' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <h3 className="text-lg font-bold text-gray-900">Departments Setup</h3>
                                <button
                                    onClick={() => setIsAddDeptOpen(true)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    + New Department
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-all relative group">
                                        <button
                                            onClick={() => handleDeleteDept(dept.id)}
                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{dept.name}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Academic</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
                                                <span className="text-gray-500">HOD</span>
                                                <span className="font-medium text-gray-800">{dept.hod || 'Unassigned'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
                                                <span className="text-gray-500">Members</span>
                                                <span className="font-medium text-gray-800">{dept.members} Staff</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AddLearningAreaModal
                    isOpen={isAddAreaOpen}
                    onClose={() => setIsAddAreaOpen(false)}
                    onSave={handleAddArea}
                />
                <AddDepartmentModal
                    isOpen={isAddDeptOpen}
                    onClose={() => setIsAddDeptOpen(false)}
                    onSave={handleAddDept}
                />
            </div>
        </div>
    );
};

export default CurriculumSettings;

