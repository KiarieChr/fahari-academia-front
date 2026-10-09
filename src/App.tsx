import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Session Provider for enhanced session management
import { SessionProvider } from './components/providers/SessionProvider';
import PageLoader from './components/common/PageLoader';

const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);


/* --- Auth Components --- */
import Login from './auth/Login'; // Keep Login eager so the first screen is instant
const ForgotPassword = Loadable(lazy(() => import('./auth/ForgotPassword')));
const VerifyOtp = Loadable(lazy(() => import('./auth/VerifyOtp')));
const ResetPassword = Loadable(lazy(() => import('./auth/ResetPassword')));
const FirstTimeSetup = Loadable(lazy(() => import('./auth/FirstTimeSetup')));
const CreateInstitutionWizard = Loadable(lazy(() => import('./modules/onboarding/CreateInstitutionWizard')));

/* --- Layout & Dashboards --- */
const DashboardHome = Loadable(lazy(() => import('./dashboard/DashboardHome')));

/* --- Students Module (Lazy loaded) --- */
const StudentManagement = Loadable(lazy(() => import('./modules/students/StudentManagement')));
const AdmissionBookDashboard = Loadable(lazy(() => import('./modules/students/admission/AdmissionBookDashboard')));
/* Admission sub-pages */
const AdmissionsOverviewPage   = lazy(() => import('./modules/students/admission/pages/AdmissionsOverviewPage'));
const EnquiriesPage            = lazy(() => import('./modules/students/admission/pages/EnquiriesPage'));
const ApplicationsPage         = lazy(() => import('./modules/students/admission/pages/ApplicationsPage'));
const AdmissionRegisterPage    = lazy(() => import('./modules/students/admission/pages/AdmissionRegisterPage'));
const NominalRollPage          = lazy(() => import('./modules/students/admission/pages/NominalRollPage'));
const StudentReportingPage     = lazy(() => import('./modules/students/admission/pages/StudentReportingPage'));
const RepeatersPage            = lazy(() => import('./modules/students/admission/pages/RepeatersPage'));
/* ── */
const ClassSessionsDashboard = Loadable(lazy(() => import('./modules/students/class-sessions/ClassSessionsDashboard')));
const AcademicSessionsDashboard = Loadable(lazy(() => import('./modules/students/academic-sessions/AcademicSessionsDashboard')));
const CurriculumDashboard = Loadable(lazy(() => import('./modules/students/curriculum/CurriculumDashboard')));
const StudentSettingsDashboard = Loadable(lazy(() => import('./modules/students/settings/StudentSettingsDashboard')));
const StudentReportsDashboard = Loadable(lazy(() => import('./modules/students/reports/StudentReportsDashboard')));
const ClassTimesDashboard = Loadable(lazy(() => import('./modules/students/class-times/ClassTimesDashboard')));
const TimetableDashboard = Loadable(lazy(() => import('./modules/timetable/TimetableDashboard')));

/* --- Academics Module (Lazy loaded) --- */
const AcademicsSettingsHub = Loadable(lazy(() => import('./modules/academics/settings/AcademicsSettingsHub')));
const StudentAcademics = Loadable(lazy(() => import('./modules/academics/StudentAcademics')));
const MarksInputDashboard = Loadable(lazy(() => import('./modules/academics/marks-input/MarksInputDashboard')));
const ExamSchedulesDashboard = Loadable(lazy(() => import('./modules/academics/exam-schedules/ExamSchedulesDashboard')));
const GradingSystemDashboard = Loadable(lazy(() => import('./modules/academics/grading-system/GradingSystemDashboard')));
const ReportsDashboard = Loadable(lazy(() => import('./modules/academics/reports/ReportsDashboard')));
const AssignmentsDashboard = Loadable(lazy(() => import('./modules/academics/assignments/AssignmentsDashboard')));
const CurriculumSetupDashboard = Loadable(lazy(() => import('./modules/academics/curriculum-setup/CurriculumSetupDashboard')));
const SubjectsDashboard = Loadable(lazy(() => import('./modules/academics/subjects/SubjectsDashboard')));
const SubjectAllocationDashboard = Loadable(lazy(() => import('./modules/academics/subject-allocation/SubjectAllocationDashboard')));

/* --- Fees Module (Lazy loaded) --- */
const StudentFees = Loadable(lazy(() => import('./modules/fees/StudentFees')));
const ReceiptBookDashboard = Loadable(lazy(() => import('./modules/fees/receipt-book/ReceiptBookDashboard')));
const StudentInvoicesDashboard = Loadable(lazy(() => import('./modules/fees/invoices/StudentInvoicesDashboard')));
const FeeSetupDashboard = Loadable(lazy(() => import('./modules/fees/fee-structure/FeeSetupDashboard')));
const FeeSettingsDashboard = Loadable(lazy(() => import('./modules/fees/settings/FeeSettingsDashboard')));
const ArrearsDashboard = Loadable(lazy(() => import('./modules/fees/arrears/ArrearsDashboard')));

/* --- Finance Module (Lazy loaded) --- */
const Finance = Loadable(lazy(() => import('./modules/finance/Finance')));
const AccountsPayableDashboard = Loadable(lazy(() => import('./modules/finance/accountsPayable/AccountsPayableDashboard')));
const AccountsReceivableDashboard = Loadable(lazy(() => import('./modules/finance/accountsReceivable/AccountsReceivableDashboard')));
const ChartOfAccounts = Loadable(lazy(() => import('./modules/finance/ChartOfAccounts')));
const Journals = Loadable(lazy(() => import('./modules/finance/Journals')));
const FinanceReports = Loadable(lazy(() => import('./modules/finance/FinanceReports')));
const FinanceSettingsDashboard = Loadable(lazy(() => import('./modules/finance/settings/FinanceSettingsDashboard')));
const BudgetingDashboard = Loadable(lazy(() => import('./modules/finance/budgeting/BudgetingDashboard')));
const AdmissionFeeConfig = Loadable(lazy(() => import('./modules/finance/AdmissionFeeConfig')));

/* --- Procurement Module (Lazy loaded) --- */
const Procurement = Loadable(lazy(() => import('./modules/procurement/Procurement')));
const PurchaseRequisitionDashboard = Loadable(lazy(() => import('./modules/procurement/requisition/PurchaseRequisitionDashboard')));
const PurchaseOrderDashboard = Loadable(lazy(() => import('./modules/procurement/purchase-order/PurchaseOrderDashboard')));
const InventoryDashboard = Loadable(lazy(() => import('./modules/inventory/InventoryDashboard')));
const GRNDashboard = Loadable(lazy(() => import('./modules/procurement/grn/GRNDashboard')));
const ProcurementSettings = Loadable(lazy(() => import('./modules/procurement/settings/ProcurementSettings')));
const RFQDashboard = Loadable(lazy(() => import('./modules/procurement/rfq/RFQDashboard')));
const ContractsDashboard = Loadable(lazy(() => import('./modules/procurement/contracts/ContractsDashboard')));
const PublicQuotation = Loadable(lazy(() => import('./modules/procurement/public/PublicQuotation')));
const PublicEnquiryPage = Loadable(lazy(() => import('./modules/students/admission/pages/PublicEnquiryPage')));
const FleetDashboard = Loadable(lazy(() => import('./modules/fleet/FleetDashboard')));
const LiveTrackingPage = Loadable(lazy(() => import('./modules/fleet/pages/LiveTrackingPage')));
const VehiclesPage = Loadable(lazy(() => import('./modules/fleet/pages/VehiclesPage')));
const DriversPage = Loadable(lazy(() => import('./modules/fleet/pages/DriversPage')));
const TripsPage = Loadable(lazy(() => import('./modules/fleet/pages/TripsPage')));
const FuelLogsPage = Loadable(lazy(() => import('./modules/fleet/pages/FuelLogsPage')));
const MaintenancePage = Loadable(lazy(() => import('./modules/fleet/pages/MaintenancePage')));
const ExpensesPage = Loadable(lazy(() => import('./modules/fleet/pages/ExpensesPage')));
const FinancialAnalyticsPage = Loadable(lazy(() => import('./modules/fleet/pages/FinancialAnalyticsPage')));

/* --- HR & Other Modules (Lazy loaded) --- */
/* --- CRM Module (Lazy loaded) --- */
const CrmDashboard = Loadable(lazy(() => import('./modules/crm/components/CrmDashboard').then(m => ({ default: m.CrmDashboard }))));
const ParentList = Loadable(lazy(() => import('./modules/crm/components/ParentList').then(m => ({ default: m.ParentList }))));
const CampaignWizard = Loadable(lazy(() => import('./modules/crm/components/CampaignWizard').then(m => ({ default: m.CampaignWizard }))));
const UnifiedInbox = Loadable(lazy(() => import('./modules/crm/components/UnifiedInbox').then(m => ({ default: m.UnifiedInbox }))));
const MessageTemplates = Loadable(lazy(() => import('./modules/crm/components/MessageTemplates').then(m => ({ default: m.MessageTemplates }))));
const ProviderSettings = Loadable(lazy(() => import('./modules/crm/components/ProviderSettings').then(m => ({ default: m.ProviderSettings }))));

// Use new modern HR Dashboard
const HumanResource = Loadable(lazy(() => import('./modules/hr/HumanResourceDashboard')));
// Use new modern Staff Register  
const StaffRegister = Loadable(lazy(() => import('./modules/hr/StaffRegisterV2')));
const LeaveDashboard = Loadable(lazy(() => import('./modules/hr/leave/LeaveDashboard')));
const HrSettingsDasboard = Loadable(lazy(() => import('./modules/hr/settings/HRSettingsDashboard')));
const StaffAttendanceDashboard = Loadable(lazy(() => import('./modules/hr/attendance/StaffAttendanceDashboard')));
const StaffPerformanceDashboard = Loadable(lazy(() => import('./modules/hr/performance/StaffPerformanceDashboard')));
const Payroll = Loadable(lazy(() => import('./modules/payroll/Payroll')));
const RecruitmentDashboard = Loadable(lazy(() => import('./modules/hr/recruitment/RecruitmentDashboard')));
const PublicJobApplicationPage = Loadable(lazy(() => import('./modules/hr/recruitment/PublicJobApplicationPage')));
const SchoolSetupPage = Loadable(lazy(() => import('./modules/settings/SchoolSetupPage').then(m => ({ default: m.default }))));
const UserAccessPage = Loadable(lazy(() => import('./modules/settings/UserAccessPage').then(m => ({ default: m.default }))));
const ApiConfigPage = Loadable(lazy(() => import('./modules/settings/ApiConfigPage').then(m => ({ default: m.default }))));
const GeneralSettingsPage = Loadable(lazy(() => import('./modules/settings/GeneralSettingsPage').then(m => ({ default: m.default }))));
const StudentSettingsPage = Loadable(lazy(() => import('./modules/settings/StudentSettingsPage').then(m => ({ default: m.default }))));
const SystemLogsPage = Loadable(lazy(() => import('./modules/settings/SystemLogsPage').then(m => ({ default: m.default }))));
const SystemModulesPage = Loadable(lazy(() => import('./modules/settings/SystemModulesPage').then(m => ({ default: m.default }))));
const PayrollDashboard = Loadable(lazy(() => import('./modules/payroll/PayrollDashboard')));
const EmployeeDeductionsDashboard = Loadable(lazy(() => import('./modules/payroll/EmployeeDeductionsDashboard')));
const EmployeeEarningsDashboard = Loadable(lazy(() => import('./modules/payroll/EmployeeEarningsDashboard')));
const FinancialInstitutionsDashboard = Loadable(lazy(() => import('./modules/payroll/FinancialInstitutionsDashboard')));
const StatutorySettingsDashboard = Loadable(lazy(() => import('./modules/payroll/StatutoryDashboard')));
const PayrollSettings = Loadable(lazy(() => import('./modules/payroll/PayrollSettings')));
const PensionDashboard = Loadable(lazy(() => import('./modules/payroll/PensionDashboard')));
const PayrollReports = Loadable(lazy(() => import('./modules/payroll/PayrollReports')));

/* --- User management and Settings (Lazy loaded) --- */
const MyAccount = Loadable(lazy(() => import('./modules/users/MyAccount')));
const UsersManagement = Loadable(lazy(() => import('./modules/users/UsersManagement')));
const RolesManagement = Loadable(lazy(() => import('./modules/users/RolesManagement')));

/* --- Intelligence Module (Lazy loaded) --- */
const IntelligenceDashboard = Loadable(lazy(() => import('./components/intelligence/IntelligenceDashboard')));

/* --- Student & Parent Portal (Lazy loaded) --- */
const StudentDashboard = Loadable(lazy(() => import('./modules/student-portal/StudentDashboard')));
const MyProfile = Loadable(lazy(() => import('./modules/student-portal/MyProfile')));
const MyFeeStatement = Loadable(lazy(() => import('./modules/student-portal/MyFeeStatement')));
const MyPaymentHistory = Loadable(lazy(() => import('./modules/student-portal/MyPaymentHistory')));
const MyResults = Loadable(lazy(() => import('./modules/student-portal/MyResults')));
const MyTimetable = Loadable(lazy(() => import('./modules/student-portal/MyTimetable')));
const MyAttendance = Loadable(lazy(() => import('./modules/student-portal/MyAttendance')));
const MyAssignments = Loadable(lazy(() => import('./modules/student-portal/MyAssignments')));
const MyFinancialStatement = Loadable(lazy(() => import('./modules/student-portal/MyFinancialStatement')));
const ParentDashboard = Loadable(lazy(() => import('./modules/parent-portal/ParentDashboard')));
const ParentChildren = Loadable(lazy(() => import('./modules/parent-portal/ParentChildren')));
const ChildDetail = Loadable(lazy(() => import('./modules/parent-portal/ChildDetail')));
const ParentFeeBalances = Loadable(lazy(() => import('./modules/parent-portal/ParentFeeBalances')));
const ChildAssignments = Loadable(lazy(() => import('./modules/parent-portal/ChildAssignments')));

/* --- Transport Module (Lazy loaded) --- */
const RouteManagement = Loadable(lazy(() => import('./modules/transport/RouteManagement').then(m => ({ default: m.RouteManagement }))));
const FeeStructureConfig = Loadable(lazy(() => import('./modules/transport/FeeStructureConfig').then(m => ({ default: m.FeeStructureConfig }))));
const StudentAssignments = Loadable(lazy(() => import('./modules/transport/StudentAssignments').then(m => ({ default: m.StudentAssignments }))));

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
            
            {/* Super Admin Registration */}
            <Route path="/create-institution" element={<CreateInstitutionWizard />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            
            {/* Transport Module */}
            <Route path="/academia/transport/routes" element={<ProtectedRoute><RouteManagement /></ProtectedRoute>} />
            <Route path="/academia/transport/settings" element={<ProtectedRoute><FeeStructureConfig /></ProtectedRoute>} />
            <Route path="/academia/transport/students" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />

            {/* Students Module */}
            <Route path="/dashboard/students" element={<ProtectedRoute><PermissionGate module="students"><StudentManagement /></PermissionGate></ProtectedRoute>} />

            {/* Admission Book — nested layout with child pages */}
            <Route
              path="/dashboard/students/admission"
              element={<ProtectedRoute><PermissionGate module="students"><AdmissionBookDashboard /></PermissionGate></ProtectedRoute>}
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview"     element={<AdmissionsOverviewPage />} />
              <Route path="enquiries"    element={<EnquiriesPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="records"      element={<AdmissionRegisterPage />} />
              <Route path="nominal-roll" element={<NominalRollPage />} />
              <Route path="reporting"    element={<StudentReportingPage />} />
              <Route path="repeaters"    element={<RepeatersPage />} />
            </Route>
            <Route path="/dashboard/students/sessions" element={<ProtectedRoute><PermissionGate module="students"><ClassSessionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/academic-sessions" element={<ProtectedRoute><PermissionGate module="students"><AcademicSessionsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/curriculums" element={<ProtectedRoute><PermissionGate module="students"><CurriculumDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/settings" element={<ProtectedRoute><PermissionGate module="students"><StudentSettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/reports" element={<ProtectedRoute><PermissionGate module="students"><StudentReportsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/students/times" element={<ProtectedRoute><PermissionGate module="students"><ClassTimesDashboard /></PermissionGate></ProtectedRoute>} />

            <Route path="/dashboard/academics/settings" element={<ProtectedRoute><PermissionGate module="academics"><AcademicsSettingsHub /></PermissionGate></ProtectedRoute>} />

            {/* Timetables — top-level module */}
            <Route path="/dashboard/timetables" element={<ProtectedRoute><PermissionGate module="timetables"><TimetableDashboard /></PermissionGate></ProtectedRoute>} />

            {/* Academics Module */}
            <Route path="/dashboard/academics" element={<ProtectedRoute><PermissionGate module="academics"><StudentAcademics /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/marks" element={<ProtectedRoute><PermissionGate module="academics"><MarksInputDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/exam-schedules" element={<ProtectedRoute><PermissionGate module="academics"><ExamSchedulesDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/curriculum" element={<ProtectedRoute><PermissionGate module="academics"><CurriculumSetupDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/subjects" element={<ProtectedRoute><PermissionGate module="academics"><SubjectsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/allocation" element={<ProtectedRoute><PermissionGate module="academics"><SubjectAllocationDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/grading" element={<ProtectedRoute><PermissionGate module="academics"><GradingSystemDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/reports" element={<ProtectedRoute><PermissionGate module="academics"><ReportsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/assignments" element={<ProtectedRoute><PermissionGate module="academics"><AssignmentsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/academics/settings" element={<ProtectedRoute><PermissionGate module="academics"><div>Academic Settings Placeholder</div></PermissionGate></ProtectedRoute>} />

            {/* Settings Module */}
            <Route path="/dashboard/settings" element={<Navigate to="/dashboard/general-settings" replace />} />
            <Route path="/dashboard/school-setup" element={<ProtectedRoute><PermissionGate module="settings"><SchoolSetupPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/users-roles" element={<ProtectedRoute><PermissionGate module="settings"><UserAccessPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/api-config" element={<ProtectedRoute><PermissionGate module="settings"><ApiConfigPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/general-settings" element={<ProtectedRoute><PermissionGate module="settings"><GeneralSettingsPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/student-settings" element={<ProtectedRoute><PermissionGate module="settings"><StudentSettingsPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/system-logs" element={<ProtectedRoute><PermissionGate module="settings"><SystemLogsPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/system-modules" element={<ProtectedRoute><PermissionGate module="settings"><SystemModulesPage /></PermissionGate></ProtectedRoute>} />

            {/* Fees Module */}
            <Route path="/dashboard/fees" element={<ProtectedRoute><PermissionGate module="fees"><StudentFees /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/receipts" element={<ProtectedRoute><PermissionGate module="fees"><ReceiptBookDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/invoice" element={<ProtectedRoute><PermissionGate module="fees"><StudentInvoicesDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/structure" element={<ProtectedRoute><PermissionGate module="fees"><FeeSetupDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/settings" element={<ProtectedRoute><PermissionGate module="fees"><FeeSettingsDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fees/arrears" element={<ProtectedRoute><PermissionGate module="fees"><ArrearsDashboard /></PermissionGate></ProtectedRoute>} />
            {/* /fees/templates redirects to the combined page with templates tab active */}
            <Route path="/dashboard/fees/templates" element={<Navigate to="/dashboard/fees/structure?tab=templates" replace />} />

            {/* Finance Module */}
            <Route path="/dashboard/finance" element={<ProtectedRoute><PermissionGate module="finance"><Finance /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/payable" element={<ProtectedRoute><PermissionGate module="finance"><AccountsPayableDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/receivable" element={<ProtectedRoute><PermissionGate module="finance"><AccountsReceivableDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/chart" element={<ProtectedRoute><PermissionGate module="finance"><ChartOfAccounts /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/finance/admission-fees" element={<ProtectedRoute><PermissionGate module="finance"><AdmissionFeeConfig /></PermissionGate></ProtectedRoute>} />
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

            {/* Fleet Module */}
            <Route path="/dashboard/fleet" element={<ProtectedRoute><PermissionGate module="fleet"><FleetDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/live" element={<ProtectedRoute><PermissionGate module="fleet"><LiveTrackingPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/vehicles" element={<ProtectedRoute><PermissionGate module="fleet"><VehiclesPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/drivers" element={<ProtectedRoute><PermissionGate module="fleet"><DriversPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/trips" element={<ProtectedRoute><PermissionGate module="fleet"><TripsPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/fuel" element={<ProtectedRoute><PermissionGate module="fleet"><FuelLogsPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/maintenance" element={<ProtectedRoute><PermissionGate module="fleet"><MaintenancePage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/expenses" element={<ProtectedRoute><PermissionGate module="fleet"><ExpensesPage /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/fleet/analytics" element={<ProtectedRoute><PermissionGate module="fleet"><FinancialAnalyticsPage /></PermissionGate></ProtectedRoute>} />

            {/* CRM Module */}
            <Route path="/dashboard/crm" element={<ProtectedRoute><PermissionGate module="crm"><CrmDashboard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/crm/parents" element={<ProtectedRoute><PermissionGate module="crm"><ParentList /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/crm/inbox" element={<ProtectedRoute><PermissionGate module="crm"><UnifiedInbox /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/crm/campaigns/new" element={<ProtectedRoute><PermissionGate module="crm"><CampaignWizard /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/crm/templates" element={<ProtectedRoute><PermissionGate module="crm"><MessageTemplates /></PermissionGate></ProtectedRoute>} />
            <Route path="/dashboard/crm/settings" element={<ProtectedRoute><PermissionGate module="crm"><ProviderSettings /></PermissionGate></ProtectedRoute>} />
            
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
            <Route path="/enquire" element={<PublicEnquiryPage />} />
            <Route path="/enquire/:intakeId" element={<PublicEnquiryPage />} />
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
           
            <Route path="/dashboard/intelligence" element={<ProtectedRoute><IntelligenceDashboard /></ProtectedRoute>} />

            {/* Legacy/Top-level Settings */}

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
