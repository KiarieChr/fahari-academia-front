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
import FirstTimeSetup from './auth/FirstTimeSetup';

/* --- Layout & Dashboards --- */
import DashboardHome from './dashboard/DashboardHome';

/* --- Students Module (Lazy loaded) --- */
const StudentManagement = lazy(() => import('./modules/students/StudentManagement'));
const AdmissionBookDashboard = lazy(() => import('./modules/students/admission/AdmissionBookDashboard'));
const ClassSessionsDashboard = lazy(() => import('./modules/students/class-sessions/ClassSessionsDashboard'));
const AcademicSessionsDashboard = lazy(() => import('./modules/students/academic-sessions/AcademicSessionsDashboard'));
const CurriculumDashboard = lazy(() => import('./modules/students/curriculum/CurriculumDashboard'));
const StudentSettingsDashboard = lazy(() => import('./modules/students/settings/StudentSettingsDashboard'));
const ClassTimesDashboard = lazy(() => import('./modules/students/class-times/ClassTimesDashboard'));
const TimetableDashboard = lazy(() => import('./modules/timetable/TimetableDashboard'));

/* --- Academics Module (Lazy loaded) --- */
const StudentAcademics = lazy(() => import('./modules/academics/StudentAcademics'));
const MarksInputDashboard = lazy(() => import('./modules/academics/marks-input/MarksInputDashboard'));
const GradingSystemDashboard = lazy(() => import('./modules/academics/grading-system/GradingSystemDashboard'));
const ReportsDashboard = lazy(() => import('./modules/academics/reports/ReportsDashboard'));
const AssignmentsDashboard = lazy(() => import('./modules/academics/assignments/AssignmentsDashboard'));
const CurriculumSetupDashboard = lazy(() => import('./modules/academics/curriculum-setup/CurriculumSetupDashboard'));
const SubjectsDashboard = lazy(() => import('./modules/academics/subjects/SubjectsDashboard'));
const SubjectAllocationDashboard = lazy(() => import('./modules/academics/subject-allocation/SubjectAllocationDashboard'));

/* --- Fees Module (Lazy loaded) --- */
const StudentFees = lazy(() => import('./modules/fees/StudentFees'));
const ReceiptBookDashboard = lazy(() => import('./modules/fees/receipt-book/ReceiptBookDashboard'));
const StudentInvoicesDashboard = lazy(() => import('./modules/fees/invoices/StudentInvoicesDashboard'));
const FeeStructureDashboard = lazy(() => import('./modules/fees/fee-structure/FeeStructureDashboard'));
const FeeSettingsDashboard = lazy(() => import('./modules/fees/settings/FeeSettingsDashboard'));
const ArrearsDashboard = lazy(() => import('./modules/fees/arrears/ArrearsDashboard'));
const FeeTemplateDashboard = lazy(() => import('./modules/fees/fee-templates/FeeTemplateDashboard'));

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
const RFQDashboard = lazy(() => import('./modules/procurement/rfq/RFQDashboard'));
const ContractsDashboard = lazy(() => import('./modules/procurement/contracts/ContractsDashboard'));
const PublicQuotation = lazy(() => import('./modules/procurement/public/PublicQuotation'));

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
const PensionDashboard = lazy(() => import('./modules/payroll/PensionDashboard'));
const PayrollReports = lazy(() => import('./modules/payroll/PayrollReports'));

/* --- User management and Settings (Lazy loaded) --- */
const MyAccount = lazy(() => import('./modules/users/MyAccount'));
const UsersManagement = lazy(() => import('./modules/users/UsersManagement'));
const RolesManagement = lazy(() => import('./modules/users/RolesManagement'));

/* --- Student & Parent Portal (Lazy loaded) --- */
const StudentDashboard = lazy(() => import('./modules/student-portal/StudentDashboard'));
const MyProfile = lazy(() => import('./modules/student-portal/MyProfile'));
const MyFeeStatement = lazy(() => import('./modules/student-portal/MyFeeStatement'));
const MyPaymentHistory = lazy(() => import('./modules/student-portal/MyPaymentHistory'));
const MyResults = lazy(() => import('./modules/student-portal/MyResults'));
const MyTimetable = lazy(() => import('./modules/student-portal/MyTimetable'));
const MyAttendance = lazy(() => import('./modules/student-portal/MyAttendance'));
const MyAssignments = lazy(() => import('./modules/student-portal/MyAssignments'));
const MyFinancialStatement = lazy(() => import('./modules/student-portal/MyFinancialStatement'));
const StudentReportsDashboard = lazy(() => import('./modules/students/reports/StudentReportsDashboard'));
const ParentDashboard = lazy(() => import('./modules/parent-portal/ParentDashboard'));
const ParentChildren = lazy(() => import('./modules/parent-portal/ParentChildren'));
const ChildDetail = lazy(() => import('./modules/parent-portal/ChildDetail'));
const ParentFeeBalances = lazy(() => import('./modules/parent-portal/ParentFeeBalances'));
const ChildAssignments = lazy(() => import('./modules/parent-portal/ChildAssignments'));

/* --- Role-based route guard --- */
import RoleBasedRoute from './auth/RoleBasedRoute';
import ProtectedRoute from './auth/ProtectedRoute';
import PermissionGate from './auth/PermissionGate';

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
            <Route path="/first-time-setup" element={<FirstTimeSetup />} />


            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />

            {/* Students Module */}
            <Route path="/dashboard/students" element={<ProtectedRoute><PermissionGate module="students"><StudentManagement /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/admission" element={<ProtectedRoute><PermissionGate module="students"><AdmissionBookDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/sessions" element={<ProtectedRoute><PermissionGate module="students"><ClassSessionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/academic-sessions" element={<ProtectedRoute><PermissionGate module="students"><AcademicSessionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/curriculums" element={<ProtectedRoute><PermissionGate module="students"><CurriculumDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/settings" element={<ProtectedRoute><PermissionGate module="students"><StudentSettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/reports" element={<ProtectedRoute><PermissionGate module="students"><StudentReportsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/times" element={<ProtectedRoute><PermissionGate module="students"><ClassTimesDashboard /></PermissionGate></ProtectedRoute>} />

            {/* Timetables — top-level module */}
            <Route path="/dashboard/timetables" element={<ProtectedRoute><PermissionGate module="timetables"><TimetableDashboard /></PermissionGate></ProtectedRoute>} />

            {/* Academics Module */}
            <Route path="/dashboard/academics" element={<ProtectedRoute><PermissionGate module="academics"><StudentAcademics /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/marks" element={<ProtectedRoute><PermissionGate module="academics"><MarksInputDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/curriculum" element={<ProtectedRoute><PermissionGate module="academics"><CurriculumSetupDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/subjects" element={<ProtectedRoute><PermissionGate module="academics"><SubjectsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/allocation" element={<ProtectedRoute><PermissionGate module="academics"><SubjectAllocationDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/grading" element={<ProtectedRoute><PermissionGate module="academics"><GradingSystemDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/reports" element={<ProtectedRoute><PermissionGate module="academics"><ReportsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/assignments" element={<ProtectedRoute><PermissionGate module="academics"><AssignmentsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/settings" element={<ProtectedRoute><PermissionGate module="academics"><div>Academic Settings Placeholder</div></PermissionGate></ProtectedRoute>} />

            {/* Fees Module */}
            <Route path="/dashboard/fees" element={<ProtectedRoute><PermissionGate module="fees"><StudentFees /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/receipts" element={<ProtectedRoute><PermissionGate module="fees"><ReceiptBookDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/invoice" element={<ProtectedRoute><PermissionGate module="fees"><StudentInvoicesDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/structure" element={<ProtectedRoute><PermissionGate module="fees"><FeeStructureDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/settings" element={<ProtectedRoute><PermissionGate module="fees"><FeeSettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/arrears" element={<ProtectedRoute><PermissionGate module="fees"><ArrearsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/templates" element={<ProtectedRoute><PermissionGate module="fees"><FeeTemplateDashboard /></PermissionGate></ProtectedRoute>} />

            {/* Finance Module */}
            <Route path="/dashboard/finance" element={<ProtectedRoute><PermissionGate module="finance"><Finance /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/payable" element={<ProtectedRoute><PermissionGate module="finance"><AccountsPayableDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/chart" element={<ProtectedRoute><PermissionGate module="finance"><ChartOfAccounts /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/journals" element={<ProtectedRoute><PermissionGate module="finance"><Journals /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/reports" element={<ProtectedRoute><PermissionGate module="finance"><FinanceReports /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/settings" element={<ProtectedRoute><PermissionGate module="finance"><FinanceSettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/budgeting" element={<ProtectedRoute><PermissionGate module="finance"><BudgetingDashboard /></PermissionGate></ProtectedRoute>} />

            {/* Procurement Module */}
            <Route path="/dashboard/procurement" element={<ProtectedRoute><PermissionGate module="procurement"><Procurement /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/requisition" element={<ProtectedRoute><PermissionGate module="procurement"><PurchaseRequisitionDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/order" element={<ProtectedRoute><PermissionGate module="procurement"><PurchaseOrderDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/grn" element={<ProtectedRoute><PermissionGate module="procurement"><GRNDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/suppliers" element={<ProtectedRoute><PermissionGate module="procurement"><div>Suppliers Placeholder</div></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/inventory" element={<ProtectedRoute><PermissionGate module="procurement"><InventoryDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/journal" element={<ProtectedRoute><PermissionGate module="procurement"><div>Inventory Journal Placeholder</div></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/reports" element={<ProtectedRoute><PermissionGate module="procurement"><div>Procurement Reports Placeholder</div></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/egp" element={<ProtectedRoute><PermissionGate module="procurement"><div>EGP Placeholder</div></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/settings" element={<ProtectedRoute><PermissionGate module="procurement"><ProcurementSettings /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/rfq" element={<ProtectedRoute><PermissionGate module="procurement"><RFQDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/procurement/contracts" element={<ProtectedRoute><PermissionGate module="procurement"><ContractsDashboard /></PermissionGate></ProtectedRoute>} />

            {/* HR & Other Modules */}
            <Route path="/dashboard/hr" element={<ProtectedRoute><PermissionGate module="hr"><HumanResource /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/staff-register" element={<ProtectedRoute><PermissionGate module="hr"><StaffRegister /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/leave" element={<ProtectedRoute><PermissionGate module="hr"><LeaveDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/hr-settings" element={<ProtectedRoute><PermissionGate module="hr"><HrSettingsDasboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/staff-attendance" element={<ProtectedRoute><PermissionGate module="hr"><StaffAttendanceDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/staff-performance" element={<ProtectedRoute><PermissionGate module="hr"><StaffPerformanceDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/hr/recruitments" element={<ProtectedRoute><PermissionGate module="hr"><RecruitmentDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/careers/apply/:jobId" element={<PublicJobApplicationPage />} />
            <Route path="/quote/:token" element={<PublicQuotation />} />
            <Route path="/dashboard/hr/hr-reports" element={<ProtectedRoute><PermissionGate module="hr"><div>HR Reports Placeholder</div></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll" element={<ProtectedRoute><PermissionGate module="payroll"><Payroll /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/process" element={<ProtectedRoute><PermissionGate module="payroll"><PayrollDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/earnings" element={<ProtectedRoute><PermissionGate module="payroll"><EmployeeEarningsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/deductions" element={<ProtectedRoute><PermissionGate module="payroll"><EmployeeDeductionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/financial" element={<ProtectedRoute><PermissionGate module="payroll"><FinancialInstitutionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/statutory" element={<ProtectedRoute><PermissionGate module="payroll"><StatutorySettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/pension" element={<ProtectedRoute><PermissionGate module="payroll"><PensionDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/reports" element={<ProtectedRoute><PermissionGate module="payroll"><PayrollReports /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/payroll/settings" element={<ProtectedRoute><PermissionGate module="payroll"><PayrollSettings /></PermissionGate></ProtectedRoute>} />

            <Route path="/dashboard/users" element={<ProtectedRoute><PermissionGate module="users"><UsersManagement /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/users/list" element={<ProtectedRoute><PermissionGate module="users"><UsersManagement /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/users/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/dashboard/users/roles" element={<ProtectedRoute><PermissionGate module="users"><RolesManagement /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><PermissionGate module="settings"><Settings /></PermissionGate></ProtectedRoute>} />

            {/* Legacy/Top-level Settings */}
            <Route path="/settings" element={<ProtectedRoute><PermissionGate module="settings"><Settings /></PermissionGate></ProtectedRoute>} />

            {/* ─── Student Portal ─── */}
            <Route path="/student" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/student/profile" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyProfile />
              </RoleBasedRoute>
            } />
            <Route path="/student/fees/statement" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyFeeStatement />
              </RoleBasedRoute>
            } />
            <Route path="/student/fees/payments" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyPaymentHistory />
              </RoleBasedRoute>
            } />
            <Route path="/student/fees/financial-statement" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyFinancialStatement />
              </RoleBasedRoute>
            } />
            <Route path="/student/results/reports" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyResults />
              </RoleBasedRoute>
            } />
            <Route path="/student/results/transcripts" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyResults />
              </RoleBasedRoute>
            } />
            <Route path="/student/classes/timetable" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyTimetable />
              </RoleBasedRoute>
            } />
            <Route path="/student/classes/subjects" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyAttendance />
              </RoleBasedRoute>
            } />
            <Route path="/student/assignments" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <MyAssignments />
              </RoleBasedRoute>
            } />
            <Route path="/student/events" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleBasedRoute>
            } />

            {/* ─── Parent Portal ─── */}
            <Route path="/parent" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/parent/children" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ParentChildren />
              </RoleBasedRoute>
            } />
            <Route path="/parent/children/:id" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ChildDetail />
              </RoleBasedRoute>
            } />
            <Route path="/parent/fees/balances" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ParentFeeBalances />
              </RoleBasedRoute>
            } />
            <Route path="/parent/academics/reports" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ParentChildren />
              </RoleBasedRoute>
            } />
            <Route path="/parent/assignments" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ChildAssignments />
              </RoleBasedRoute>
            } />
            <Route path="/parent/profile" element={
              <RoleBasedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </RoleBasedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </SessionProvider>
  );
}


export default App;
