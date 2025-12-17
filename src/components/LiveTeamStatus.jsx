import React from 'react';
import { Phone, Users, Clock, AlertCircle } from 'lucide-react';

const LiveTeamStatus = ({ data }) => {
  if (!data) return null;
  const { onCall, present, total, late } = data;

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-4 h-full">
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Users size={20} /> Live Floor Status
      </h3>

      {/* 1. AGENTS ON CALL */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Currently On Call</p>
        {onCall.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No active calls.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onCall.map((name, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                <Phone size={10} /> {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. ATTENDANCE MINI-GRID */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 p-2 rounded">
          <span className="block text-xl font-bold text-gray-800">{present}/{total}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Present</span>
        </div>
        <div className="bg-yellow-50 p-2 rounded">
          <span className="block text-xl font-bold text-yellow-700">{late}</span>
          <span className="text-[10px] text-yellow-600 font-bold uppercase flex justify-center items-center gap-1">
             Late
          </span>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <span className="block text-xl font-bold text-red-700">{total - present}</span>
          <span className="text-[10px] text-red-600 font-bold uppercase">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTeamStatus;