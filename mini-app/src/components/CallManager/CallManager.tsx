import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    Collapse,
    Grid,
    Divider
} from '@mui/material';
import {
    Phone as PhoneIcon,
    PhoneDisabled as EndCallIcon,
    ExpandMore as ExpandMoreIcon,
    VolumeUp as VolumeIcon,
    Timer as TimerIcon,
    RecordVoiceOver as PromptIcon
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { telegramWebApp } from '../../utils/telegramWebApp';

interface CallState {
    isActive: boolean;
    callId: string | null;
    status: string;
    duration: number;
    phoneNumber: string;
}

interface CallFormData {
    phone: string;
    prompt: string;
    first_message: string;
}

const CALL_STATUSES = {
    initiating: { color: 'info' as const, label: 'Initiating...' },
    ringing: { color: 'warning' as const, label: 'Ringing' },
    'in-progress': { color: 'success' as const, label: 'In Progress' },
    completed: { color: 'default' as const, label: 'Completed' },
    failed: { color: 'error' as const, label: 'Failed' },
    'no-answer': { color: 'default' as const, label: 'No Answer' },
    busy: { color: 'warning' as const, label: 'Busy' },
    cancelled: { color: 'default' as const, label: 'Cancelled' }
};

export const CallManager: React.FC = () => {
    const [formData, setFormData] = useState<CallFormData>({
        phone: '',
        prompt: '',
        first_message: ''
    });
    const [callState, setCallState] = useState<CallState>({
        isActive: false,
        callId: null,
        status: '',
        duration: 0,
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [expandedPrompt, setExpandedPrompt] = useState(false);
    const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (statusPolling) {
                clearInterval(statusPolling);
            }
        };
    }, [statusPolling]);

    useEffect(() => {
        // Update main button based on call state
        if (callState.isActive) {
            telegramWebApp.setMainButton('End Call', () => handleEndCall());
        } else if (formData.phone && formData.first_message) {
            telegramWebApp.setMainButton('Start Call', () => handleStartCall());
        } else {
            telegramWebApp.hideMainButton();
        }

        return () => telegramWebApp.hideMainButton();
    }, [callState.isActive, formData.phone, formData.first_message]);

    const validatePhoneNumber = (phone: string): boolean => {
        return apiService.isValidPhoneNumber(phone);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startStatusPolling = (callId: string) => {
        const interval = setInterval(async () => {
            try {
                const response = await apiService.getCallStatus(callId);
                if (response.success && response.data) {
                    const newStatus = response.data.status;
                    setCallState(prev => ({ ...prev, status: newStatus }));

                    // Stop polling if call is no longer active
                    if (['completed', 'failed', 'no-answer', 'busy', 'cancelled'].includes(newStatus)) {
                        clearInterval(interval);
                        setStatusPolling(null);
                        setCallState(prev => ({ ...prev, isActive: false }));
                        
                        // Provide haptic feedback
                        telegramWebApp.notificationOccurred(
                            newStatus === 'completed' ? 'success' : 'error'
                        );
                    }
                }
            } catch (err) {
                console.error('Status polling error:', err);
            }
        }, 3000);

        setStatusPolling(interval);
    };

    const handleStartCall = async () => {
        if (!validatePhoneNumber(formData.phone)) {
            setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
            telegramWebApp.notificationOccurred('error');
            return;
        }

        if (!formData.first_message.trim()) {
            setError('Please provide a first message for the AI to say');
            telegramWebApp.notificationOccurred('error');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        telegramWebApp.impactOccurred('medium');

        try {
            const response = await apiService.initiateCall({
                phone: formData.phone,
                prompt: formData.prompt || 'You are a helpful AI assistant making a phone call.',
                first_message: formData.first_message
            });

            if (response.success && response.data) {
                setCallState({
                    isActive: true,
                    callId: response.data.call_sid,
                    status: response.data.status || 'initiating',
                    duration: 0,
                    phoneNumber: formData.phone
                });
                
                setSuccess('Call initiated successfully!');
                startStatusPolling(response.data.call_sid);
                telegramWebApp.notificationOccurred('success');
            } else {
                throw new Error(response.error || 'Failed to initiate call');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to initiate call. Please try again.');
            telegramWebApp.notificationOccurred('error');
        } finally {
            setLoading(false);
        }
    };

    const handleEndCall = async () => {
        if (!callState.callId) return;

        const confirmed = await telegramWebApp.showConfirm('Are you sure you want to end this call?');
        if (!confirmed) return;

        try {
            setLoading(true);
            await apiService.endCall(callState.callId);
            
            if (statusPolling) {
                clearInterval(statusPolling);
                setStatusPolling(null);
            }
            
            setCallState(prev => ({ ...prev, status: 'ending', isActive: false }));
            setSuccess('Call ended successfully');
            telegramWebApp.notificationOccurred('success');
        } catch (err: any) {
            setError('Failed to end call. Please try again.');
            telegramWebApp.notificationOccurred('error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field: keyof CallFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
        setError(null);
        telegramWebApp.selectionChanged();
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            {/* Call Status Card */}
            {callState.isActive && (
                <Card sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <VolumeIcon />
                                <Typography variant="h6">Active Call</Typography>
                            </Box>
                            <Chip
                                label={CALL_STATUSES[callState.status as keyof typeof CALL_STATUSES]?.label || callState.status}
                                color={CALL_STATUSES[callState.status as keyof typeof CALL_STATUSES]?.color || 'default'}
                                size="small"
                            />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {callState.phoneNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <TimerIcon fontSize="small" />
                            <Typography variant="body2">
                                {formatDuration(callState.duration)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Main Call Form */}
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="primary" />
                        Make a Call
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {loading && <LinearProgress sx={{ mb: 2 }} />}

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleFormChange('phone')}
                                placeholder="+1234567890"
                                disabled={loading || callState.isActive}
                                error={formData.phone ? !validatePhoneNumber(formData.phone) : false}
                                helperText={
                                    formData.phone && !validatePhoneNumber(formData.phone)
                                        ? 'Please enter a valid E.164 format number'
                                        : 'Enter phone number in E.164 format (e.g., +1234567890)'
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="First Message"
                                value={formData.first_message}
                                onChange={handleFormChange('first_message')}
                                placeholder="Hello! This is an AI assistant calling to..."
                                multiline
                                rows={3}
                                disabled={loading || callState.isActive}
                                required
                                helperText="What should the AI say when the call connects?"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PromptIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        AI Behavior Prompt (Optional)
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => setExpandedPrompt(!expandedPrompt)}
                                    sx={{ 
                                        transform: expandedPrompt ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </Box>

                            <Collapse in={expandedPrompt}>
                                <TextField
                                    fullWidth
                                    label="AI Prompt"
                                    value={formData.prompt}
                                    onChange={handleFormChange('prompt')}
                                    placeholder="You are a friendly customer service representative calling to..."
                                    multiline
                                    rows={4}
                                    disabled={loading || callState.isActive}
                                    sx={{ mt: 1 }}
                                    helperText="Describe how the AI should behave during the conversation"
                                />
                            </Collapse>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {callState.isActive ? 'Call in progress...' : 'Ready to make call'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {callState.isActive ? (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={loading ? <CircularProgress size={20} /> : <EndCallIcon />}
                                    onClick={handleEndCall}
                                    disabled={loading}
                                    size="large"
                                >
                                    {loading ? 'Ending...' : 'End Call'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={loading ? <CircularProgress size={20} /> : <PhoneIcon />}
                                    onClick={handleStartCall}
                                    disabled={loading || !formData.phone || !formData.first_message || !validatePhoneNumber(formData.phone)}
                                    size="large"
                                >
                                    {loading ? 'Starting...' : 'Start Call'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
