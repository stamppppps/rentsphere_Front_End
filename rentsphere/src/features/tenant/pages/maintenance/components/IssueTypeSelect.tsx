import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ISSUE_TYPES } from '../types/maintenance.types';

interface IssueTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const IssueTypeSelect: React.FC<IssueTypeSelectProps> = ({ value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        ประเภทปัญหา <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-white border ${
            error ? 'border-red-500' : 'border-gray-200'
          } rounded-xl px-4 py-3.5 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
        >
          <option value="" disabled>-- เลือกประเภทปัญหา --</option>
          {ISSUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default IssueTypeSelect;
