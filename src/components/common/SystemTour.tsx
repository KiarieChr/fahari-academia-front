import React from 'react';
import { Joyride, STATUS } from 'react-joyride';

const SystemTour = ({ run, onFinish }) => {
    const steps = [
        {
            target: '[data-tour="menu-toggle"]',
            title: 'Navigation Menu',
            content: 'Use this button to open and close the main sidebar menu.',
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-nav"]',
            title: 'Main Modules',
            content: 'This sidebar gives you quick access to Students, Finance, HR, Payroll, and other modules.',
        },
        {
            target: '[data-tour="header-title"]',
            title: 'Current Workspace',
            content: 'This area shows your current page and where you are in the system.',
        },
        {
            target: '[data-tour="notifications"]',
            title: 'Notifications',
            content: 'Check alerts and important updates here.',
        },
        {
            target: '[data-tour="theme-toggle"]',
            title: 'Theme Toggle',
            content: 'Switch between light and dark mode anytime.',
        },
        {
            target: '[data-tour="user-profile"]',
            title: 'Your Account',
            content: 'View your identity details here and use account pages for profile and security settings.',
        },
        {
            target: '[data-tour="content-area"]',
            title: 'Work Area',
            content: 'This is your main working area where dashboards, forms, and reports are displayed.',
        },
    ];

    return (
        <Joyride
            run={run}
            steps={steps}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            disableScrolling={false}
            callback={(data) => {
                const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
                if (finishedStatuses.includes(data.status)) {
                    onFinish?.(data.status);
                }
            }}
            styles={{
                options: {
                    zIndex: 30000,
                    primaryColor: '#3f51b5',
                    textColor: '#1e293b',
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                },
                buttonNext: {
                    backgroundColor: '#3f51b5',
                },
                buttonBack: {
                    color: '#64748b',
                },
                buttonSkip: {
                    color: '#64748b',
                },
            }}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next',
                skip: 'Skip',
            }}
        />
    );
};

export default SystemTour;
