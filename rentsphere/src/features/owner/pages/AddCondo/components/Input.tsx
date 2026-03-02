import React from "react";

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  required?: boolean;
  placeholder?: string;
  type?: string;
  suffix?: string;

  disabled?: boolean; 
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  value,
  onChange,

  required = false,
  placeholder = "",
  type = "text",
  suffix,

  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
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
          required={required}
          disabled={disabled} 

          className={`
            w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
            focus:outline-none focus:ring-blue-500 focus:border-blue-500

            ${suffix ? "pr-20" : ""}
            ${disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-stone-50 border-gray-300"}
          `}
        />

        {suffix && (
          <div
            className={`
              absolute inset-y-0 right-0 flex items-center px-3 border-l rounded-r-md
              ${disabled ? "bg-gray-200 border-gray-200" : "bg-gray-100 border-gray-300"}
            `}
          >
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;