import React from 'react';
import './TextAreaField.css';

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  onChange: (value: string) => void;
  hint?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  error,
  disabled = false,
  rows = 3,
  onChange,
  hint
}) => {
  return (
    <div className='textarea-field'>
      <label className='textarea-label'>{label}</label>
      <textarea
        className={`textarea ${error ? 'textarea-error' : ''}`}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={e => onChange(e.target.value)}
      />
      {error && <div className='error-message'>{error}</div>}
      {hint && !error && <div className='hint-message'>{hint}</div>}
    </div>
  );
};

export default TextAreaField;
