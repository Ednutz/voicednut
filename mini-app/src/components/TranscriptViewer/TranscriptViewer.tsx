import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    TextField,
    Grid,
    Avatar,
    Tooltip,
    Fab
} from '@mui/material';
import {
    Visibility as ViewIcon,
    SentimentSatisfied as HappyIcon,
    SentimentNeutral as NeutralIcon,
    SentimentDissatisfied as SadIcon,
    Phone as PhoneIcon,
    AccessTime as TimeIcon,
    Description as TranscriptIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { apiService, Call, Transcript } from '../../services/apiService';
import { telegramWebApp } from '../../utils/telegramWebApp';
import { format, formatDistanceToNow } from 'date-fns';

interface TranscriptViewerState {
    calls: Call[];
    filteredCalls: Call[];
    selectedCall: Call | null;
    transcripts: Transcript[];
    loading: boolean;
    transcriptLoading: boolean;
    error: string | null;
    searchTerm: string;
    dialogOpen: boolean;
}

export const TranscriptViewer: React.FC = () => {
    const [state, setState] = useState<TranscriptViewerState>({
        calls: [],
        filteredCalls: [],
        selectedCall: null,
        transcripts: [],
        loading: true,
        transcriptLoading: false,
        error: null,
        searchTerm: '',
        dialogOpen: false
    });

    useEffect(() => {
        loadCalls();
    }, []);

    useEffect(() => {
        // Filter calls based on search term
        const filtered = state.calls.filter(call =>
            call.phone_number.includes(state.searchTerm) ||
            call.call_sid.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            call.status.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
        setState(prev => ({ ...prev, filteredCalls: filtered }));
    }, [state.calls, state.searchTerm]);

    const loadCalls = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const response = await apiService.getCalls(50);
            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    calls: response.data || [],
                    loading: false
                }));
            } else {
                throw new Error(response.error || 'Failed to load calls');
            }
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                error: err.message || 'Failed to load calls',
                loading: false
            }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const handleViewTranscript = async (call: Call) => {
        setState(prev => ({
            ...prev,
            selectedCall: call,
            transcriptLoading: true,
            dialogOpen: true,
            transcripts: []
        }));

        try {
            const response = await apiService.getCallTranscript(call.call_sid);
            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    transcripts: response.data?.transcripts || [],
                    transcriptLoading: false
                }));
            } else {
                throw new Error(response.error || 'Failed to load transcript');
            }
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                error: err.message || 'Failed to load transcript',
                transcriptLoading: false
            }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const handleCloseDialog = () => {
        setState(prev => ({
            ...prev,
            dialogOpen: false,
            selectedCall: null,
            transcripts: []
        }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchTerm: event.target.value }));
        telegramWebApp.selectionChanged();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in-progress':
                return 'info';
            case 'failed':
            case 'no-answer':
                return 'error';
            case 'busy':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive':
                return <HappyIcon color="success" />;
            case 'negative':
                return <SadIcon color="error" />;
            default:
                return <NeutralIcon color="action" />;
        }
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const downloadTranscript = () => {
        if (!state.selectedCall || !state.transcripts.length) return;

        const transcript = state.transcripts.map(t => 
            `[${format(new Date(t.timestamp), 'HH:mm:ss')}] ${t.speaker === 'user' ? 'Caller' : 'AI'}: ${t.message}`
        ).join('\n');

        const content = `Call Transcript
Phone: ${state.selectedCall.phone_number}
Call ID: ${state.selectedCall.call_sid}
Date: ${format(new Date(state.selectedCall.created_at), 'PPpp')}
Duration: ${formatDuration(state.selectedCall.duration)}
Status: ${state.selectedCall.status}

${state.selectedCall.call_summary ? `Summary:\n${state.selectedCall.call_summary}\n\n` : ''}Conversation:
${transcript}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${state.selectedCall.call_sid}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        telegramWebApp.notificationOccurred('success');
    };

    const renderCallStats = () => {
        const totalCalls = state.calls.length;
        const completedCalls = state.calls.filter(call => call.status === 'completed').length;
        const failedCalls = state.calls.filter(call => call.status === 'failed').length;
        const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="h4">{totalCalls}</Typography>
                        <Typography variant="caption">Total</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h4">{completedCalls}</Typography>
                        <Typography variant="caption">Completed</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <Typography variant="h4">{failedCalls}</Typography>
                        <Typography variant="caption">Failed</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="h4">{successRate}%</Typography>
                        <Typography variant="caption">Success</Typography>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TranscriptIcon color="primary" />
                            Call Transcripts
                        </Typography>
                        <Tooltip title="Refresh">
                            <IconButton onClick={loadCalls} disabled={state.loading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {state.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {state.error}
                        </Alert>
                    )}

                    {renderCallStats()}

                    <TextField
                        fullWidth
                        placeholder="Search calls..."
                        value={state.searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                        }}
                        sx={{ mb: 2 }}
                    />

                    <List>
                        {state.filteredCalls.map((call) => (
                            <React.Fragment key={call.call_sid}>
                                <ListItem
                                    secondaryAction={
                                        <Tooltip title="View Transcript">
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleViewTranscript(call)}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    sx={{ 
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                            <PhoneIcon />
                                        </Avatar>
                                        
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="subtitle1" noWrap>
                                                    {call.phone_number}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={call.status}
                                                    color={getStatusColor(call.status) as any}
                                                    variant="outlined"
                                                />
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <TimeIcon fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                                                    </Typography>
                                                </Box>
                                                
                                                <Typography variant="caption" color="text.secondary">
                                                    Duration: {formatDuration(call.duration)}
                                                </Typography>
                                                
                                                {call.transcript_count && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {call.transcript_count} messages
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>

                    {state.filteredCalls.length === 0 && !state.loading && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <TranscriptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {state.searchTerm ? 'No calls found' : 'No transcripts yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {state.searchTerm 
                                    ? 'Try adjusting your search terms'
                                    : 'Make your first call to see transcripts here'
                                }
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Transcript Dialog */}
            <Dialog
                open={state.dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { height: '80vh' }
                }}
            >
                {state.selectedCall && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6">Call Transcript</Typography>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        {state.selectedCall.phone_number}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {state.transcripts.length > 0 && (
                                        <Tooltip title="Download Transcript">
                                            <IconButton onClick={downloadTranscript}>
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <IconButton onClick={handleCloseDialog}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </DialogTitle>
                        
                        <DialogContent dividers>
                            {/* Call Details */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Call ID
                                        </Typography>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {state.selectedCall.call_sid}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Date & Time
                                        </Typography>
                                        <Typography variant="body2">
                                            {format(new Date(state.selectedCall.created_at), 'PPpp')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Duration
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDuration(state.selectedCall.duration)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                size="small"
                                                label={state.selectedCall.status}
                                                color={getStatusColor(state.selectedCall.status) as any}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Call Summary */}
                            {state.selectedCall.call_summary && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Call Summary
                                    </Typography>
                                    <Typography variant="body2">
                                        {state.selectedCall.call_summary}
                                    </Typography>
                                </Paper>
                            )}

                            {/* Transcript Loading */}
                            {state.transcriptLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {/* Transcript Messages */}
                            {!state.transcriptLoading && state.transcripts.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Conversation
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 1, maxHeight: 400, overflow: 'auto' }}>
                                        {state.transcripts.map((transcript, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    mb: 2,
                                                    alignItems: 'flex-start',
                                                    gap: 1
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: transcript.speaker === 'user' ? 'primary.main' : 'secondary.main',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {transcript.speaker === 'user' ? '👤' : '🤖'}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="caption" fontWeight="medium">
                                                            {transcript.speaker === 'user' ? 'Caller' : 'AI Assistant'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(new Date(transcript.timestamp), 'HH:mm:ss')}
                                                        </Typography>
                                                    </Box>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: transcript.speaker === 'user' ? 'primary.light' : 'secondary.light',
                                                            color: transcript.speaker === 'user' ? 'primary.contrastText' : 'secondary.contrastText'
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {transcript.message}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Box>
                            )}

                            {/* No Transcript Available */}
                            {!state.transcriptLoading && state.transcripts.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <TranscriptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        No transcript available
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        This call may not have been recorded or transcribed yet.
                                    </Typography>
                                </Box>
                            )}
                        </DialogContent>
                        
                        <DialogActions>
                            {state.transcripts.length > 0 && (
                                <Button
                                    startIcon={<DownloadIcon />}
                                    onClick={downloadTranscript}
                                    variant="outlined"
                                >
                                    Download
                                </Button>
                            )}
                            <Button onClick={handleCloseDialog} variant="contained">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};