import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Users,
  UserPlus,
  Calendar,
  CalendarDays,
  LifeBuoy,
  UploadCloud,
  Share2,
  CheckSquare,
  Archive,
  FileSpreadsheet,
  Network,
  BadgeDollarSign,
  UsersRound
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-brand-medium text-white'
      : 'text-gray-300 hover:bg-brand-medium/50 hover:text-white';

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* SIDEBAR */}
      <aside className="w-64 bg-brand-dark shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b border-brand-light">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            IMS<span className="text-brand-light">PRO</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">System v1.0</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">

          {/* DASHBOARD (ALL) */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/dashboard')}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* ================= HR MODULE (HR ONLY) ================= */}
          {role === 'HR' && (
            <>
              <button onClick={() => navigate('/hr/holidays')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/hr/holidays')}`}>
                <CalendarDays size={20} />
                <span>Holiday Calendar</span>
              </button>

              <button onClick={() => navigate('/hr/leaves')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/hr/leaves')}`}>
                <Calendar size={20} />
                <span>Leave Management</span>
              </button>

              <button onClick={() => navigate('/hr/headcount')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/hr/headcount')}`}>
                <UsersRound size={20} />
                <span>Headcount</span>
              </button>

              <button onClick={() => navigate('/hr/org-chart')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/hr/org-chart')}`}>
                <Network size={20} />
                <span>Org Chart</span>
              </button>

              <button onClick={() => navigate('/hr/payroll')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/hr/payroll')}`}>
                <BadgeDollarSign size={20} />
                <span>Payroll</span>
              </button>
            </>
          )}

          {/* ================= UPLOADS (ADMIN + LEAD MANAGER) ================= */}
          {(role === 'Admin' || role === 'LeadManager') && (
            <>
              <button onClick={() => navigate('/admin-upload')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/admin-upload')}`}>
                <UploadCloud size={20} />
                <span>Upload Data</span>
              </button>

              <button onClick={() => navigate('/uploads')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/uploads')}`}>
                <FileSpreadsheet size={20} />
                <span>Upload History</span>
              </button>
            </>
          )}

          {/* ================= DISTRIBUTE LEADS (ALL MANAGERS + LEAD MANAGER) ================= */}
          {(role === 'Admin' || role === 'LeadManager' || role === 'BranchManager' || role === 'TeamLead') && (
            <button onClick={() => navigate('/distribute')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/distribute')}`}>
              <Share2 size={20} />
              <span>Distribute Leads</span>
            </button>
          )}

          {/* ================= DEAD ARCHIVE (ADMIN + LEAD MANAGER) ================= */}
          {(role === 'Admin' || role === 'LeadManager') && (
            <button onClick={() => navigate('/archive')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/archive')}`}>
              <Archive size={20} />
              <span>Dead Archive</span>
            </button>
          )}

          {/* ================= TASKS (EVERYONE EXCEPT LEAD MANAGER & HR) ================= */}
          {role !== 'LeadManager' && role !== 'HR' && (
            <button onClick={() => navigate('/tasks')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/tasks')}`}>
              <CheckSquare size={20} />
              <span>Task List</span>
            </button>
          )}

          {/* ================= MY LEADS (BM, TL, EMPLOYEE ONLY) ================= */}
          {(role === 'BranchManager' || role === 'TeamLead' || role === 'Employee') && (
            <button onClick={() => navigate('/my-leads')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/my-leads')}`}>
              <Users size={20} />
              <span>My Leads</span>
            </button>
          )}

          {/* ================= ADD MEMBER (ADMIN, BM, TL ONLY) ================= */}
          {(role === 'Admin' || role === 'BranchManager' || role === 'TeamLead') && (
            <button onClick={() => navigate('/team')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/team')}`}>
              <UserPlus size={20} />
              <span>Add Member</span>
            </button>
          )}

          {/* ================= SUPPORT DESK (NOT LEAD MANAGER) ================= */}
          {role !== 'LeadManager' && (
            <button
              onClick={() =>
                navigate(
                  role === 'Admin' || role === 'BranchManager' || role === 'HR'
                    ? '/admin-tickets'
                    : '/raise-ticket'
                )
              }
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive(
                role === 'Admin' || role === 'BranchManager' || role === 'HR'
                  ? '/admin-tickets'
                  : '/raise-ticket'
              )}`}
            >
              <LifeBuoy size={20} />
              <span>Support Desk</span>
            </button>
          )}

          {/* ================= STAFF ATTENDANCE (ADMIN + BM + HR) ================= */}
          {(role === 'Admin' || role === 'BranchManager' || role === 'HR') && (
            <button onClick={() => navigate('/admin-attendance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/admin-attendance')}`}>
              <Users size={20} />
              <span>Staff Attendance</span>
            </button>
          )}

          {/* ================= ATTENDANCE HISTORY (EMPLOYEE + TL) ================= */}
          {(role === 'Employee' || role === 'TeamLead') && (
            <button onClick={() => navigate('/calendar')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/calendar')}`}>
              <Calendar size={20} />
              <span>Attendance History</span>
            </button>
          )}

          {/* ================= MY LEAVES (EMPLOYEE + TL ONLY) ================= */}
          {(role === 'Employee' || role === 'TeamLead') && (
            <button onClick={() => navigate('/leave')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/leave')}`}>
              <Calendar size={20} />
              <span>My Leaves</span>
            </button>
          )}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-brand-light">
          <p className="text-sm text-gray-300">Logged in as</p>
          <p className="font-semibold text-white mb-4">{role}</p>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
