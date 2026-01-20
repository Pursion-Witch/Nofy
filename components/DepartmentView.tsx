
import React from 'react';
import { Department, LogEntry, IncidentSeverity } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface DepartmentViewProps {
  department: Department;
  deptLogs: LogEntry[];
}

export const DepartmentView: React.FC<DepartmentViewProps> = ({ department, deptLogs }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 h-full overflow-hidden flex flex-col">
      <div className="mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {department.replace('_', ' ')} <span className="text-sky-500">OPERATIONS</span>
        </h3>
        <p className="text-xs text-slate-400">AOCC Directives & Internal Logs</p>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
        {deptLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
                No active directives from AOCC.
            </div>
        )}
        {[...deptLogs].reverse().map((log) => (
          <div key={log.id} className={`p-3 rounded-lg border-l-4 bg-slate-900/50 ${
            log.severity === 'CRITICAL' ? 'border-red-500' : 'border-sky-500'
          }`}>
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] text-slate-400 font-mono">{log.timestamp.toLocaleTimeString()}</span>
               <span className="text-[10px] font-bold bg-slate-800 px-1 rounded text-slate-300">{log.originDept}</span>
            </div>
            <p className="text-sm text-slate-200">{log.message}</p>
            {log.originDept === Department.AOCC && (
                <div className="mt-2 flex items-center gap-1 text-xs text-sky-400 font-bold">
                    <AlertCircle className="w-3 h-3" /> ORDER FROM AOCC
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
