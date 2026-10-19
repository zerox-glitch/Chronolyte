import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ScheduleCallProps {
  isOpen: boolean;
  onClose: () => void;
}

const budgetsByService: Record<string, { label: string; value: number }[]> = {
  website: [
    { label: 'Starter Business Website', value: 600 },
    { label: 'Pro Business Website', value: 950 },
    { label: 'AI-Enhanced Website', value: 1400 },
    { label: 'Custom Web Platform', value: 2500 }
  ],
  saas: [
    { label: 'MVP SaaS Build', value: 3000 },
    { label: 'Growth SaaS Platform', value: 6500 },
    { label: 'Scale SaaS System', value: 9500 },
    { label: 'Enterprise SaaS', value: 15000 }
  ],
  automation: [
    { label: 'Basic Automation', value: 600 },
    { label: 'Smart Automation', value: 1500 },
    { label: 'Automation Suite', value: 3000 }
  ],
  'ai-tools': [
    { label: 'AI Tool Starter', value: 900 },
    { label: 'AI Tool Pro', value: 2500 },
    { label: 'AI Tool Scale', value: 5000 },
    { label: 'AI Tool Enterprise', value: 10000 }
  ],
  other: []
};

const getMinBudget = (service: string): number => {
  const options = budgetsByService[service as keyof typeof budgetsByService];
  if (!options || options.length === 0) return 0;
  return Math.min(...options.map(o => o.value));
};

export function ScheduleCall({ isOpen, onClose }: ScheduleCallProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budgetOption: '',
    customBudget: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedService = formData.service as keyof typeof budgetsByService;
  const budgetOptions = selectedService ? budgetsByService[selectedService] : [];
  const minBudget = selectedService ? getMinBudget(selectedService) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'service' && { budgetOption: '', customBudget: '' }), // Reset budget when service changes
      ...(name === 'budgetOption' && { budgetOption: value, customBudget: value })
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.service) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.service === 'other' && !formData.customBudget) {
      setError('Please enter a budget amount');
      return false;
    }

    if (formData.service !== 'other' && !formData.budgetOption && !formData.customBudget) {
      setError('Please select or enter a budget');
      return false;
    }

    if (formData.customBudget) {
      const customAmount = parseFloat(formData.customBudget);
      if (isNaN(customAmount) || customAmount < 0) {
        setError('Please enter a valid budget amount');
        return false;
      }
      if (selectedService !== 'other' && customAmount < minBudget) {
        setError(`Budget must be at least $${minBudget}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalBudget = formData.customBudget || formData.budgetOption;
      const selectedOption = budgetOptions.find(opt => opt.value.toString() === formData.budgetOption)?.label || 'Custom';
      
      // Format service name for display
      const serviceDisplayNames: Record<string, string> = {
        'website': 'Website Development',
        'saas': 'SaaS Development',
        'automation': 'AI Automation',
        'ai-tools': 'Custom AI Tools',
        'other': 'Other Services'
      };

      // Submit to backend with proper API structure
      const response = await fetch('/backend/api/leads.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          company: formData.company || '',
          service_interested: serviceDisplayNames[formData.service] || formData.service,
          budget: finalBudget,
          notes: `Service Type: ${serviceDisplayNames[formData.service] || formData.service}\nSelected Package: ${selectedOption}\nBudget: $${finalBudget}\n\nProject Details:\n${formData.message || 'No details provided'}`,
          status: 'new',
          source: 'schedule-call-form',
          priority: 'high'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || 'Failed to submit form');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        budgetOption: '',
        customBudget: '',
        message: ''
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-dark-900 border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white/70" />
        </button>

        {submitted ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="font-display text-2xl font-bold mb-4">Call Scheduled!</h3>
            <p className="text-white/60">
              Thank you! We've received your request and will contact you soon to confirm your call.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Schedule Your</span>
              <h2 className="font-display text-3xl font-bold mt-2">
                Free Consultation <span className="gradient-text">Call</span>
              </h2>
              <p className="text-white/60 mt-3">
                Let's discuss your project and find the perfect solution for your needs.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              {/* Phone & Company */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Service *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                >
                  <option value="" className="bg-dark-900">Select a service...</option>
                  <option value="website" className="bg-dark-900">Website Development</option>
                  <option value="saas" className="bg-dark-900">SaaS Development</option>
                  <option value="automation" className="bg-dark-900">AI Automation</option>
                  <option value="ai-tools" className="bg-dark-900">Custom AI Tools</option>
                  <option value="other" className="bg-dark-900">Other</option>
                </select>
              </div>

              {/* Budget Options */}
              {selectedService && selectedService !== 'other' && budgetOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Budget Options</label>
                  <div className="space-y-2">
                    {budgetOptions.map((option) => (
                      <label key={option.value} className="flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-colors">
                        <input
                          type="radio"
                          name="budgetOption"
                          value={option.value.toString()}
                          checked={formData.budgetOption === option.value.toString()}
                          onChange={handleChange}
                          className="w-4 h-4 text-cyan-500 cursor-pointer"
                        />
                        <span className="ml-3 text-white flex-1">
                          {option.label}
                        </span>
                        <span className="text-cyan-400 font-semibold">${option.value.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Budget Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {selectedService === 'other' ? 'Your Budget *' : 'Or Enter Custom Budget'}
                  {selectedService && selectedService !== 'other' && minBudget > 0 && (
                    <span className="text-white/50 text-xs ml-2">(minimum: ${minBudget})</span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-white/50 font-semibold">$</span>
                  <input
                    type="number"
                    name="customBudget"
                    value={formData.customBudget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-8 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder={selectedService === 'other' ? 'Enter amount' : 'Custom amount'}
                    min={minBudget || 0}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Project Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-black hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  <>
                    Schedule Call
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </>
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
