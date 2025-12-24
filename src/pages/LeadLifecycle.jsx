import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, User, Phone, Shield, ArrowDown, Archive } from 'lucide-react';

const LeadLifecycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLife = async () => {
      try {
        const res = await api.get(`/leads/${id}/lifecycle`);
        setLead(res.data);
      } catch (err) {
        console.error("Error fetching lifecycle");
      } finally {
        setLoading(false);
      }
    };
    fetchLife();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Forensic Data...</div>;
  if (!lead) return <div className="p-10 text-center">Lead Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="text-gray-500 text-sm mb-2 hover:underline">&larr; Back</button>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Activity className="text-brand-medium" /> Lead Forensics: {lead.phoneNumber}
          </h1>
          <p className="text-gray-500">{lead.name || 'Unknown Name'}</p>
        </div>
        
        {/* STATUS BADGE */}
        <div className={`px-4 py-2 rounded-lg text-center ${lead.isArchived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          <p className="text-xs font-bold uppercase">Current Status</p>
          <p className="font-bold text-lg">{lead.status}</p>
          {lead.isArchived && <p className="text-xs mt-1">{lead.archiveReason}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: TOUCH STATS */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500 h-fit">
          <h3 className="font-bold text-gray-700 mb-4">Effort Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Total Touches</span>
              <span className={`font-bold text-xl ${lead.touchCount >= 8 ? 'text-red-600' : 'text-blue-600'}`}>
                {lead.touchCount} / 8
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(lead.touchCount / 8) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-400">System auto-archives after 8 failed attempts.</p>
          </div>
        </div>

        {/* CENTER/RIGHT: THE TIMELINE */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Shield size={18} /> Chain of Custody & Lifecycle
          </h3>

          <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
            
            {/* 1. CREATION */}
            <div className="relative pl-8">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
              <p className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleString()}</p>
              <p className="font-bold text-gray-800">Lead Created / Uploaded</p>
            </div>

            {/* 2. CUSTODY CHAIN (Assignments) */}
            {lead.custodyChain.map((custody, idx) => (
              <div key={idx} className="relative pl-8">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                <p className="text-xs text-gray-400">{new Date(custody.assignedDate).toLocaleString()}</p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-1">
                  <p className="font-bold text-blue-800 text-sm flex items-center gap-2">
                    <User size={14} /> Assigned to {custody.assignedTo?.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    By: {custody.assignedBy?.name} ({custody.roleAtTime})
                  </p>
                </div>
              </div>
            ))}

            {/* 3. HISTORY (Interactions) */}
            {lead.history.map((event, idx) => (
              <div key={`hist-${idx}`} className="relative pl-8">
                <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-white ${
                  event.action.includes('Call') ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                
                <p className="text-xs text-gray-400">{new Date(event.date).toLocaleString()}</p>
                
                <div className={`p-3 rounded-lg border mt-1 ${
                  event.action.includes('Call') ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    {event.action.includes('Call') ? <Phone size={14} /> : <Activity size={14} />} 
                    {event.action}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 italic">"{event.details}"</p>
                  <p className="text-[10px] text-gray-400 mt-2 text-right">Actor: {event.by?.name}</p>
                </div>
              </div>
            ))}

            {/* 4. ARCHIVED STATE */}
            {lead.isArchived && (
              <div className="relative pl-8">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-1">
                  <p className="font-bold text-red-800 text-sm flex items-center gap-2">
                    <Archive size={14} /> LEAD ARCHIVED
                  </p>
                  <p className="text-xs text-red-600">{lead.archiveReason}</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadLifecycle;