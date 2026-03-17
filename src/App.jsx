import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Session Provider for enhanced session management
import { SessionProvider } from './components/providers/SessionProvider';
// Loading fallback component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

/* --- Auth Components (loaded eagerly for fast initial load) --- */
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import VerifyOtp from './auth/VerifyOtp';
import ResetPassword from './auth/ResetPassword';

/* --- Layout & Dashboards --- */
import DashboardHome from './dashboard/DashboardHome';

/* --- Students Module (Lazy loaded) --- */
const StudentManagement = lazy(() => import('./modules/students/StudentManagement'));
const AdmissionBookDashboard = lazy(() => import('./modules/students/admission/AdmissionBookDashboard'));
const ClassSessionsDashboard = lazy(() => import('./modules/students/class-sessions/ClassSessionsDashboard'));
const CurriculumDashboard = lazy(() => import('./modules/students/curriculum/CurriculumDashboard'));
const StudentSettingsDashboard = lazy(() => import('./modules/students/settings/StudentSettingsDashboard'));
const ClassTimesDashboard = lazy(() => import('./modules/students/class-times/ClassTimesDashboard'));

/* --- Academics Module (Lazy loaded) --- */
const StudentAcademics = lazy(() => import('./modules/academics/StudentAcademics'));
const MarksInputDashboard = lazy(() => import('./modules/academics/marks-input/MarksInputDashboard'));

/* --- Fees Module (Lazy loaded) --- */
const StudentFees = lazy(() => import('./modules/fees/StudentFees'));
const ReceiptBookDashboard = lazy(() => import('./modules/fees/receipt-book/ReceiptBookDashboard'));
const StudentInvoicesDashboard = lazy(() => import('./modules/fees/invoices/StudentInvoicesDashboard'));
const FeeStructureDashboard = lazy(() => import('./modules/fees/fee-structure/FeeStructureDashboard'));
const FeeSettingsDashboard = lazy(() => import('./modules/fees/settings/FeeSettingsDashboard'));
const ArrearsDashboard = lazy(() => import('./modules/fees/arrears/ArrearsDashboard'));

/* --- Finance Module (Lazy loaded) --- */
const Finance = lazy(() => import('./modules/finance/Finance'));
const AccountsPayableDashboard = lazy(() => import('./modules/finance/accountsPayable/AccountsPayableDashboard'));
const ChartOfAccounts = lazy(() => import('./modules/finance/ChartOfAccounts'));
const Journals = lazy(() => import('./modules/finance/Journals'));
const FinanceReports = lazy(() => import('./modules/finance/FinanceReports'));
const FinanceSettingsDashboard = lazy(() => import('./modules/finance/settings/FinanceSettingsDashboard'));
const BudgetingDashboard = lazy(() => import('./modules/finance/budgeting/BudgetingDashboard'));

/* --- Procurement Module (Lazy loaded) --- */
const Procurement = lazy(() => import('./modules/procurement/Procurement'));
const PurchaseRequisitionDashboard = lazy(() => import('./modules/procurement/requisition/PurchaseRequisitionDashboard'));
const PurchaseOrderDashboard = lazy(() => import('./modules/procurement/purchase-order/PurchaseOrderDashboard'));
const InventoryDashboard = lazy(() => import('./modules/inventory/InventoryDashboard'));
const GRNDashboard = lazy(() => import('./modules/procurement/grn/GRNDashboard'));
const ProcurementSettings = lazy(() => import('./modules/procurement/settings/ProcurementSettings'));

/* --- HR & Other Modules (Lazy loaded) --- */
// Use new modern HR Dashboard
const HumanResource = lazy(() => import('./modules/hr/HumanResourceDashboard'));
// Use new modern Staff Register  
const StaffRegister = lazy(() => import('./modules/hr/StaffRegisterV2'));
const LeaveDashboard = lazy(() => import('./modules/hr/leave/LeaveDashboard'));
const HrSettingsDasboard = lazy(() => import('./modules/hr/settings/HrSettingsDashboard'));
const StaffAttendanceDashboard = lazy(() => import('./modules/hr/attendance/StaffAttendanceDashboard'));
const StaffPerformanceDashboard = lazy(() => import('./modules/hr/performance/StaffPerformanceDashboard'));
const Payroll = lazy(() => import('./modules/payroll/Payroll'));
const RecruitmentDashboard = lazy(() => import('./modules/hr/recruitment/RecruitmentDashboard'));
const PublicJobApplicationPage = lazy(() => import('./modules/hr/recruitment/PublicJobApplicationPage'));
const Settings = lazy(() => import('./modules/settings/Settings'));
const PayrollDashboard = lazy(() => import('./modules/payroll/PayrollDashboard'));
const EmployeeDeductionsDashboard = lazy(() => import('./modules/payroll/EmployeeDeductionsDashboard'));
const EmployeeEarningsDashboard = lazy(() => import('./modules/payroll/EmployeeEarningsDashboard'));
const FinancialInstitutionsDashboard = lazy(() => import('./modules/payroll/FinancialInstitutionsDashboard'));
const StatutorySettingsDashboard = lazy(() => import('./modules/payroll/StatutoryDashboard'));
const PayrollSettings = lazy(() => import('./modules/payroll/PayrollSettings'));

/* --- User management and Settings (Lazy loaded) --- */
const MyAccount = lazy(() => import('./modules/users/MyAccount'));
const UsersManagement = lazy(() => import('./modules/users/UsersManagement'));
const RolesManagement = lazy(() => import('./modules/users/RolesManagement'));

function App() {
  return (
    <SessionProvider>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Students Module */}
            <Route path="/dashboard/students" element={<StudentManagement />} />
            <Route path="/dashboard/students/admission" element={<AdmissionBookDashboard />} />
            <Route path="/dashboard/students/sessions" element={<ClassSessionsDashboard />} />
            <Route path="/dashboard/students/curriculums" element={<CurriculumDashboard />} />
            <Route path="/dashboard/students/settings" element={<StudentSettingsDashboard />} />
            <Route path="/dashboard/students/reports" element={<div>Student Reports Placeholder</div>} />
            <Route path="/dashboard/students/times" element={<ClassTimesDashboard />} />

            {/* Academics Module */}
            <Route path="/dashboard/academics" element={<StudentAcademics />} />
            <Route path="/dashboard/academics/marks" element={<MarksInputDashboard />} />
            <Route path="/dashboard/academics/curriculum" element={<div>Curriculum Setup Placeholder</div>} />
            <Route path="/dashboard/academics/subjects" element={<div>Subjects Placeholder</div>} />
            <Route path="/dashboard/academics/allocation" element={<div>Subject Allocation Placeholder</div>} />
            <Route path="/dashboard/academics/grading" element={<div>Grading Scheme Placeholder</div>} />
            <Route path="/dashboard/academics/reports" element={<div>Academic Reports Placeholder</div>} />
            <Route path="/dashboard/academics/settings" element={<div>Academic Settings Placeholder</div>} />

            {/* Fees Module */}
            <Route path="/dashboard/fees" element={<StudentFees />} />
            <Route path="/dashboard/fees/receipts" element={<ReceiptBookDashboard />} />
            <Route path="/dashboard/fees/invoice" element={<StudentInvoicesDashboard />} />
            <Route path="/dashboard/fees/structure" element={<FeeStructureDashboard />} />
            <Route path="/dashboard/fees/settings" element={<FeeSettingsDashboard />} />
            <Route path="/dashboard/fees/arrears" element={<ArrearsDashboard />} />

            {/* Finance Module */}
            <Route path="/dashboard/finance" element={<Finance />} />
            <Route path="/dashboard/finance/payable" element={<AccountsPayableDashboard />} />
            <Route path="/dashboard/finance/chart" element={<ChartOfAccounts />} />
            <Route path="/dashboard/finance/journals" element={<Journals />} />
            <Route path="/dashboard/finance/reports" element={<FinanceReports />} />
            <Route path="/dashboard/finance/settings" element={<FinanceSettingsDashboard />} />
            <Route path="/dashboard/finance/budgeting" element={<BudgetingDashboard />} />

            {/* Procurement Module */}
            <Route path="/dashboard/procurement" element={<Procurement />} />
            <Route path="/dashboard/procurement/requisition" element={<PurchaseRequisitionDashboard />} />
            <Route path="/dashboard/procurement/order" element={<PurchaseOrderDashboard />} />
            <Route path="/dashboard/procurement/grn" element={<GRNDashboard />} />
            <Route path="/dashboard/procurement/suppliers" element={<div>Suppliers Placeholder</div>} />
            <Route path="/dashboard/procurement/inventory" element={<InventoryDashboard />} />
            <Route path="/dashboard/procurement/journal" element={<div>Inventory Journal Placeholder</div>} />
            <Route path="/dashboard/procurement/reports" element={<div>Procurement Reports Placeholder</div>} />
            <Route path="/dashboard/procurement/egp" element={<div>EGP Placeholder</div>} />
            <Route path="/dashboard/procurement/settings" element={<ProcurementSettings />} />

            {/* HR & Other Modules */}
            <Route path="/dashboard/hr" element={<HumanResource />} />
            <Route path="/dashboard/hr/staff-register" element={<StaffRegister />} />
            <Route path="/dashboard/hr/leave" element={<LeaveDashboard />} />
            <Route path="/dashboard/hr/hr-settings" element={<HrSettingsDasboard />} />
            <Route path="/dashboard/hr/staff-attendance" element={<StaffAttendanceDashboard />} />
            <Route path="/dashboard/hr/staff-performance" element={<StaffPerformanceDashboard />} />
            <Route path="/dashboard/hr/recruitments" element={<RecruitmentDashboard />} />
            <Route path="/careers/apply/:jobId" element={<PublicJobApplicationPage />} />
            <Route path="/dashboard/hr/hr-reports" element={<div>HR Reports Placeholder</div>} />
            <Route path="/dashboard/payroll" element={<Payroll />} />
            <Route path="/dashboard/payroll/process" element={<PayrollDashboard />} />
            <Route path="/dashboard/payroll/earnings" element={<EmployeeEarningsDashboard />} />
            <Route path="/dashboard/payroll/deductions" element={<EmployeeDeductionsDashboard />} />
            <Route path="/dashboard/payroll/financial" element={<FinancialInstitutionsDashboard />} />
            <Route path="/dashboard/payroll/statutory" element={<StatutorySettingsDashboard />} />
            <Route path="/dashboard/payroll/settings" element={<PayrollSettings />} />

            <Route path="/dashboard/users" element={<UsersManagement />} />
            <Route path="/dashboard/users/list" element={<UsersManagement />} />
            <Route path="/dashboard/users/account" element={<MyAccount />} />
            <Route path="/dashboard/users/roles" element={<RolesManagement />} />
            <Route path="/dashboard/settings" element={<Settings />} />

            {/* Legacy/Top-level Settings */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </div>
    </SessionProvider>
  );
}


export default App;
