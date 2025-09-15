import React, { useState, useEffect, useCallback } from 'react';
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
    Grid,
    Divider,
    Paper,
    IconButton
} from '@mui/material';
import {
    Send as SendIcon,
    Sms as SmsIcon,
    Clear as ClearIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { telegramWebApp } from '../../utils/telegramWebApp';

interface SMSFormData {
    phone: string;
    message: string;
}

interface SMSStatus {
    messageId?: string;
    status: 'sending' | 'sent' | 'failed';
    timestamp: Date;
}

const MESSAGE_TEMPLATES = [
    {
        title: 'Appointment Reminder',
        content: 'Hi! This is a reminder about your upcoming appointment. Please confirm your attendance.'
    },
    {
        title: 'Order Update',
        content: 'Your order has been processed and will be delivered soon. Thank you for your business!'
    },
    {
        title: 'Payment Reminder',
        content: 'This is a friendly reminder about your pending payment. Please contact us if you have any questions.'
    },
    {
        title: 'Welcome Message',
        content: 'Welcome! Thank you for joining us. We look forward to serving you.'
    }
];

export const SMSComposer: React.FC = () => {
    const [formData, setFormData] = useState<SMSFormData>({
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [smsStatus, setSMSStatus] = useState<SMSStatus | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

    const MAX_SMS_LENGTH = 1600;
    const isOverLimit = formData.message.length > MAX_SMS_LENGTH;
    const charactersUsed = formData.message.length;
    const estimatedSegments = Math.ceil(charactersUsed / 160);

    useEffect(() => {
        // Update main button
        if (formData.phone && formData.message && !isOverLimit) {
            telegramWebApp.setMainButton('Send SMS', handleSendSMS);
        } else {
            telegramWebApp.hideMainButton();
        }

        return () => telegramWebApp.hideMainButton();
    }, [formData.phone, formData.message, isOverLimit]);

    const validatePhoneNumber = useCallback((phone: string): boolean => {
        return apiService.isValidPhoneNumber(phone);
    }, []);

    const handleFormChange = (field: keyof SMSFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
        setError(null);
        setSMSStatus(null);
        telegramWebApp.selectionChanged();
    };

    const handleTemplateSelect = (templateIndex: number) => {
        const template = MESSAGE_TEMPLATES[templateIndex];
        setFormData(prev => ({ ...prev, message: template.content }));
        setSelectedTemplate(templateIndex);
        telegramWebApp.impactOccurred('light');
    };

    const handleClearMessage = () => {
        setFormData(prev => ({ ...prev, message: '' }));
        setSelectedTemplate(null);
        telegramWebApp.impactOccurred('light');
    };

    const handleSendSMS = async () => {
        if (!validatePhoneNumber(formData.phone)) {
            setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
            telegramWebApp.notificationOccurred('error');
            return;
        }

        if (!formData.message.trim()) {
            setError('Please enter a message to send');
            telegramWebApp.notificationOccurred('error');
            return;
        }

        if (isOverLimit) {
            setError(`Message is too long. Please keep it under ${MAX_SMS_LENGTH} characters.`);
            telegramWebApp.notificationOccurred('error');
            return;
        }

        const confirmed = await telegramWebApp.showConfirm(
            `Send SMS to ${formData.phone}?\n\nMessage: ${formData.message.substring(0, 100)}${formData.message.length > 100 ? '...' : ''}\n\nEstimated segments: ${estimatedSegments}`
        );
        
        if (!confirmed) return;

        setLoading(true);
        setError(null);
        setSMSStatus({ status: 'sending', timestamp: new Date() });
        telegramWebApp.impactOccurred('medium');

        try {
            const response = await apiService.sendSMS({
                phone: formData.phone,
                message: formData.message
            });

            if (response.success && response.data) {
                setSMSStatus({
                    messageId: response.data.message_sid,
                    status: 'sent',
                    timestamp: new Date()
                });
                
                // Show success popup
                await telegramWebApp.showPopup({
                    title: 'SMS Sent Successfully!',
                    message: `Your message has been sent to ${formData.phone}`,
                    buttons: [{ type: 'ok' }]
                });
                
                // Clear form
                setFormData({ phone: '', message: '' });
                setSelectedTemplate(null);
                
                telegramWebApp.notificationOccurred('success');
            } else {
                throw new Error(response.error || 'Failed to send SMS');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send SMS. Please try again.');
            setSMSStatus({ status: 'failed', timestamp: new Date() });
            telegramWebApp.notificationOccurred('error');
        } finally {
            setLoading(false);
        }
    };

    const getCharacterColor = () => {
        if (charactersUsed > MAX_SMS_LENGTH) return 'error';
        if (charactersUsed > MAX_SMS_LENGTH * 0.9) return 'warning';
        return 'text.secondary';
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            {/* SMS Status Card */}
            {smsStatus && (
                <Card sx={{ 
                    mb: 2, 
                    bgcolor: smsStatus.status === 'sent' ? 'success.light' : 
                             smsStatus.status === 'failed' ? 'error.light' : 'info.light'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {smsStatus.status === 'sending' && <CircularProgress size={20} />}
                            {smsStatus.status === 'sent' && <CheckIcon color="success" />}
                            {smsStatus.status === 'failed' && <ClearIcon color="error" />}
                            <Typography variant="h6">
                                {smsStatus.status === 'sending' && 'Sending SMS...'}
                                {smsStatus.status === 'sent' && 'SMS Sent Successfully'}
                                {smsStatus.status === 'failed' && 'SMS Failed'}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {smsStatus.timestamp.toLocaleTimeString()}
                            {smsStatus.messageId && ` • ID: ${smsStatus.messageId}`}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Main SMS Form */}
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmsIcon color="primary" />
                        Send SMS
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
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
                                disabled={loading}
                                error={formData.phone ? !validatePhoneNumber(formData.phone) : false}
                                helperText={
                                    formData.phone && !validatePhoneNumber(formData.phone)
                                        ? 'Please enter a valid E.164 format number'
                                        : 'Enter phone number in E.164 format (e.g., +1234567890)'
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Message Templates
                                </Typography>
                                {formData.message && (
                                    <IconButton size="small" onClick={handleClearMessage}>
                                        <ClearIcon />
                                    </IconButton>
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                {MESSAGE_TEMPLATES.map((template, index) => (
                                    <Chip
                                        key={index}
                                        label={template.title}
                                        variant={selectedTemplate === index ? 'filled' : 'outlined'}
                                        color={selectedTemplate === index ? 'primary' : 'default'}
                                        onClick={() => handleTemplateSelect(index)}
                                        disabled={loading}
                                        size="small"
                                    />
                                ))}
                            </Box>

                            <TextField
                                fullWidth
                                label="Message"
                                value={formData.message}
                                onChange={handleFormChange('message')}
                                placeholder="Enter your message here..."
                                multiline
                                rows={6}
                                disabled={loading}
                                error={isOverLimit}
                                helperText={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>
                                            <Typography component="span" color={getCharacterColor()}>
                                                {charactersUsed}/{MAX_SMS_LENGTH}
                                            </Typography>
                                            {isOverLimit && (
                                                <Typography component="span" color="error" sx={{ ml: 1 }}>
                                                    (too long)
                                                </Typography>
                                            )}
                                        </span>
                                        <Typography variant="caption" color="text.secondary">
                                            ~{estimatedSegments} segment{estimatedSegments > 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                {loading ? 'Sending message...' : 'Ready to send'}
                            </Typography>
                            {formData.phone && formData.message && !isOverLimit && (
                                <Typography variant="caption" color="success.main">
                                    Message ready for sending
                                </Typography>
                            )}
                        </Box>
                        
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            onClick={handleSendSMS}
                            disabled={loading || !formData.phone || !formData.message || isOverLimit || !validatePhoneNumber(formData.phone)}
                            size="large"
                        >
                            {loading ? 'Sending...' : 'Send SMS'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* SMS Information Card */}
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        SMS Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {estimatedSegments}
                                </Typography>
                                <Typography variant="caption">
                                    Segments
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color={getCharacterColor()}>
                                    {charactersUsed}
                                </Typography>
                                <Typography variant="caption">
                                    Characters
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        • SMS messages are charged per segment (160 characters each)
                        <br />
                        • Special characters may reduce the limit to 70 characters per segment
                        <br />
                        • Messages longer than 160 characters will be sent as multiple segments
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};