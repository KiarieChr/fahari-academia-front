import { Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import VerifyOtp from './auth/VerifyOtp';
import ResetPassword from './auth/ResetPassword';
import DashboardHome from './dashboard/DashboardHome';
import StudentManagement from './modules/students/StudentManagement';
import StudentAcademics from './modules/academics/StudentAcademics';
import StudentFees from './modules/fees/StudentFees';
import Finance from './modules/finance/Finance';
import Procurement from './modules/procurement/Procurement';
import HumanResource from './modules/hr/HumanResource';
import Payroll from './modules/payroll/Payroll';
import UsersManagement from './modules/users/UsersManagement';
import Settings from './modules/settings/Settings';
import StaffRegister from './modules/hr/StaffRegister';
import LeaveDashboard from './modules/hr/leave/LeaveDashboard';
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <div className="app">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<DashboardHome />} />

        {/* Module Routes */}
        <Route path="/dashboard/students" element={<StudentManagement />} />
        <Route path="/dashboard/academics" element={<StudentAcademics />} />
        <Route path="/dashboard/fees" element={<StudentFees />} />
        <Route path="/dashboard/finance" element={<Finance />} />
        <Route path="/dashboard/procurement" element={<Procurement />} />
        <Route path="/dashboard/hr" element={<HumanResource />} />
        <Route path="/hr/staff-register/" element={<StaffRegister />} />
        <Route path="/dashboard/hr/leave" element={<LeaveDashboard />} />
        <Route path="/dashboard/payroll" element={<Payroll />} />
        <Route path="/dashboard/users" element={<UsersManagement />} />
        <Route path="/dashboard/users/list" element={<UsersManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
