import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CheckSquare, Square, Plus, User, Phone, Calendar as CalIcon, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskManager = () => {
  const [inbox, setInbox] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });

  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const canAssign = role !== 'Employee'; 

  useEffect(() => {
    fetchTasks();
    if (canAssign) fetchSubordinates();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setInbox(res.data.inbox);
      setOutbox(res.data.outbox);
    } catch (err) {
      console.error("Failed to load tasks");
    }
  };

  const fetchSubordinates = async () => {
    try {
      const res = role === 'Admin' 
        ? await api.get('/auth/all-users') 
        : await api.get('/auth/subordinates');
      setSubordinates(res.data);
    } catch (err) {
      console.error("Failed to load team");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks/create', newTask);
      alert("Task Assigned!");
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id) => {
    // Optimistic UI update (make it feel fast)
    if(!window.confirm("Complete this task?")) return;
    
    try {
      await api.put(`/tasks/${id}/complete`);
      fetchTasks(); // Refresh to move it to history
    } catch (err) {
      alert("Error");
    }
  };

  const handleLeadClick = (lead) => {
    if (lead) navigate('/lead-details', { state: { lead } });
  };

  // --- HELPER: DEADLINE COLOR LOGIC ---
  const getDeadlineInfo = (dateString) => {
    const due = new Date(dateString);
    const now = new Date();
    
    // Reset hours for pure date comparison
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    const diff = (due - now) / (1000 * 60 * 60 * 24); // Days difference

    if (diff < 0) return { color: "text-red-600 font-bold", text: "Overdue" };
    if (diff === 0) return { color: "text-orange-600 font-bold", text: "Due Today" };
    return { color: "text-gray-500", text: new Date(dateString).toLocaleDateString() };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <CheckSquare size={32} /> Task Manager
      </h1>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'inbox' ? 'bg-brand-medium text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          My To-Do List ({inbox.filter(t => t.status === 'Pending').length})
        </button>
        {canAssign && (
          <button 
            onClick={() => setActiveTab('assign')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'assign' ? 'bg-brand-medium text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Assign Task
          </button>
        )}
        {canAssign && (
          <button 
            onClick={() => setActiveTab('outbox')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'outbox' ? 'bg-brand-medium text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Assigned by Me ({outbox.length})
          </button>
        )}
      </div>

      {/* --- TAB: INBOX (My Tasks) --- */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {inbox.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow text-gray-400">
              <CheckSquare size={48} className="mx-auto mb-2 opacity-20" />
              <p>All caught up! No pending tasks.</p>
            </div>
          ) : (
            inbox.map(task => {
              const deadline = getDeadlineInfo(task.dueDate);
              const isCompleted = task.status === 'Completed';

              return (
                <div key={task._id} className={`bg-white p-5 rounded-xl shadow-md border-l-4 flex justify-between items-center transition ${isCompleted ? 'border-green-500 opacity-60 bg-gray-50' : 'border-brand-medium'}`}>
                  
                  {/* LEFT SIDE: INFO */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {/* TYPE BADGE */}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        task.type === 'Manual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.type === 'Manual' ? 'Direct Order' : 'Follow Up'}
                      </span>
                      
                      {/* PRIORITY BADGE */}
                      {task.priority === 'High' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle size={10} /> High Priority
                        </span>
                      )}

                      {/* DEADLINE */}
                      <span className={`text-xs flex items-center gap-1 ${deadline.color}`}>
                        <Clock size={12}/> {deadline.text}
                      </span>
                    </div>

                    <h3 className={`font-bold text-lg text-gray-800 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    
                    {/* Action: Call Lead */}
                    {task.relatedLead && !isCompleted && (
                      <button 
                        onClick={() => handleLeadClick(task.relatedLead)}
                        className="text-xs bg-brand-light hover:bg-brand-medium text-white px-3 py-1.5 rounded flex items-center gap-1 transition shadow"
                      >
                        <Phone size={12} /> Call Lead Now
                      </button>
                    )}
                    
                    {task.type === 'Manual' && (
                       <p className="text-xs text-gray-400 mt-2">Assigned by: {task.assignedBy?.name}</p>
                    )}
                  </div>
                  
                  {/* RIGHT SIDE: ACTION BUTTON */}
                  <div>
                    {isCompleted ? (
                      <div className="flex flex-col items-center text-green-600 font-bold text-xs">
                        <CheckSquare size={32} />
                        <span>DONE</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => markComplete(task._id)}
                        className="group flex flex-col items-center gap-1 text-gray-400 hover:text-green-600 transition"
                        title="Click to Complete"
                      >
                        {/* Empty Square that turns into Check on Hover */}
                        <Square size={32} className="group-hover:hidden" />
                        <CheckSquare size={32} className="hidden group-hover:block" />
                        <span className="text-xs font-bold">Mark Done</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- TAB: ASSIGN TASK (Managers Only) --- */}
      {activeTab === 'assign' && canAssign && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-light max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-brand-dark">
            <Plus size={20}/> Create New Task
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                <select 
                  required
                  className="w-full pl-10 p-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-medium"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">-- Select Team Member --</option>
                  {subordinates.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
              <input 
                required
                type="text" 
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-brand-medium"
                placeholder="e.g. Clean Desk / Submit Report"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-brand-medium"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-brand-medium"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                rows="3"
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-brand-medium"
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-medium hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>
        </div>
      )}

      {/* --- TAB: OUTBOX (Tasks I assigned) --- */}
      {activeTab === 'outbox' && canAssign && (
        <div className="grid gap-4">
          {outbox.map(task => (
            <div key={task._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{task.title}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Assigned to: <strong>{task.assignedTo?.name}</strong></p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                {task.priority === 'High' && <span className="text-red-500 font-bold">High Priority</span>}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TaskManager;