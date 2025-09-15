import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Transcript {
    id: string;
    callId: string;
    phoneNumber: string;
    timestamp: string;
    content: string;
    summary?: string;
    sentiment?: string;
}

export const transcriptApi = {
    getTranscripts: async (): Promise<Transcript[]> => {
        const response = await axios.get(`${API_BASE_URL}/transcripts`);
        return response.data;
    },

    getTranscript: async (transcriptId: string): Promise<Transcript> => {
        const response = await axios.get(`${API_BASE_URL}/transcripts/${transcriptId}`);
        return response.data;
    },

    getSummary: async (transcriptId: string): Promise<{ summary: string; sentiment: string }> => {
        const response = await axios.get(`${API_BASE_URL}/transcripts/${transcriptId}/summary`);
        return response.data;
    }
};