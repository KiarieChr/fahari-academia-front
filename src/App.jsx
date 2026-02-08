import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* --- Auth Components --- */
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import VerifyOtp from './auth/VerifyOtp';
import ResetPassword from './auth/ResetPassword';

/* --- Layout & Dashboards --- */
import DashboardHome from './dashboard/DashboardHome';

/* --- Students Module --- */
import StudentManagement from './modules/students/StudentManagement';
import AdmissionBookDashboard from './modules/students/admission/AdmissionBookDashboard';
import ClassSessionsDashboard from './modules/students/class-sessions/ClassSessionsDashboard';
import CurriculumDashboard from './modules/students/curriculum/CurriculumDashboard';
import StudentSettingsDashboard from './modules/students/settings/StudentSettingsDashboard';

/* --- Academics Module --- */
import StudentAcademics from './modules/academics/StudentAcademics';
import MarksInputDashboard from './modules/academics/marks-input/MarksInputDashboard';

/* --- Fees Module --- */
import StudentFees from './modules/fees/StudentFees';
import ReceiptBookDashboard from './modules/fees/receipt-book/ReceiptBookDashboard';
import StudentInvoicesDashboard from './modules/fees/invoices/StudentInvoicesDashboard';
import FeeStructureDashboard from './modules/fees/fee-structure/FeeStructureDashboard';
import FeeSettingsDashboard from './modules/fees/settings/FeeSettingsDashboard';
import ArrearsDashboard from './modules/fees/arrears/ArrearsDashboard';

/* --- Finance Module --- */
import Finance from './modules/finance/Finance';
import AccountsPayableDashboard from './modules/finance/accountsPayable/AccountsPayableDashboard';
import ChartOfAccounts from './modules/finance/ChartOfAccounts';
import Journals from './modules/finance/Journals';
import FinanceReports from './modules/finance/FinanceReports';
import FinanceSettingsDashboard from './modules/finance/settings/FinanceSettingsDashboard';
import BudgetingDashboard from './modules/finance/budgeting/BudgetingDashboard';

/* --- Procurement Module --- */
import Procurement from './modules/procurement/Procurement';
import PurchaseRequisitionDashboard from './modules/procurement/requisition/PurchaseRequisitionDashboard';
import PurchaseOrderDashboard from './modules/procurement/purchase-order/PurchaseOrderDashboard';
import InventoryDashboard from './modules/inventory/InventoryDashboard';
import SupplyDashboard from './modules/inventory/SupplyDashboard';
import GRNDashboard from './modules/procurement/grn/GRNDashboard';
import ProcurementSettings from './modules/procurement/settings/ProcurementSettings';
/* --- HR & Other Modules --- */
import HumanResource from './modules/hr/HumanResource';
import StaffRegister from './modules/hr/StaffRegister';
import LeaveDashboard from './modules/hr/leave/LeaveDashboard';
import HrSettingsDasboard from './modules/hr/settings/HrSettingsDashboard';
import StaffAttendanceDashboard from './modules/hr/attendance/StaffAttendanceDashboard';
import StaffPerformanceDashboard from './modules/hr/performance/StaffPerformanceDashboard';
import Payroll from './modules/payroll/Payroll';
import RecruitmentDashboard from './modules/hr/recruitment/RecruitmentDashboard';
import Settings from './modules/settings/Settings';
import PayrollDashboard from './modules/payroll/PayrollDashboard';
import EmployeeDeductionsDashboard from './modules/payroll/EmployeeDeductionsDashboard';
import EmployeeEarningsDashboard from './modules/payroll/EmployeeEarningsDashboard';
import FinancialInstitutionsDashboard from './modules/payroll/FinancialInstitutionsDashboard';
import StatutorySettingsDashboard from './modules/payroll/StatutoryDashboard';

/* --- User management and Settings --- */
import MyAccount from './modules/users/MyAccount';
import UsersManagement from './modules/users/UsersManagement';
import RolesManagement from './modules/users/RolesManagement';

function App() {
  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
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
        <Route path="/dashboard/students/times" element={<div>Class Times Placeholder</div>} />

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
        <Route path="/dashboard/procurement/inventory" element={<InventoryDashboard/>} />
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
        <Route path="/dashboard/hr/hr-reports" element={<div>HR Reports Placeholder</div>} />
        <Route path="/dashboard/payroll" element={<Payroll />} />
        <Route path="/dashboard/payroll/process" element={<PayrollDashboard/>} />
        <Route path="/dashboard/payroll/earnings" element={<EmployeeEarningsDashboard />} />
        <Route path="/dashboard/payroll/deductions" element={<EmployeeDeductionsDashboard />} />
        <Route path="/dashboard/payroll/financial" element={<FinancialInstitutionsDashboard />} />
        <Route path="/dashboard/payroll/statutory" element={<StatutorySettingsDashboard />} />
        <Route path="/dashboard/payroll/settings" element={<div>Payroll Settings Placeholder</div>} />
        
        <Route path="/dashboard/users" element={<UsersManagement />} />
        <Route path="/dashboard/users/list" element={<UsersManagement />} />
        <Route path="/dashboard/users/account" element={<MyAccount />} />
        <Route path="/dashboard/users/roles" element={<RolesManagement />} />
        <Route path="/dashboard/settings" element={<Settings />} />

        {/* Legacy/Top-level Settings (if needed, or redirect) */}
        <Route path="/settings" element={<Settings />} /> {/* Might duplicate, but user had it */}
      </Routes>
    </div>
  );
}


export default App;
