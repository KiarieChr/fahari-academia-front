import DashboardLayout from '../../dashboard/DashboardLayout';
;
import { Download, Upload } from 'lucide-react';
import StatutoryBodiesTable from './components/statutory/StatutoryBodiesTable';
import PayeConfig from './components/statutory/PayeConfig';
import SocialFundsConfig from './components/statutory/SocialFundsConfig';
import StatutoryRemittance from './components/statutory/StatutoryRemittance';

const StatutoryDashboard = () => {
    return (
        <DashboardLayout title="Statutory Settings">
            

            <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10 custom-scrollbar">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4 mb-2">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Statutory Compliance</h2>
                        <p className="text-sm text-gray-500">Manage Tax (PAYE), NSSF, NHIF/SHA & Statutory Returns</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                            <Upload size={16} /> Import New Rates
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                            <Download size={16} /> Compliance Report
                        </button>
                    </div>
                </div>

                {/* 1. Registry */}
                <StatutoryBodiesTable />

                {/* 2. Tax Configuration */}
                <PayeConfig />

                {/* 3. Social Funds (NSSF, NHIF) */}
                <SocialFundsConfig />

                {/* 4. Remittance & Returns */}
                <StatutoryRemittance />

            </div>
        </DashboardLayout>
    );
};

export default StatutoryDashboard;

