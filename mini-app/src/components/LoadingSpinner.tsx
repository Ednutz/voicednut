import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
    size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={size} />
    </Box>
);