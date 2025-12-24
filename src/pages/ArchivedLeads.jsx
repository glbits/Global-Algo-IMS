import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Archive, Search, Eye, AlertTriangle } from 'lucide-react';

const ArchivedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await api.get('/leads/archived');
        setLeads(res.data);
      } catch (err) {
        console.error("Error loading archive");
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-full text-red-600">
          <Archive size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dead Lead Archive</h1>
          <p className="text-gray-500 text-sm">Leads removed from circulation (DND, Wrong Number, or 8 Touches).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-500 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading graveyard...</div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Archive size={48} className="mx-auto mb-2 opacity-20" />
            <p>No archived leads found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="p-4">Phone / Name</th>
                <th className="p-4">Reason for Death</th>
                <th className="p-4">Total Touches</th>
                <th className="p-4">Last Handler</th>
                <th className="p-4">Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-red-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-800 font-mono">{lead.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{lead.name}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      {lead.archiveReason || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-600">
                    {lead.touchCount} / 8
                  </td>
                  <td className="p-4 text-gray-600">
                    {lead.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/lead-lifecycle/${lead._id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs"
                    >
                      <Eye size={14} /> View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArchivedLeads;