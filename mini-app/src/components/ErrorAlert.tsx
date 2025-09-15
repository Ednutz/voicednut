import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorAlertProps {
    title?: string;
    message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ title = 'Error', message }) => (
    <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>{title}</AlertTitle>
        {message}
    </Alert>
);