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
import { Send as SendIcon } from '@mui/icons-material';
import { smsApi } from '../services/smsApi';
import { ErrorAlert } from './ErrorAlert';
import WebApp from '@twa-dev/sdk';

export const SMSComposer: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    // Phone number validation
    const isValidPhoneNumber = (number: string) => {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(number.trim());
    };

    const sendSMS = async () => {
        if (!isValidPhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
            return;
        }

        if (!message || message.length > 1600) {
            setError('Message must be between 1 and 1600 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await smsApi.sendSMS({
                phone: phoneNumber,
                message
            });

            setStatus('Message sent successfully!');
            WebApp.showPopup({
                title: 'Success',
                message: 'SMS has been sent successfully!',
                buttons: [{ type: 'ok' }]
            });

            // Clear form
            setPhoneNumber('');
            setMessage('');
        } catch (err) {
            setError('Failed to send SMS. Please try again.');
            console.error('SMS sending error:', err);
        } finally {
            setLoading(false);
        }
    };

    const characterCount = message.length;
    const isOverLimit = characterCount > 1600;

    return (
        <Card elevation={0}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Send SMS
                </Typography>

                {error && <ErrorAlert message={error} />}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading}
                        fullWidth
                    />

                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message..."
                        multiline
                        rows={4}
                        disabled={loading}
                        fullWidth
                        error={isOverLimit}
                        helperText={`${characterCount}/1600 characters ${isOverLimit ? '(too long)' : ''}`}
                    />

                    {status && (
                        <Typography variant="subtitle2" color="success.main">
                            {status}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            onClick={sendSMS}
                            disabled={loading || !phoneNumber || !message || isOverLimit}
                        >
                            Send SMS
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};