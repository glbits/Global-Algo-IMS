import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Phone, Users, Wallet, Play, CheckSquare } from 'lucide-react';

// Components
import StatusToggle from '../components/StatusToggle';
import PriorityTasks from '../components/PriorityTasks';
import LiveTeamStatus from '../components/LiveTeamStatus';
import LeadUtilization from '../components/LeadUtilization';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // ROLES
  const isAdmin = role === 'Admin';
  const isBranchManager = role === 'BranchManager';
  const isTeamLead = role === 'TeamLead';
  const isEmployee = role === 'Employee';

  // Can Monitor Others? (Admin, BM, TL)
  const isManager = isAdmin || isBranchManager || isTeamLead;
  // Has Personal Attendance? (Employee & TL)
  const hasAttendance = isEmployee || isTeamLead;

  // STATE
  const [managerData, setManagerData] = useState(null);
  const [empStats, setEmpStats] = useState(null);

  useEffect(() => {
    // 1. Fetch Manager Data (If Manager)
    if (isManager) {
      api.get('/dashboard/manager-stats')
        .then(res => setManagerData(res.data))
        .catch(err => console.error("Mgr Stats Error"));
    }

    // 2. Fetch Employee Personal Stats (Everyone has some personal stats)
    api.get('/leads/stats')
      .then(res => setEmpStats({
        calls: res.data.callsToday || 0,
        conversions: res.data.conversions || 0,
        earnings: res.data.estimatedEarnings || 0,
        newLeads: res.data.availableLeads || 0
      }))
      .catch(err => console.error("Emp Stats Error"));
  }, [isManager]);

  // --- WIDGET: QUICK DIAL (BM, TL, Emp) ---
  const QuickDialWidget = () => (
    <div 
      onClick={() => navigate('/my-leads')}
      className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg p-5 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-between"
    >
      <div>
        <h3 className="font-bold text-lg">Quick Dial</h3>
        <p className="text-blue-100 text-sm">Start calling your active list</p>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        <Phone size={24} fill="white" />
      </div>
    </div>
  );

  // --- WIDGET: MY COLLECTION (BM, TL, Emp) ---
  const CollectionWidget = () => (
    <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase">My Collection</p>
        <p className="text-2xl font-black text-green-700">₹{empStats?.earnings?.toLocaleString() || 0}</p>
      </div>
      <Wallet className="text-green-200" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* 1. ATTENDANCE SECTION (TL & Employee ONLY) */}
      {hasAttendance && (
        <div className="mb-6">
           <StatusToggle />
        </div>
      )}

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {role === 'TeamLead' ? 'Team Lead' : role} Dashboard
      </h1>

      {/* --- DASHBOARD LAYOUTS --- */}

      {/* A. ADMIN VIEW */}
      {isAdmin && managerData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1: Team Overview */}
          <LiveTeamStatus data={managerData.attendanceSummary} />
          <LeadUtilization data={managerData.leadStats} />
          
          {/* Row 1: Priority Tasks */}
          <div className="h-full">
            <PriorityTasks />
          </div>
        </div>
      )}

      {/* B. BRANCH MANAGER & TEAM LEAD VIEW */}
      {(isBranchManager || isTeamLead) && managerData && (
        <div className="space-y-6">
          {/* Row 1: Team & Collection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LiveTeamStatus data={managerData.attendanceSummary} />
            <CollectionWidget />
            <LeadUtilization data={managerData.leadStats} />
          </div>

          {/* Row 2: Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <QuickDialWidget />
             <div className="h-64">
               <PriorityTasks />
             </div>
          </div>
        </div>
      )}

      {/* C. EMPLOYEE VIEW */}
      {isEmployee && empStats && (
        <div className="space-y-6">
          {/* Row 1: Personal Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-xl shadow border-b-4 border-blue-500">
                <p className="text-xs text-gray-400 font-bold uppercase">Calls Today</p>
                <p className="text-2xl font-bold text-blue-700">{empStats.calls}</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow border-b-4 border-green-500">
                <p className="text-xs text-gray-400 font-bold uppercase">Converted</p>
                <p className="text-2xl font-bold text-green-700">{empStats.conversions}</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow border-b-4 border-purple-500">
                <p className="text-xs text-gray-400 font-bold uppercase">New Leads</p>
                <p className="text-2xl font-bold text-purple-700">{empStats.newLeads}</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow border-b-4 border-orange-500">
                <p className="text-xs text-gray-400 font-bold uppercase">Earnings</p>
                <p className="text-2xl font-bold text-orange-700">₹{empStats.earnings}</p>
             </div>
          </div>

          {/* Row 2: Actions & Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <QuickDialWidget />
               {/* Maybe add a motivation card or announcements here */}
            </div>
            <div className="h-full">
              <PriorityTasks />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;