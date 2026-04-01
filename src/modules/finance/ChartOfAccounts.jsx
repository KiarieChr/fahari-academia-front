import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Download,
    Upload,
    ChevronDown,
    ChevronRight,
    Filter,
    MoreVertical,
    Building2,
    Briefcase,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Settings2,
    Archive,
    History
} from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { financeService } from '../../services/financeService';
import AccountModal from './AccountModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChartOfAccounts.css';



const ChartOfAccounts = () => {
    const [expandedRows, setExpandedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAccountModal, setShowAccountModal] = useState(false);

    // Data States
    const [accounts, setAccounts] = useState([]);
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        assets: 0,
        income: 0,
        expenses: 0,
        unposted: 0
    });
    const [fiscalYear, setFiscalYear] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Accounts (Full Structure) and Trial Balance (for balances)
            const [accResult, tbResult, fyResult] = await Promise.allSettled([
                financeService.getStructure(),
                financeService.getTrialBalance(),
                financeService.getFiscalPeriods()
            ]);

            if (accResult.status === 'rejected') {
                throw accResult.reason || new Error('Failed to load accounts');
            }

            const accRes = accResult.value;
            const tbRes = tbResult.status === 'fulfilled' ? tbResult.value : { lines: [] };

            // API Service returns payload directly, unlike axios
            const accountList = Array.isArray(accRes) ? accRes : (accRes.results || accRes.data || []);
            // Trial Balance might be { lines: [...] } or just [...] depending on implementation.
            // Let's assume response body has 'lines' or is the list itself.
            const tbData = Array.isArray(tbRes) ? tbRes : (tbRes.lines || tbRes.data?.lines || []);

            // Map TB balances for O(1) lookup
            const balanceMap = {};
            let totalAssets = 0;
            let totalIncome = 0;
            let totalExpenses = 0;

            tbData.forEach(line => {
                const net = parseFloat(line.net_balance || 0);
                balanceMap[line.account_id] = net;

                // For stats, we assume TB contains all active accounts.
                // Summing them up gives the correct total.
                // Flipping signs for Credit-normal types for display.
                if (line.type === 'ASSET') totalAssets += net;
                if (line.type === 'INCOME') totalIncome += (net * -1); // Flip
                if (line.type === 'EXPENSE') totalExpenses += net;
            });

            // Find current open fiscal period
            if (fyResult.status === 'fulfilled') {
                const periods = Array.isArray(fyResult.value) ? fyResult.value : (fyResult.value?.results || []);
                const today = new Date().toISOString().split('T')[0];
                const current = periods.find(p => !p.is_closed && p.start_date <= today && p.end_date >= today)
                    || periods.find(p => !p.is_closed)
                    || periods[0];
                setFiscalYear(current || null);
            }

            setAccounts(accountList);
            setBalances(balanceMap);
            setStats({
                assets: totalAssets,
                income: totalIncome,
                expenses: totalExpenses,
                unposted: 0
            });

            // Auto-expand groups and roots
            const typeIds = ['type-ASSET', 'type-LIABILITY', 'type-EQUITY', 'type-INCOME', 'type-EXPENSE'];
            const subTypeIds = new Set();
            const accountIds = new Set();

            accountList.forEach(acc => {
                if (!acc.parent) {
                    subTypeIds.add(`subtype-${acc.type}-${acc.sub_type}`);
                }
                if (accountList.some(child => child.parent === acc.id)) {
                    accountIds.add(acc.id);
                }
            });

            setExpandedRows([...typeIds, ...Array.from(subTypeIds), ...Array.from(accountIds)]);

        } catch (error) {
            console.error("Failed to load Finance data:", error);
            toast.error("Failed to load Chart of Accounts: " + (error.message || "Unknown Error"));
        } finally {
            setLoading(false);
        }
    };

    // Transform flat list to tree with consolidated balances
    const accountTree = useMemo(() => {
        if (!accounts.length) return [];

        // If searching, return flat list (simple view)
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return accounts.filter(a =>
                a.name.toLowerCase().includes(lower) ||
                a.code.includes(lower)
            ).map(a => ({
                ...a,
                children: [],
                balance: balances[a.id] || 0
            }));
        }

        // 1. Build Standard Parent-Child Map
        const map = {};
        const roots = [];

        // Init map with all accounts
        accounts.forEach(acc => {
            map[acc.id] = { ...acc, children: [], balance: 0 };
        });

        // Link children to parents
        accounts.forEach(acc => {
            if (acc.parent && map[acc.parent]) {
                map[acc.parent].children.push(map[acc.id]);
            } else {
                roots.push(map[acc.id]);
            }
        });

        // 2. Recursive Balance Calculation
        // Sums children into parent.balance
        const computeBalance = (node) => {
            // Start with direct balance from TB
            let total = balances[node.id] || 0;

            // Add children
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    total += computeBalance(child);
                });
            }

            node.balance = total;
            return total;
        };

        // Compute for all roots (this propagates down the tree)
        roots.forEach(root => computeBalance(root));

        // 3. Group by Type
        const typeGroups = {};

        // Helper to get group or create
        const getGroup = (type, subType) => {
            if (!typeGroups[type]) {
                typeGroups[type] = {
                    id: `type-${type}`,
                    code: '',
                    name: type,
                    type: type,
                    isGroup: true,
                    children: {},
                    balance: 0
                };
            }
            if (!typeGroups[type].children[subType]) {
                typeGroups[type].children[subType] = {
                    id: `subtype-${type}-${subType}`,
                    code: '',
                    name: subType || 'General',
                    type: type,
                    sub_type: subType,
                    isGroup: true,
                    isSubType: true,
                    children: [],
                    balance: 0
                };
            }
            return typeGroups[type].children[subType];
        };

        roots.forEach(root => {
            const group = getGroup(root.type, root.sub_type);
            group.children.push(root);

            // Add cumulative root balance to group
            group.balance += root.balance;
            typeGroups[root.type].balance += root.balance;
        });

        // Convert Groups to Array
        const tree = Object.values(typeGroups).map(tGroup => {
            const subTypes = Object.values(tGroup.children).map(stGroup => {
                stGroup.children.sort((a, b) => a.code.localeCompare(b.code));
                return stGroup;
            });
            tGroup.children = subTypes.sort((a, b) => a.name.localeCompare(b.name));
            return tGroup;
        });

        const typeOrder = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
        return tree.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));

    }, [accounts, balances, searchTerm]);

    const toggleRow = (id) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 2
    }).format(val || 0);

    const kpiCards = [
        { label: 'Total Assets', value: formatKES(stats.assets), icon: <Building2 size={20} className="text-primary" />, border: 'border-primary' },
        { label: 'Total Income', value: formatKES(stats.income), icon: <TrendingUp size={20} className="text-success" />, border: 'border-success' },
        { label: 'Total Expenses', value: formatKES(stats.expenses), icon: <TrendingDown size={20} className="text-danger" />, border: 'border-danger' },
    ];

    // ... State ...
    const [selectedAccount, setSelectedAccount] = useState(null);

    // ... Logic ...

    const handleCreate = () => {
        setSelectedAccount(null);
        setShowAccountModal(true);
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setShowAccountModal(true);
    };

    const handleSave = () => {
        fetchData(); // Refresh tree
    };

    const AccountTreeRow = ({ account, level = 0 }) => {
        const hasChildren = account.children && account.children.length > 0;
        const isExpanded = expandedRows.includes(account.id);

        // Use pre-calculated recursive balance
        let balance = account.balance || 0;

        // Visual sign flip for Credit-normal accounts
        // We want positive numbers for display usually
        if (['LIABILITY', 'EQUITY', 'INCOME'].includes(account.type)) {
            balance *= -1;
        }

        // Check if this is a Virtual Group Node
        if (account.isGroup) {
            return (
                <>
                    <tr
                        className={`coa-group-row bg-light fw-bold`}
                        onClick={() => toggleRow(account.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <td className={`coa-tree-cell ${level > 0 ? `indent-${level}` : ''}`}>
                            <div className="d-flex align-items-center gap-2">
                                <div className="coa-expander">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <span className="text-uppercase small text-muted">{account.name}</span>
                            </div>
                        </td>
                        <td colSpan="2"></td>
                        <td className={`coa-tree-cell text-end fw-bold ${['INCOME', 'ASSET'].includes(account.type) ? 'text-primary' : 'text-danger'}`}>
                            {formatKES(balance)}
                        </td>
                        <td></td>
                    </tr>
                    {isExpanded && account.children.map(child => (
                        <AccountTreeRow key={child.id} account={child} level={level + 1} />
                    ))}
                </>
            );
        }

        return (
            <>
                <tr
                    className={`coa-tree-row row-level-${level}`}
                    onDoubleClick={() => handleEdit(account)}
                    style={{ cursor: 'pointer' }}
                    title="Double click to edit"
                >
                    <td className={`coa-tree-cell ${level > 0 ? `indent-${level}` : ''}`}>
                        <div className="d-flex align-items-center gap-2">
                            {hasChildren && !searchTerm ? (
                                <div className="coa-expander" onClick={(e) => { e.stopPropagation(); toggleRow(account.id); }}>
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                            ) : <div style={{ width: 24 }} />}
                            <span className="text-secondary small fw-bold font-monospace">{account.code}</span>
                        </div>
                    </td>
                    <td className="coa-tree-cell">{account.name}</td>
                    <td className="coa-tree-cell">
                        <span className={`coa-badge badge-${(account.type || 'ASSET').toLowerCase()}`}>
                            {account.type_display || account.type}
                            {account.sub_type_display && <span className="ms-1 text-muted opacity-50">• {account.sub_type_display}</span>}
                        </span>
                    </td>
                    <td className={`coa-tree-cell text-end fw-bold ${['INCOME', 'ASSET'].includes(account.type) ? 'text-primary' : 'text-danger'}`}>
                        {formatKES(balance)}
                    </td>
                    <td className="coa-tree-cell text-end">
                        <div className="dropdown">
                            <button className="btn btn-sm btn-link text-muted p-0" data-bs-toggle="dropdown" onClick={e => e.stopPropagation()}>
                                <MoreVertical size={16} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                <li><button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleEdit(account)}><Settings2 size={14} /> Edit Account</button></li>
                            </ul>
                        </div>
                    </td>
                </tr>
                {hasChildren && isExpanded && !searchTerm && account.children.map(child => (
                    <AccountTreeRow key={child.id} account={child} level={level + 1} />
                ))}
            </>
        );
    };

    return (
        <DashboardLayout title="Chart of Accounts">
            <div className="coa-v2-dashboard">
                {/* Header ... */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Chart of Accounts</h2>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span>Fiscal Year: {fiscalYear ? fiscalYear.name : 'Not Set'}</span>
                            <span className={`fw-semibold d-flex align-items-center gap-1 ${fiscalYear && !fiscalYear.is_closed ? 'text-success' : 'text-warning'}`}>
                                <CheckCircle2 size={12} /> {fiscalYear && !fiscalYear.is_closed ? 'Books Open' : 'Books Closed'}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 px-3">
                            <History size={16} /> Audit Trail
                        </button>
                        <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3 shadow-sm"
                            onClick={handleCreate}
                        >
                            <Plus size={18} /> New Account
                        </button>
                    </div>
                </div>

                {/* KPI ... */}
                <div className="coa-kpi-grid">
                    {kpiCards.map((card, i) => (
                        <div key={i} className={`coa-kpi-card border-start border-4 ${card.border}`}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="coa-kpi-label">{card.label}</span>
                                {card.icon}
                            </div>
                            <span className="coa-kpi-value">{card.value}</span>
                        </div>
                    ))}
                </div>

                {/* Ledger Container */}
                <div className="coa-ledger-container">
                    <div className="coa-toolbar">
                        <div className="coa-search-wrapper">
                            <Search size={16} className="coa-search-icon" />
                            <input
                                type="text"
                                className="coa-search-input"
                                placeholder="Search by name, code or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="p-5 text-center text-muted">Loading Accounts...</div>
                        ) : (
                            <table className="coa-tree-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '200px' }}>Account Code</th>
                                        <th>Description</th>
                                        <th style={{ width: '250px' }}>Account Type</th>
                                        <th className="text-end pe-4" style={{ width: '250px' }}>Balance (KES)</th>
                                        <th style={{ width: '80px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountTree.map(account => (
                                        <AccountTreeRow key={account.id} account={account} />
                                    ))}
                                    {accountTree.length === 0 && (
                                        <tr><td colSpan="5" className="text-center p-4">No accounts found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <AccountModal
                show={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                onSave={handleSave}
                account={selectedAccount}
                accounts={accounts}
            />
            <ToastContainer position="top-right" autoClose={3000} />
        </DashboardLayout>
    );
};

export default ChartOfAccounts;
