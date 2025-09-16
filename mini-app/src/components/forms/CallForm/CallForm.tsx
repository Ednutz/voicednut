import React from 'react';
import InputField from '../../common/InputField/InputField';
import TextAreaField from '../../common/TextAreaField/TextAreaField';
import './CallForm.css';

interface CallFormProps {
  formData: {
    phone: string;
    prompt: string;
    firstMessage: string;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

const CallForm: React.FC<CallFormProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit
}) => {
  return (
    <form
      className='call-form'
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <InputField
        label='📱 Phone Number'
        placeholder='+1234567890'
        value={formData.phone}
        error={errors.phone}
        disabled={isSubmitting}
        onChange={value => onChange('phone', value)}
        hint='Use E.164 format with country code'
      />

      <TextAreaField
        label='🤖 AI Agent Prompt'
        placeholder='Describe how the AI should behave during the call...'
        value={formData.prompt}
        error={errors.prompt}
        disabled={isSubmitting}
        onChange={value => onChange('prompt', value)}
        rows={4}
        hint="Be specific about the agent's personality and goals"
      />

      <TextAreaField
        label='💬 First Message'
        placeholder='What should the AI say when the call connects?'
        value={formData.firstMessage}
        error={errors.firstMessage}
        disabled={isSubmitting}
        onChange={value => onChange('firstMessage', value)}
        rows={3}
        hint='This message will be spoken when the call connects'
      />
    </form>
  );
};

export default CallForm;
