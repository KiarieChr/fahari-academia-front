import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

const StudentManagement = () => {
    return (
        <DashboardLayout title="Student Management">
            <div className="module-content">
                <h2>Student Management Module</h2>
                <p>Manage admissions, student records, and attendance.</p>
            </div>
        </DashboardLayout>
    );
};

export default StudentManagement;
