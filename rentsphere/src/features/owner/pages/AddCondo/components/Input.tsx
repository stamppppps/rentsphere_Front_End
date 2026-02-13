import React from 'react';

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  suffix?: string;
}

const Input: React.FC<InputProps> = ({ id, label, value, onChange, required = false, placeholder = '', type = 'text', suffix }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">* จำเป็น</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-stone-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${suffix ? 'pr-20' : ''}`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center px-3 bg-gray-100 border-l border-gray-300 rounded-r-md">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
