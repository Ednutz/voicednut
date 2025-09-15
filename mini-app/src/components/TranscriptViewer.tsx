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
    Paper
} from '@mui/material';
import {
    Visibility as ViewIcon,
    SentimentSatisfied as HappyIcon,
    SentimentNeutral as NeutralIcon,
    SentimentDissatisfied as SadIcon
} from '@mui/icons-material';
import { transcriptApi, Transcript } from '../services/transcriptApi';
import { ErrorAlert } from './ErrorAlert';
import { LoadingSpinner } from './LoadingSpinner';
import { format } from 'date-fns';

export const TranscriptViewer: React.FC = () => {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadTranscripts();
    }, []);

    const loadTranscripts = async () => {
        try {
            const fetchedTranscripts = await transcriptApi.getTranscripts();
            setTranscripts(fetchedTranscripts);
        } catch (err) {
            setError('Failed to load transcripts');
            console.error('Error loading transcripts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTranscript = async (transcriptId: string) => {
        try {
            const transcript = await transcriptApi.getTranscript(transcriptId);
            if (!transcript.summary) {
                const { summary, sentiment } = await transcriptApi.getSummary(transcriptId);
                transcript.summary = summary;
                transcript.sentiment = sentiment;
            }
            setSelectedTranscript(transcript);
            setDialogOpen(true);
        } catch (err) {
            setError('Failed to load transcript details');
            console.error('Error loading transcript:', err);
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

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Card elevation={0}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Call Transcripts
                    </Typography>

                    {error && <ErrorAlert message={error} />}

                    <List>
                        {transcripts.map((transcript) => (
                            <React.Fragment key={transcript.id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="view"
                                            onClick={() => handleViewTranscript(transcript.id)}
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={transcript.phoneNumber}
                                        secondary={format(new Date(transcript.timestamp), 'PPp')}
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedTranscript && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Call Transcript
                                {selectedTranscript.sentiment && (
                                    <Chip
                                        icon={getSentimentIcon(selectedTranscript.sentiment)}
                                        label={selectedTranscript.sentiment}
                                        color={
                                            selectedTranscript.sentiment.toLowerCase() === 'positive'
                                                ? 'success'
                                                : selectedTranscript.sentiment.toLowerCase() === 'negative'
                                                    ? 'error'
                                                    : 'default'
                                        }
                                    />
                                )}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Call Details
                                </Typography>
                                <Typography variant="body2">
                                    Phone: {selectedTranscript.phoneNumber}
                                    <br />
                                    Date: {format(new Date(selectedTranscript.timestamp), 'PPpp')}
                                </Typography>
                            </Box>

                            {selectedTranscript.summary && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Summary
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="body2">
                                            {selectedTranscript.summary}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            <Typography variant="subtitle2" color="text.secondary">
                                Transcript
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedTranscript.content}
                                </Typography>
                            </Paper>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};