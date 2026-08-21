import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { CheckCircle2, MessageSquare, LayoutTemplate, Loader2 } from 'lucide-react';
import { crmService } from '../../../services/crmService';

export const CampaignWizard: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    channel: 'WHATSAPP',
    audience: 'ALL',
    custom_message: '',
  });

  const handleLaunch = async () => {
    try {
      setIsSubmitting(true);
      await crmService.createCampaign({
        name: formData.name || 'Untitled Campaign',
        channel: formData.channel,
        custom_message: formData.custom_message,
        category: 'GENERAL'
      });
      toast.success("Campaign launched successfully!");
      navigate('/dashboard/crm');
    } catch (error) {
      toast.error("Failed to launch campaign.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const steps = [
    { title: 'Audience & Settings', icon: <LayoutTemplate size={24} /> },
    { title: 'Message', icon: <MessageSquare size={24} /> },
    { title: 'Launch', icon: <CheckCircle2 size={24} /> },
  ];

  return (
    <DashboardLayout title="Campaign Builder">
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 m-0">Create Campaign</h2>
          <p className="text-gray-500">Launch a new bulk communication campaign</p>
        </div>

        <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-[8px_8px_20px_#e0e5ec,-8px_-8px_20px_#ffffff] border border-white/80">
          
          {/* Steps Header */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
            {steps.map((step, idx) => {
              const isActive = idx === current;
              const isCompleted = idx < current;
              return (
                <div key={idx} className="flex flex-col items-center bg-white px-4 rounded-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-2 transition-colors ${
                    isActive ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 
                    isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-sm font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>
          
          {/* Content Area */}
          <div className="min-h-[300px] mb-8">
            {current === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Term 2 Fee Reminders" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white/50"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Communication Channel</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="cursor-pointer">
                        <input type="radio" name="channel" className="peer sr-only" checked={formData.channel === 'WHATSAPP'} onChange={() => setFormData({...formData, channel: 'WHATSAPP'})} />
                        <div className="h-16 flex items-center justify-center rounded-xl border-2 border-gray-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 text-gray-600 peer-checked:text-indigo-700 font-semibold transition-all shadow-sm">
                          WhatsApp
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="channel" className="peer sr-only" checked={formData.channel === 'SMS'} onChange={() => setFormData({...formData, channel: 'SMS'})} />
                        <div className="h-16 flex items-center justify-center rounded-xl border-2 border-gray-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 text-gray-600 peer-checked:text-indigo-700 font-semibold transition-all shadow-sm">
                          SMS
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50"
                      value={formData.audience}
                      onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    >
                      <option value="ALL">All Active Parents</option>
                      <option value="GRADE1">Grade 1 Parents</option>
                      <option value="DEFAULTERS">Fee Defaulters</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {current === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Compose Message</h3>
                  <p className="text-sm text-gray-500 mb-4">Use {'{{first_name}}'} and {'{{students_names}}'} for personalization.</p>
                  <textarea 
                    rows={8} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50 resize-none"
                    placeholder="Dear {{first_name}}, this is a reminder regarding {{students_names}}..."
                    value={formData.custom_message}
                    onChange={(e) => setFormData({...formData, custom_message: e.target.value})}
                  />
                </div>
                <div className="bg-gray-100/80 p-6 rounded-2xl shadow-inner border border-gray-200">
                  <h3 className="text-md font-bold text-gray-700 flex items-center gap-2 mb-4"><MessageSquare size={18}/> Preview</h3>
                  <div className="bg-white p-4 rounded-xl shadow-sm text-gray-800 text-sm space-y-2">
                    <p>Dear <strong>John</strong>,</p>
                    <p>This is a reminder regarding <strong>Jane Doe (Year 1)</strong>.</p>
                    <p>Please ensure fees are cleared by Friday.</p>
                    <p className="text-xs text-gray-400 mt-4 pt-2 border-t">Reply STOP to unsubscribe</p>
                  </div>
                </div>
              </div>
            )}

            {current === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <CheckCircle2 size={72} className="mx-auto text-emerald-500 mb-6 drop-shadow-md" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Launch</h3>
                <p className="text-gray-500 mb-8">Your campaign is configured and ready to be processed.</p>
                
                <div className="max-w-md mx-auto text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between py-3 border-b"><span className="text-gray-500">Campaign</span><span className="font-semibold text-gray-800">{formData.name || 'Untitled'}</span></div>
                  <div className="flex justify-between py-3 border-b"><span className="text-gray-500">Audience</span><span className="font-semibold text-gray-800">{formData.audience === 'ALL' ? 'All Active Parents' : formData.audience}</span></div>
                  <div className="flex justify-between py-3"><span className="text-gray-500">Channel</span><span className="font-semibold text-gray-800">{formData.channel}</span></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200/60">
            {current > 0 ? (
              <button onClick={() => setCurrent(c => c - 1)} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                Previous
              </button>
            ) : <div></div>}
            
            {current < steps.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="px-8 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all">
                Continue
              </button>
            ) : (
              <button onClick={handleLaunch} disabled={isSubmitting} className="px-8 py-2.5 rounded-xl font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};
