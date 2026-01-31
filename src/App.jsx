import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

// Pages
import MyLeads from './pages/MyLeads';
import TeamManagement from './pages/TeamManagement';
import UploadHistory from './pages/UploadHistory';
import AttendanceCalendar from './pages/AttendanceCalendar';
import LeadDetails from './pages/LeadDetails';
import RaiseTicket from './pages/RaiseTicket';
import AdminTicketDesk from './pages/AdminTicketDesk';
import AdminAttendance from './pages/AdminAttendance';
import TaskManager from './pages/TaskManager';
import AdminUpload from './pages/AdminUpload';
import LeadDistribution from './pages/LeadDistribution';
import LeadLifecycle from './pages/LeadLifecycle';
import ArchivedLeads from './pages/ArchivedLeads';
import MyLeave from './pages/MyLeave';

// HR
import HrRoute from './components/HrRoute';
import HrHeadcount from './pages/HrHeadcount';
import HrOrgChart from './pages/HrOrgChart';
import HrPayroll from './pages/HrPayroll';
import HrHolidayCalendar from './pages/HrHolidayCalendar';
import HrLeaveManagement from './pages/HrLeaveManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Private */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>

          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/my-leads" element={<MyLeads />} />
          <Route path="/uploads" element={<UploadHistory />} />
          <Route path="/calendar" element={<AttendanceCalendar />} />
          <Route path="/lead-details" element={<LeadDetails />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
          <Route path="/distribute" element={<LeadDistribution />} />
          <Route path="/archive" element={<ArchivedLeads />} />
          <Route path="/lead-lifecycle/:id" element={<LeadLifecycle />} />

          {/* ❌ LeadManager BLOCKED */}
          <Route
            path="/team"
            element={
              <RoleGuard blockedRoles={['LeadManager', 'Employee']}>
                <TeamManagement />
              </RoleGuard>
            }
          />

          <Route
            path="/tasks"
            element={
              <RoleGuard blockedRoles={['LeadManager']}>
                <TaskManager />
              </RoleGuard>
            }
          />

          <Route
            path="/raise-ticket"
            element={
              <RoleGuard blockedRoles={['LeadManager']}>
                <RaiseTicket />
              </RoleGuard>
            }
          />

          <Route
            path="/admin-tickets"
            element={
              <RoleGuard blockedRoles={['LeadManager']}>
                <AdminTicketDesk />
              </RoleGuard>
            }
          />

          <Route
            path="/admin-attendance"
            element={
              <RoleGuard blockedRoles={['LeadManager']}>
                <AdminAttendance />
              </RoleGuard>
            }
          />

          {/* ✅ MY LEAVE — EMPLOYEE & TEAM LEAD ONLY */}
          <Route
            path="/leave"
            element={
              <RoleGuard allowedRoles={['Employee', 'TeamLead']}>
                <MyLeave />
              </RoleGuard>
            }
          />

          {/* HR MODULE */}
          <Route path="/hr/headcount" element={<HrRoute><HrHeadcount /></HrRoute>} />
          <Route path="/hr/org-chart" element={<HrRoute><HrOrgChart /></HrRoute>} />
          <Route path="/hr/payroll" element={<HrRoute><HrPayroll /></HrRoute>} />
          <Route path="/hr/holidays" element={<HrRoute><HrHolidayCalendar /></HrRoute>} />
          <Route path="/hr/leaves" element={<HrRoute><HrLeaveManagement /></HrRoute>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
