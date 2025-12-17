import React from 'react';
import { Activity } from 'lucide-react';

const LeadUtilization = ({ data }) => {
  if (!data) return null;
  const { assigned, contacted } = data;
  const percent = assigned > 0 ? Math.round((contacted / assigned) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-purple-500 p-4 h-full flex flex-col justify-center">
      <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
        <Activity size={20} /> Lead Velocity
      </h3>
      
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-3xl font-black text-purple-700">{contacted}</span>
          <span className="text-gray-400 text-xs"> / {assigned} given today</span>
        </div>
        <span className="text-xl font-bold text-gray-300">{percent}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-1000" 
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LeadUtilization;