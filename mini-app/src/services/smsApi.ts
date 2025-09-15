import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SendSMSData {
    phone: string;
    message: string;
}

export const smsApi = {
    sendSMS: async (data: SendSMSData): Promise<{ messageId: string }> => {
        const response = await axios.post(`${API_BASE_URL}/send-sms`, data);
        return response.data;
    },

    getSMSStatus: async (messageId: string): Promise<{ status: string }> => {
        const response = await axios.get(`${API_BASE_URL}/sms-status/${messageId}`);
        return response.data;
    }
};