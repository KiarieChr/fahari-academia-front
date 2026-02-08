import React from 'react';
import CurriculumSetup from '../CurriculumSetup';
import CurriculumLevelSetup from '../CurriculumLevelSetup';
import ClassStreamSetup from '../ClassStreamSetup';

const CurriculumSetupTab = () => {
    return (
        <div className="space-y-12">
            <CurriculumSetup />
            <hr className="border-gray-200" />
            <CurriculumLevelSetup />
            <hr className="border-gray-200" />
            <ClassStreamSetup />
        </div>
    );
};

export default CurriculumSetupTab;
