import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Archive, RefreshCw, UserCheck, AlertOctagon } from 'lucide-react';

const ArchivedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get Dead Leads
        const deadRes = await api.get('/leads/archived');
        // 2. Get Employees (For the dropdown)
        const empRes = await api.get('/auth/all-users');
        
        setLeads(deadRes.data);
        setEmployees(empRes.data.filter(u => u.role === 'Employee'));
      } catch (err) {
        console.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Admin Override
  const handleReassign = async (leadId, newUserId) => {
    if (!newUserId) return;
    if (!window.confirm("Force reassign this lead? It will become Active for the selected agent.")) return;

    try {
      await api.post('/leads/reassign', { leadId, newUserId });
      alert("Lead Reassigned & Reactivated!");
      // Remove from list locally since it's no longer "Archived"
      setLeads(prev => prev.filter(l => l._id !== leadId));
    } catch (err) {
      alert("Failed to reassign");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-800 rounded-full text-white">
          <Archive size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lead Graveyard & Recycling</h1>
          <p className="text-gray-500 text-sm">View dead leads or reactivate them manually.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-gray-600 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Graveyard is empty.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4">Lead Info</th>
                <th className="p-4">Death Reason</th>
                <th className="p-4">Last Handler</th>
                <th className="p-4">History</th>
                <th className="p-4">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => {
                // Find who dumped it
                const lastHistory = lead.history?.slice(-1)[0];

                return (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    {/* INFO */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{lead.phoneNumber}</p>
                      <p className="text-xs text-gray-500">{lead.name}</p>
                    </td>

                    {/* REASON */}
                    <td className="p-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1">
                        <AlertOctagon size={12}/> {lead.archiveReason || 'Unknown'}
                      </span>
                    </td>

                    {/* HANDLER */}
                    <td className="p-4">
                      <div className="text-xs">
                        <p className="font-bold text-gray-700">{lastHistory?.by?.name || 'System'}</p>
                        <p className="text-gray-400">{new Date(lead.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </td>

                    {/* VIEW REPORT BUTTON */}
                    <td className="p-4">
                      <button 
                        onClick={() => navigate(`/lead-lifecycle/${lead._id}`)}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        View Full Timeline
                      </button>
                    </td>

                    {/* ADMIN REASSIGN */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select 
                          className="border rounded text-xs p-1 w-32"
                          onChange={(e) => handleReassign(lead._id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Revive to...</option>
                          {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArchivedLeads;