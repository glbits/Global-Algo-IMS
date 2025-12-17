import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AlertCircle, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PriorityTasks = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopTasks = async () => {
      try {
        const res = await api.get('/tasks');
        // Filter for Pending, sort by Priority (High first), take top 3
        const pending = res.data.inbox
          .filter(t => t.status === 'Pending')
          .sort((a, b) => (a.priority === 'High' ? -1 : 1))
          .slice(0, 3);
        setTasks(pending);
      } catch (err) {
        console.error("Failed to load tasks");
      }
    };
    fetchTopTasks();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-500 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <AlertCircle className="text-red-500" /> Priority Tasks
        </h2>
        <button 
          onClick={() => navigate('/tasks')}
          className="text-xs font-bold text-brand-medium hover:underline flex items-center"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-20" />
            <p>No urgent tasks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task._id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800 text-sm truncate w-48">{task.title}</p>
                  <p className="text-xs text-red-600 font-bold">
                    {task.priority} • Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/tasks')}
                  className="bg-white text-red-600 p-2 rounded-full shadow hover:bg-red-600 hover:text-white transition"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityTasks;