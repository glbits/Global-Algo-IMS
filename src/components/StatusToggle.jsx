import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Coffee, Phone, UserCheck, Moon, Laptop, Utensils } from 'lucide-react';

const StatusToggle = () => {
  const [status, setStatus] = useState('Offline');
  const [durations, setDurations] = useState({});
  const [scheduledLogout, setScheduledLogout] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');

  // Helper: Is this user subject to strict rules? (Everyone except Admin)
  const isStrictUser = role !== 'Admin';

  // 1. Initial Load
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/current');
      setStatus(res.data.currentStatus || 'Offline');
      setDurations(res.data.durations || {});
      if(res.data.scheduledLogout) setScheduledLogout(new Date(res.data.scheduledLogout));
    } catch (err) {
      console.error("Failed to fetch status");
    }
  };

  // 2. THE HEARTBEAT (Runs every minute to check Rules)
  useEffect(() => {
    const ruleInterval = setInterval(() => {
      // RULE: Automate for Employee, HR, AND BranchManager (Skip Admin)
      if (!isStrictUser) return; 
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // --- RULE A: AUTO LUNCH AT 1:40 PM (13:40) ---
      if (hours === 13 && minutes === 38) {
        alert("⚠️ Lunch time starts in 2 minutes!"); 
      }

      if (hours === 13 && minutes === 40) {
        // Smart Check: Don't interrupt a call (even for managers if they are calling)
        if (status !== 'Lunch Time' && status !== 'On-call') {
          console.log("Auto-switching to Lunch");
          performStatusChange('Lunch Time'); 
        }
      }

      // --- RULE B: AUTO LOGOUT (Based on Calculated Time) ---
      // Hard stop at 5:30 PM (17:30) regardless
      if (hours === 17 && minutes === 30) {
         if (status !== 'Offline' && status !== 'On-call') {
           alert("Shift End: 5:30 PM. Logging out.");
           performStatusChange('Offline');
         }
      }
      
    }, 60000); // Check every minute

    return () => clearInterval(ruleInterval);
  }, [status, role]);

  // Helper function to actually hit the API
  const performStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const res = await api.post('/attendance/status', { newStatus });
      setStatus(res.data.currentStatus);
      setDurations(res.data.durations);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to change status");
    } finally {
      setLoading(false);
    }
  };

  // 3. MANUAL CLICK HANDLER (With Strict Blocks)
  const changeStatus = async (newStatus) => {
    if (newStatus === status) return;
    
    // --- STRICT RULES FOR EVERYONE (Except Admin) ---
    if (isStrictUser) {
      
      // BLOCK MANUAL LUNCH
      if (newStatus === 'Lunch Time') {
        alert("🚫 System Message: Lunch is automated at 1:40 PM. You cannot switch manually.");
        return;
      }

      // BLOCK MANUAL OFFLINE
      if (newStatus === 'Offline') {
        const timeString = scheduledLogout 
          ? scheduledLogout.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
          : '5:30 PM';
        
        alert(`🚫 System Message: Your shift ends automatically at ${timeString}. Manual logout is disabled.`);
        return;
      }

      // Evaluation Confirmation (Mostly for Employees, but keeps logic safe)
      if (newStatus === 'Evaluation') {
        const confirm = window.confirm("Requesting 'Evaluation'. Proceed?");
        if (!confirm) return;
      }
    }

    performStatusChange(newStatus);
  };

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00s";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getTimeStyle = (seconds, limitInMinutes) => {
    if (!limitInMinutes) return "text-gray-700";
    const limitSeconds = limitInMinutes * 60;
    return seconds > limitSeconds ? "text-red-600 font-bold animate-pulse" : "text-gray-700";
  };

  const getButtonColor = (key) => {
    if (status === key) return "bg-brand-medium text-white shadow-lg ring-2 ring-blue-300 transform scale-105"; 
    
    // Grey out disabled buttons visually for Strict Users
    if (isStrictUser && (key === 'Lunch Time' || key === 'Offline')) {
      return "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200";
    }

    return "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"; 
  };

  const ALL_OPTIONS = [
    { key: 'Online', icon: <Laptop size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'On-call', icon: <Phone size={16} />, allowed: ['Employee'] },
    { key: 'Break', icon: <Coffee size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'Lunch Time', icon: <Utensils size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'Evaluation', icon: <UserCheck size={16} />, allowed: ['Employee'] },
    { key: 'Offline', icon: <Moon size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
  ];

  const visibleOptions = ALL_OPTIONS.filter(opt => opt.allowed.includes(role));

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-brand-light mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <h3 className="font-bold text-brand-dark flex items-center gap-2 text-lg">
          <Clock size={20} /> 
          Live Status: <span className="text-brand-medium uppercase tracking-wider">{status}</span>
        </h3>
        <span className="text-xs text-green-600 font-mono animate-pulse">● LIVE TRACKING</span>
      </div>

      <div className={`grid gap-3 mb-6 ${role === 'Employee' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
        {visibleOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => changeStatus(opt.key)}
            disabled={loading}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all text-sm font-medium ${getButtonColor(opt.key)}`}
          >
            <div className="mb-1">{opt.icon}</div>
            {opt.key}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="font-bold text-gray-400 uppercase text-xs mb-3 tracking-wide">Time Utilization (Today)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8 text-sm font-mono">
          
          <div className="flex justify-between">
            <span>💻 Online:</span> 
            <b className="text-brand-dark">{formatTime(durations.Online)}</b>
          </div>
          
          {role === 'Employee' && (
            <div className="flex justify-between">
              <span>📞 On-call:</span> 
              <b className="text-brand-dark">{formatTime(durations['On-call'])}</b>
            </div>
          )}

          <div className="flex justify-between">
            <span>☕ Break:</span> 
            <span className={getTimeStyle(durations.Break, 20)}>
              {formatTime(durations.Break)} / 20m
            </span>
          </div>

          <div className="flex justify-between">
            <span>🍔 Lunch:</span> 
            <span className={getTimeStyle(durations['Lunch Time'], 40)}>
              {formatTime(durations['Lunch Time'])} / 40m
            </span>
          </div>

          {role === 'Employee' && (
            <div className="flex justify-between">
              <span>📋 Evaluation:</span> 
              <b>{formatTime(durations.Evaluation)}</b>
            </div>
          )}

          <div className="flex justify-between">
            <span>🌙 Offline:</span> 
            <span className={getTimeStyle(durations.Offline, 960)}>
              {formatTime(durations.Offline)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusToggle;