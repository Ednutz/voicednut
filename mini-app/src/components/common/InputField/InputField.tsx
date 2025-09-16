import React from 'react';
import './InputField.css';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'tel' | 'email';
  onChange: (value: string) => void;
  hint?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  error,
  disabled = false,
  type = 'text',
  onChange,
  hint
}) => {
  return (
    <div className='input-field'>
      <label className='input-label'>{label}</label>
      <input
        type={type}
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
      />
      {error && <div className='error-message'>{error}</div>}
      {hint && !error && <div className='hint-message'>{hint}</div>}
    </div>
  );
};

export default InputField;
