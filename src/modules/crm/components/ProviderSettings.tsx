import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { api } from '../../../services/api';
import { Loader2, Save, CheckCircle, XCircle } from 'lucide-react';

interface ProviderConfig {
  id?: number;
  provider_type: 'twilio' | 'africastalking';
  account_id: string;
  api_key: string;
  sender_id: string;
  is_active: boolean;
  use_mock: boolean;
}

const DEFAULT_TWILIO: ProviderConfig = {
  provider_type: 'twilio',
  account_id: '',
  api_key: '',
  sender_id: '',
  is_active: false,
  use_mock: true
};

const DEFAULT_AT: ProviderConfig = {
  provider_type: 'africastalking',
  account_id: '',
  api_key: '',
  sender_id: '',
  is_active: false,
  use_mock: true
};

export const ProviderSettings: React.FC = () => {
  const [twilioConfig, setTwilioConfig] = useState<ProviderConfig>(DEFAULT_TWILIO);
  const [atConfig, setAtConfig] = useState<ProviderConfig>(DEFAULT_AT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.crm.getProviderConfigs();
      const results = response.results || response;
      
      const twilio = results.find((c: any) => c.provider_type === 'twilio');
      const at = results.find((c: any) => c.provider_type === 'africastalking');

      if (twilio) setTwilioConfig(twilio);
      if (at) setAtConfig(at);
    } catch (err) {
      console.error('Failed to fetch provider configs:', err);
      setMessage({ type: 'error', text: 'Failed to load configuration.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: ProviderConfig, setConfig: React.Dispatch<React.SetStateAction<ProviderConfig>>) => {
    setIsSaving(true);
    setMessage(null);
    try {
      let saved: ProviderConfig;
      if (config.id) {
        saved = await api.crm.updateProviderConfig(config.id, config);
      } else {
        saved = await api.crm.createProviderConfig(config);
      }
      setConfig(saved);
      setMessage({ type: 'success', text: `${config.provider_type} configuration saved successfully.` });
    } catch (err) {
      console.error('Failed to save config:', err);
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const renderConfigForm = (
    title: string, 
    config: ProviderConfig, 
    setConfig: React.Dispatch<React.SetStateAction<ProviderConfig>>
  ) => (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account ID / Username
          </label>
          <input 
            type="text" 
            value={config.account_id || ''}
            onChange={(e) => setConfig({...config, account_id: e.target.value})}
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={config.provider_type === 'twilio' ? 'Account SID' : 'Username'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key / Auth Token
          </label>
          <input 
            type="password" 
            value={config.api_key || ''}
            onChange={(e) => setConfig({...config, api_key: e.target.value})}
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={config.provider_type === 'twilio' ? 'Auth Token' : 'API Key'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sender ID / Phone Number
          </label>
          <input 
            type="text" 
            value={config.sender_id || ''}
            onChange={(e) => setConfig({...config, sender_id: e.target.value})}
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={config.provider_type === 'twilio' ? '+1234567890' : 'Sender ID'}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6 mb-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={config.is_active}
            onChange={(e) => setConfig({...config, is_active: e.target.checked})}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Provider Active</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={config.use_mock}
            onChange={(e) => setConfig({...config, use_mock: e.target.checked})}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mock Mode (No credits used)</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => handleSave(config, setConfig)}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 font-medium"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Configuration
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          CRM Provider Settings
        </h2>
        <p className="text-gray-500 mt-2">
          Configure your Twilio (WhatsApp) and Africa's Talking (SMS) credentials. 
          Enable mock mode for development and testing.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {renderConfigForm("Twilio (WhatsApp)", twilioConfig, setTwilioConfig)}
      {renderConfigForm("Africa's Talking (SMS)", atConfig, setAtConfig)}
    </div>
  );
};
