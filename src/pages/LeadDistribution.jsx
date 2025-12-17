import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const LeadDistribution = () => {
  const [myLeadCount, setMyLeadCount] = useState(0);
  const [subordinates, setSubordinates] = useState([]);
  const [distributions, setDistributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/leads/stats');
      setMyLeadCount(statsRes.data.availableLeads);

      const subRes = await api.get('/auth/subordinates');
      setSubordinates(subRes.data);
      
      const initialDist = {};
      subRes.data.forEach(sub => initialDist[sub._id] = 0);
      setDistributions(initialDist);
    } catch (err) {
      console.error("Error loading data");
    }
  };

  const handleInputChange = (userId, value) => {
    setDistributions(prev => ({ ...prev, [userId]: parseInt(value) || 0 }));
  };

  const handleEqualSplit = () => {
    if (subordinates.length === 0 || myLeadCount === 0) return;
    const perPerson = Math.floor(myLeadCount / subordinates.length);
    const newDist = {};
    subordinates.forEach(sub => newDist[sub._id] = perPerson);
    setDistributions(newDist);
  };

  const handleDistribute = async () => {
    const assignments = Object.entries(distributions).map(([userId, count]) => ({ userId, count }));
    const totalRequested = assignments.reduce((acc, curr) => acc + curr.count, 0);

    if (totalRequested > myLeadCount) {
      setMsg({ text: `Error: You only have ${myLeadCount} leads.`, type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/leads/distribute', { assignments });
      setMsg({ text: res.data.msg, type: 'success' });
      fetchData(); // Refresh counts
    } catch (err) {
      setMsg({ text: "Distribution Failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <Users /> Lead Distribution Center
      </h1>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-light p-8">
        
        <div className="bg-brand-bg p-6 rounded-xl mb-8 flex justify-between items-center border border-brand-light">
          <div>
            <p className="text-gray-600 font-bold mb-1">Your Available Pool</p>
            <p className="text-sm text-gray-500">Leads ready to assign</p>
          </div>
          <span className="text-4xl font-black text-brand-dark">{myLeadCount}</span>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Team Allocation</h3>
          {subordinates.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No team members found.</p>
          ) : (
            <div className="space-y-4">
              {subordinates.map(sub => (
                <div key={sub._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{sub.name}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">{sub.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-bold">Leads:</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-24 p-2 border rounded text-center font-bold text-lg text-brand-dark focus:ring-2 focus:ring-brand-medium outline-none"
                      value={distributions[sub._id]}
                      onChange={(e) => handleInputChange(sub._id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleEqualSplit}
            className="flex-1 py-3 text-brand-medium font-bold border-2 border-brand-medium rounded-lg hover:bg-brand-bg transition"
          >
            Auto-Split Equally
          </button>
          <button 
            onClick={handleDistribute}
            disabled={loading || myLeadCount === 0}
            className="flex-1 bg-brand-dark hover:bg-black text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? 'Processing...' : 'Confirm Distribution'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDistribution;