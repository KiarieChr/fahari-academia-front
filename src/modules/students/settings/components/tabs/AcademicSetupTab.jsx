import React from 'react';
import AcademicYearSetup from '../AcademicYearSetup';
import TermSetup from '../TermSetup';

const AcademicSetupTab = () => {
    return (
        <div className="space-y-12">
            <AcademicYearSetup />
            <hr className="border-gray-200" />
            <TermSetup />
        </div>
    );
};

export default AcademicSetupTab;
