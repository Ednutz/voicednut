import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNotifications } from '../../hooks/useNotifications';
import { botApi } from '../../services/botApi';
import InputField from '../../components/common/InputField/InputField';
import TextAreaField from '../../components/common/TextAreaField/TextAreaField';
import { validatePhoneNumber } from '../../utils/validation';

interface SMSPageProps {
  onNavigate: (page: string) => void;
}

const SMSPage: React.FC<SMSPageProps> = ({ onNavigate }) => {
  const { showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback } =
    useTelegram();
  const { success, error } = useNotifications();

  const [smsForm, setSmsForm] = useState({
    phone: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    showBackButton(() => {
      hapticFeedback('impact');
      onNavigate('home');
    });

    showMainButton('📤 Send SMS', handleSendSMS);

    return () => {
      hideMainButton();
      hideBackButton();
    };
  }, [showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback, onNavigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!smsForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(smsForm.phone.trim())) {
      errors.phone = 'Invalid phone number format. Use E.164 format (e.g., +1234567890)';
    }

    if (!smsForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (smsForm.message.trim().length > 1600) {
      errors.message = 'Message too long (max 1600 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendSMS = async () => {
    if (!validateForm()) {
      error('Please fix the form errors before submitting');
      hapticFeedback('error');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback('impact');

    try {
      await botApi.sendSMS(smsForm.phone.trim(), smsForm.message.trim());
      success('SMS sent successfully!');

      // Reset form
      setSmsForm({ phone: '', message: '' });
      setFormErrors({});
    } catch (err) {
      console.error('SMS sending failed:', err);
      error('Failed to send SMS. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='sms-page'>
      <div className='page-header'>
        <h1 className='page-title'>Send SMS</h1>
        <p className='page-subtitle'>Send text messages via your bot</p>
      </div>

      <div className='page-content'>
        <form
          className='sms-form'
          onSubmit={e => {
            e.preventDefault();
            handleSendSMS();
          }}
        >
          <InputField
            label='📱 Phone Number'
            placeholder='+1234567890'
            value={smsForm.phone}
            error={formErrors.phone}
            disabled={isSubmitting}
            onChange={value => {
              setSmsForm(prev => ({ ...prev, phone: value }));
              if (formErrors.phone) {
                setFormErrors(prev => ({ ...prev, phone: '' }));
              }
            }}
            hint='Use E.164 format with country code'
          />

          <TextAreaField
            label='💬 Message'
            placeholder='Enter your message here...'
            value={smsForm.message}
            error={formErrors.message}
            disabled={isSubmitting}
            onChange={value => {
              setSmsForm(prev => ({ ...prev, message: value }));
              if (formErrors.message) {
                setFormErrors(prev => ({ ...prev, message: '' }));
              }
            }}
            rows={5}
            hint={`${smsForm.message.length}/1600 characters`}
          />
        </form>
      </div>
    </div>
  );
};

export default SMSPage;
