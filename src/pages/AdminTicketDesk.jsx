import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Check, Clock, User } from 'lucide-react';

const AdminTicketDesk = () => {
  const [tickets, setTickets] = useState([]);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets");
    }
  };

  const markResolved = async (id) => {
    // INPUT: Ask how they solved it
    const details = prompt("Please enter resolution details/remarks:");
    if (!details) return; // Cancel if empty

    try {
      await api.put(`/tickets/${id}/resolve`, { resolutionDetails: details });
      fetchTickets();
    } catch (err) {
      alert("Error updating ticket");
    }
  };

  // Helper: Can I resolve this specific ticket?
  const canResolve = (ticket) => {
    if (ticket.status === 'Resolved') return false;
    if (role === 'Admin') return true; // Admin can resolve anything
    if (role === 'BranchManager' && ticket.recipient === 'BranchManager') return true;
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <Shield /> Support Desk ({role === 'Admin' ? 'Master View' : 'Manager View'})
      </h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Date</th>
              <th className="p-4">Reported By</th>
              <th className="p-4">Issue</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Resolution</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {tickets.map((ticket, index) => (
              <tr key={ticket._id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-400 font-mono">{index + 1}</td>
                <td className="p-4 text-xs text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400"/>
                    <div>
                      <p className="font-bold text-gray-800">{ticket.createdBy?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">{ticket.createdBy?.role}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <p className="font-bold text-sm text-brand-dark">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
                  <span className="text-[10px] bg-gray-100 px-1 rounded">{ticket.category}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-700' : 
                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                   <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                     {ticket.recipient}
                   </span>
                </td>
                <td className="p-4 max-w-xs">
                   {ticket.status === 'Resolved' ? (
                     <div className="text-xs">
                        <p className="text-green-700 font-bold flex items-center gap-1">
                          <Check size={10} /> Solved
                        </p>
                        <p className="text-gray-500 italic truncate" title={ticket.resolutionDetails}>
                          "{ticket.resolutionDetails}"
                        </p>
                     </div>
                   ) : (
                     <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
                       <Clock size={10} /> Pending
                     </span>
                   )}
                </td>
                <td className="p-4">
                  {canResolve(ticket) && (
                    <button 
                      onClick={() => markResolved(ticket._id)}
                      className="bg-brand-medium text-white px-3 py-1 rounded text-xs hover:bg-brand-dark transition shadow"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTicketDesk;