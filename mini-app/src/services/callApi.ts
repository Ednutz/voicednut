import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CallData {
    phone: string;
    prompt?: string;
}

interface CallResponse {
    callId: string;
    status: string;
}

export const callApi = {
    initiateCall: async (data: CallData): Promise<CallResponse> => {
        const response = await axios.post(`${API_BASE_URL}/outbound-call`, data);
        return response.data;
    },

    getCallStatus: async (callId: string): Promise<{ status: string; transcript?: string }> => {
        const response = await axios.get(`${API_BASE_URL}/call-status/${callId}`);
        return response.data;
    },

    endCall: async (callId: string): Promise<void> => {
        await axios.post(`${API_BASE_URL}/end-call/${callId}`);
    }
};