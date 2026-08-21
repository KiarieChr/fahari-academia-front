import { api } from './api';

export const crmService = {
    // Parents
    getParents: () => api.get('/api/crm/parents/'),
    getParent: (id) => api.get(`/api/crm/parents/${id}/`),
    
    // Campaigns
    getCampaigns: () => api.get('/api/crm/campaigns/'),
    createCampaign: (data) => api.post('/api/crm/campaigns/', data),
    getCampaign: (id) => api.get(`/api/crm/campaigns/${id}/`),
    
    // Communications
    getCommunications: () => api.get('/api/crm/communications/'),
    
    // Inbox
    getConversations: () => api.get('/api/crm/conversations/'),
    getMessages: (conversationId) => api.get(`/api/crm/messages/?conversation_id=${conversationId}`),
    sendReply: (conversationId, message) => api.post(`/api/crm/conversations/${conversationId}/reply/`, { message }),
    simulateInbound: (phone, message, channel = 'WHATSAPP') => api.post('/api/crm/webhooks/simulate/', { phone, message, channel }),
};
