import React from 'react';
import CurriculumSetup from '../../../../academics/settings/components/CurriculumSetup';
import CurriculumLevelSetup from '../CurriculumLevelSetup';
import ClassStreamSetup from '../../../../academics/settings/components/ClassStreamSetup';

const CurriculumSetupTab = () => {
    return (
        <div className="space-y-12 p-4">
            <CurriculumSetup />
            <hr className="border-gray-200" />
            <CurriculumLevelSetup />
            <hr className="border-gray-200" />
            <ClassStreamSetup />
        </div>
    );
};

export default CurriculumSetupTab;
