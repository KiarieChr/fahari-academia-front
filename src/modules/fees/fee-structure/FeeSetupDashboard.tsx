import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, LayoutGrid, Loader2 } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

// Lazy-load the two tab contents (Fee Structure is default, Templates deferred)
const FeeStructureTab = lazy(() =>
    import('./FeeStructureDashboard').then(m => ({ default: m.FeeStructureTab }))
);
const FeeTemplateTab = lazy(() =>
    import('../fee-templates/FeeTemplateDashboard').then(m => ({ default: m.FeeTemplateTab }))
);

/* ── Skeleton loader ─────────────────────────────────────────────── */
const SkeletonPulse = ({ h = '1rem', w = '100%', r = '8px', mb = '0' }) => (
    <div
        style={{
            height: h, width: w, borderRadius: r, marginBottom: mb,
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'feeSkeletonShimmer 1.4s infinite linear',
        }}
    />
);

const TabSkeleton = () => (
    <div style={{ padding: '1.5rem' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <SkeletonPulse h="0.75rem" w="60%" mb="0.75rem" />
                    <SkeletonPulse h="1.5rem" w="45%" mb="0.5rem" />
                    <SkeletonPulse h="0.6rem" w="80%" />
                </div>
            ))}
        </div>
        {/* Filter row */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            {[0, 1, 2, 3].map(i => <SkeletonPulse key={i} h="2.25rem" r="8px" />)}
        </div>
        {/* Table rows */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <SkeletonPulse h="2rem" mb="1rem" />
            {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <SkeletonPulse h="1rem" w="30%" />
                    <SkeletonPulse h="1rem" w="20%" />
                    <SkeletonPulse h="1rem" w="15%" />
                    <SkeletonPulse h="1rem" w="15%" />
                    <SkeletonPulse h="1rem" w="12%" />
                </div>
            ))}
        </div>
    </div>
);

/* ── Main Component ──────────────────────────────────────────────── */
const TABS = [
    { id: 'structure', label: 'Fee Structure', icon: LayoutGrid },
    { id: 'templates', label: 'Fee Templates', icon: Layers },
];

const FeeSetupDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Read tab from ?tab= query param, default to 'structure'
    const getTabFromUrl = () => {
        const params = new URLSearchParams(location.search);
        const t = params.get('tab');
        return TABS.find(tab => tab.id === t) ? t : 'structure';
    };

    const [activeTab, setActiveTab] = useState(getTabFromUrl);
    // Track which tabs have been activated — for lazy initialisation
    const [activatedTabs, setActivatedTabs] = useState(() => new Set([getTabFromUrl()]));

    // Sync tab to URL
    useEffect(() => {
        const t = getTabFromUrl();
        if (t !== activeTab) setActiveTab(t);
    }, [location.search]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setActivatedTabs(prev => new Set([...prev, tabId]));
        const params = new URLSearchParams(location.search);
        if (tabId === 'structure') {
            params.delete('tab');
        } else {
            params.set('tab', tabId);
        }
        const newSearch = params.toString();
        navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
    };

    return (
        <DashboardLayout title="Fee Setup">
            <style>{`
                @keyframes feeSkeletonShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .fee-setup-tab-nav {
                    display: flex;
                    gap: 0;
                    border-bottom: 2px solid #e5e7eb;
                    margin-bottom: 1.5rem;
                    background: #fff;
                    border-radius: 12px 12px 0 0;
                    padding: 0 1rem;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                }
                .fee-setup-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 0.85rem 1.4rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                    border: none;
                    background: none;
                    cursor: pointer;
                    position: relative;
                    transition: color 150ms ease;
                    white-space: nowrap;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                }
                .fee-setup-tab-btn:hover {
                    color: #4f46e5;
                }
                .fee-setup-tab-btn.active {
                    color: #4f46e5;
                    border-bottom-color: #4f46e5;
                }
                .fee-setup-tab-btn .tab-icon {
                    opacity: 0.7;
                    transition: opacity 150ms;
                }
                .fee-setup-tab-btn.active .tab-icon,
                .fee-setup-tab-btn:hover .tab-icon {
                    opacity: 1;
                }
                .fee-tab-pane {
                    display: none;
                }
                .fee-tab-pane.active {
                    display: block;
                }
            `}</style>

            {/* ── Tab Navigation ── */}
            <div className="fee-setup-tab-nav">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`fee-setup-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <Icon size={15} className="tab-icon" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Panels — keep both mounted once activated so state is preserved ── */}
            <div className={`fee-tab-pane ${activeTab === 'structure' ? 'active' : ''}`}>
                {activatedTabs.has('structure') && (
                    <Suspense fallback={<TabSkeleton />}>
                        <FeeStructureTab />
                    </Suspense>
                )}
            </div>

            <div className={`fee-tab-pane ${activeTab === 'templates' ? 'active' : ''}`}>
                {activatedTabs.has('templates') && (
                    <Suspense fallback={<TabSkeleton />}>
                        <FeeTemplateTab />
                    </Suspense>
                )}
            </div>
        </DashboardLayout>
    );
};

export default FeeSetupDashboard;
