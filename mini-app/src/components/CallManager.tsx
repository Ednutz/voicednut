import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import { Phone as PhoneIcon, PhoneDisabled as EndCallIcon } from '@mui/icons-material';
import { callApi } from '../services/callApi';
import { ErrorAlert } from './ErrorAlert';
import WebApp from '@twa-dev/sdk';

export const CallManager: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCallId, setActiveCallId] = useState<string | null>(null);
    const [callStatus, setCallStatus] = useState<string | null>(null);

    // Phone number validation
    const isValidPhoneNumber = (number: string) => {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(number.trim());
    };

    const initiateCall = async () => {
        if (!isValidPhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await callApi.initiateCall({
                phone: phoneNumber,
                prompt: prompt || undefined
            });

            setActiveCallId(response.callId);
            setCallStatus(response.status);

            // Start polling for status
            startStatusPolling(response.callId);

            // Show main button for ending call
            WebApp.MainButton.setText('End Call');
            WebApp.MainButton.show();
            WebApp.MainButton.onClick(() => endCall(response.callId));
        } catch (err) {
            setError('Failed to initiate call. Please try again.');
            console.error('Call initiation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const startStatusPolling = (callId: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const status = await callApi.getCallStatus(callId);
                setCallStatus(status.status);

                // Stop polling if call is no longer active
                if (['completed', 'failed', 'cancelled'].includes(status.status)) {
                    clearInterval(pollInterval);
                    WebApp.MainButton.hide();
                    setActiveCallId(null);
                }
            } catch (err) {
                console.error('Status polling error:', err);
            }
        }, 3000);

        // Clean up interval on component unmount
        return () => clearInterval(pollInterval);
    };

    const endCall = async (callId: string) => {
        try {
            await callApi.endCall(callId);
            setCallStatus('ending');
            WebApp.MainButton.hide();
        } catch (err) {
            setError('Failed to end call. Please try again.');
            console.error('End call error:', err);
        }
    };

    return (
        <Card elevation={0}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Make a Call
                </Typography>

                {error && <ErrorAlert message={error} />}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading || !!activeCallId}
                        fullWidth
                    />

                    <TextField
                        label="Prompt (Optional)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter conversation prompt..."
                        multiline
                        rows={3}
                        disabled={loading || !!activeCallId}
                        fullWidth
                    />

                    {callStatus && (
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            Status: {callStatus}
                            {['initiating', 'in-progress'].includes(callStatus) && (
                                <CircularProgress size={16} />
                            )}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {!activeCallId ? (
                            <Button
                                variant="contained"
                                startIcon={<PhoneIcon />}
                                onClick={initiateCall}
                                disabled={loading || !phoneNumber}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Start Call'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<EndCallIcon />}
                                onClick={() => activeCallId && endCall(activeCallId)}
                                disabled={loading}
                            >
                                End Call
                            </Button>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};