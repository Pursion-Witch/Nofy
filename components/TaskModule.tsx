

import React, { useState } from 'react';
import { ClipboardList, CheckSquare, Coffee, BellRing, Plus, Trash2, X } from 'lucide-react';
import { LiveLog } from './LiveLog';
import { LogEntry, Task } from '../types';

interface TaskModuleProps {
  logs: LogEntry[];
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: '08:00 Queue Check', description: 'Monitor check-in density.', dueTime: '08:00', status: 'COMPLETED', type: 'QUEUE_CHECK' },
  { id: 't2', title: '08:30 Hazard Patrol', description: 'Confirm Zone B is clear of spills.', dueTime: '08:30', status: 'PENDING', type: 'HAZARD_CHECK' },
  { id: 't3', title: '09:00 Restroom Insp', description: 'Verify cleanliness with janitorial.', dueTime: '09:00', status: 'PENDING', type: 'ROAMING' },
];

export const TaskModule: React.FC<TaskModuleProps> = ({ logs }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '' });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
       t.id === id ? { ...t, status: t.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : t
    ));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.time) return;
    const task: Task = {
      id: Date.now().toString(),
      title: `${newTask.time} ${newTask.title}`,
      description: 'Custom Routine Added',
      dueTime: newTask.time,
      status: 'PENDING',
      type: 'ROAMING'
    };
    setTasks(prev => [...prev, task].sort((a,b) => a.dueTime.localeCompare(b.dueTime)));
    setNewTask({ title: '', time: '' });
    setIsAdding(false);
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-4">
       
       {/* BUTTON 5: SHIFT ROUTINE */}
       <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-4 shadow-lg">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                My Shift Routine
             </h3>
             <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsAdding(!isAdding)}
                   className="p-1 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                 >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 </button>
                 <span className="text-[10px] text-indigo-300 bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-500/30 animate-pulse">
                    Active Shift
                 </span>
             </div>
          </div>
          
          {isAdding && (
             <div className="mb-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2 mb-2">
                   <input 
                     type="time" 
                     value={newTask.time}
                     onChange={e => setNewTask({...newTask, time: e.target.value})}
                     className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                   />
                   <input 
                     type="text" 
                     placeholder="Routine Name (e.g. Gate Check)"
                     value={newTask.title}
                     onChange={e => setNewTask({...newTask, title: e.target.value})}
                     className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                   />
                </div>
                <button 
                   onClick={addTask}
                   className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors"
                >
                   Add Routine
                </button>
             </div>
          )}

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
             {tasks.map(task => (
                <div 
                   key={task.id} 
                   onClick={() => toggleTask(task.id)}
                   className={`group p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      task.status === 'COMPLETED' 
                      ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                   }`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                         task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-indigo-400'
                      }`}>
                         {task.status === 'COMPLETED' && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                         <div className={`text-sm font-bold ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {task.title}
                         </div>
                         <div className="text-[10px] text-slate-400">{task.description}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="text-xs font-mono text-slate-500">{task.dueTime}</div>
                      <button 
                        onClick={(e) => deleteTask(task.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-900/50 rounded text-slate-600 hover:text-rose-400 transition-all"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
             ))}
          </div>

          {/* Quick Clear Button */}
          <button className="mt-3 w-full py-2 bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 rounded-lg text-xs font-bold hover:bg-emerald-900/30 transition-colors">
             Report "Zone Clear" (Log Check)
          </button>
       </div>

       {/* LIVE LOG BELOW TASKS */}
       <div className="flex-grow min-h-0">
          <LiveLog logs={logs} />
       </div>

    </div>
  );
};