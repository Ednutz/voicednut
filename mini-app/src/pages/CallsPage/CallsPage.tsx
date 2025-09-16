import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useCalls } from '../../hooks/useCalls';
import { useNotifications } from '../../hooks/useNotifications';
import { validatePhoneNumber } from '../../utils/validation';

// Components
import CallForm from '../../components/forms/CallForm/CallForm';
import CallHistory from '../../components/features/CallHistory/CallHistory';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../components/common/Modal/Modal';

import './CallsPage.css';

interface CallsPageProps {
  onNavigate: (page: string) => void;
}

const CallsPage: React.FC<CallsPageProps> = ({ onNavigate }) => {
  const { showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback } =
    useTelegram();
  const { calls, isLoading, initiateCall, getTranscript, refreshCalls } = useCalls();
  const { success, error } = useNotifications();

  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [transcriptModal, setTranscriptModal] = useState(false);
  const [transcript, setTranscript] = useState<any>(null);

  // Call form state
  const [callForm, setCallForm] = useState({
    phone: '',
    prompt: '',
    firstMessage: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Configure navigation
    showBackButton(() => {
      hapticFeedback('impact');
      onNavigate('home');
    });

    if (activeTab === 'new') {
      showMainButton('📞 Start Call', handleSubmitCall);
    } else {
      showMainButton('🔄 Refresh', () => {
        hapticFeedback('impact');
        refreshCalls();
        success('Call history refreshed');
      });
    }

    return () => {
      hideMainButton();
      hideBackButton();
    };
  }, [
    activeTab,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    onNavigate,
    refreshCalls,
    success
  ]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!callForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(callForm.phone.trim())) {
      errors.phone = 'Invalid phone number. Use E.164 format (e.g., +1234567890)';
    }

    if (!callForm.firstMessage.trim()) {
      errors.firstMessage = 'First message is required';
    } else if (callForm.firstMessage.trim().length < 10) {
      errors.firstMessage = 'First message should be at least 10 characters';
    }

    if (!callForm.prompt.trim()) {
      errors.prompt = 'AI prompt is required';
    } else if (callForm.prompt.trim().length < 20) {
      errors.prompt = 'AI prompt should be at least 20 characters for better results';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCall = async () => {
    if (!validateForm()) {
      error('Please fix the form errors before submitting');
      hapticFeedback('error');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback('impact');

    try {
      await initiateCall(
        callForm.phone.trim(),
        callForm.prompt.trim(),
        callForm.firstMessage.trim()
      );

      success("Call initiated successfully! You'll receive notifications about the call progress.");

      // Reset form
      setCallForm({
        phone: '',
        prompt: '',
        firstMessage: ''
      });
      setFormErrors({});

      // Switch to history tab to see the new call
      setActiveTab('history');
      refreshCalls();
    } catch (error) {
      console.error('Call initiation failed:', error);
      // Error notification is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTranscript = async (call: any) => {
    setSelectedCall(call);
    setTranscript(null);
    setTranscriptModal(true);

    try {
      const transcriptData = await getTranscript(call.call_sid);
      setTranscript(transcriptData);
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
      error('Failed to load call transcript');
    }
  };

  const tabs = [
    { id: 'new', label: '📞 New Call', count: null },
    { id: 'history', label: '📋 History', count: calls?.length || 0 }
  ];

  return (
    <div className='calls-page'>
      {/* Header */}
      <div className='page-header'>
        <h1 className='page-title'>Voice Calls</h1>
        <p className='page-subtitle'>
          {activeTab === 'new' ? 'Create a new AI-powered voice call' : 'View your call history'}
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as 'new' | 'history')}
      />

      {/* Content */}
      <div className='page-content'>
        {activeTab === 'new' ? (
          <div className='new-call-section'>
            <CallForm
              formData={callForm}
              errors={formErrors}
              isSubmitting={isSubmitting}
              onChange={(field, value) => {
                setCallForm(prev => ({ ...prev, [field]: value }));
                // Clear error when user starts typing
                if (formErrors[field]) {
                  setFormErrors(prev => ({ ...prev, [field]: '' }));
                }
              }}
              onSubmit={handleSubmitCall}
            />

            {/* Quick Templates */}
            <div className='templates-section'>
              <h3>Quick Templates</h3>
              <div className='template-buttons'>
                <button
                  className='template-btn'
                  onClick={() => {
                    setCallForm(prev => ({
                      ...prev,
                      prompt:
                        'You are a professional customer service representative. Be polite, helpful, and concise.',
                      firstMessage:
                        'Hello! This is an automated call from our customer service. How can I assist you today?'
                    }));
                    hapticFeedback('impact');
                  }}
                >
                  📞 Customer Service
                </button>
                <button
                  className='template-btn'
                  onClick={() => {
                    setCallForm(prev => ({
                      ...prev,
                      prompt:
                        'You are conducting a friendly survey. Ask questions politely and thank the person for their time.',
                      firstMessage:
                        "Hi! We're conducting a quick survey and would appreciate your feedback. Do you have a moment to answer a few questions?"
                    }));
                    hapticFeedback('impact');
                  }}
                >
                  📊 Survey
                </button>
                <button
                  className='template-btn'
                  onClick={() => {
                    setCallForm(prev => ({
                      ...prev,
                      prompt:
                        'You are making an appointment reminder call. Be professional and helpful with scheduling.',
                      firstMessage:
                        'Hello! This is a friendly reminder about your upcoming appointment. Are you still able to make it?'
                    }));
                    hapticFeedback('impact');
                  }}
                >
                  📅 Appointment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='history-section'>
            {isLoading ? (
              <LoadingSpinner message='Loading call history...' />
            ) : (
              <CallHistory
                calls={calls || []}
                onViewTranscript={handleViewTranscript}
                onRefresh={refreshCalls}
              />
            )}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      <Modal
        isOpen={transcriptModal}
        onClose={() => setTranscriptModal(false)}
        title={`Call Transcript - ${selectedCall?.phone_number}`}
        size='large'
      >
        {transcript ? (
          <div className='transcript-content'>
            <div className='transcript-header'>
              <div className='call-details'>
                <p>
                  <strong>Call ID:</strong> {selectedCall?.call_sid}
                </p>
                <p>
                  <strong>Duration:</strong>{' '}
                  {selectedCall?.duration
                    ? `${Math.floor(selectedCall.duration / 60)}:${String(selectedCall.duration % 60).padStart(2, '0')}`
                    : 'N/A'}
                </p>
                <p>
                  <strong>Status:</strong> {selectedCall?.status}
                </p>
              </div>
            </div>

            {transcript.messages && transcript.messages.length > 0 ? (
              <div className='messages-list'>
                {transcript.messages.map((message: any, index: number) => (
                  <div key={index} className={`message message-${message.role}`}>
                    <div className='message-header'>
                      <span className='message-role'>
                        {message.role === 'user' ? '👤 Caller' : '🤖 AI Agent'}
                      </span>
                      <span className='message-time'>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className='message-content'>{message.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='empty-transcript'>
                <p>No transcript available for this call.</p>
              </div>
            )}
          </div>
        ) : (
          <LoadingSpinner message='Loading transcript...' />
        )}
      </Modal>
    </div>
  );
};

export default CallsPage;
