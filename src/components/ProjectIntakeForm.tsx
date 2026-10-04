import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Send, User, Building2, Mail, Phone, FileText, Clock, DollarSign, Sparkles } from 'lucide-react';

interface ProjectIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: {
    name: string;
    price: number;
    category: string;
  };
}

interface FormData {
  // Step 1: Basic Info
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  // Step 2: Project Details
  selected_package: string;
  budget: string;
  timeline: string;
  project_description: string;
  must_have_features: string;
  // Step 3: Confirmation
  terms_accepted: boolean;
}

const initialFormData: FormData = {
  full_name: '',
  email: '',
  company_name: '',
  phone: '',
  selected_package: '',
  budget: '',
  timeline: '',
  project_description: '',
  must_have_features: '',
  terms_accepted: false,
};

const budgetOptions = [
  { value: '1000-3000', label: '$1,000 - $3,000' },
  { value: '3000-5000', label: '$3,000 - $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: '10000-20000', label: '$10,000 - $20,000' },
  { value: '20000-50000', label: '$20,000 - $50,000' },
  { value: '50000+', label: '$50,000+' },
  { value: 'custom', label: 'Custom Quote Needed' },
];

const timelineOptions = [
  { value: '2-4-weeks', label: '2-4 Weeks' },
  { value: '1-2-months', label: '1-2 Months' },
  { value: '3-months+', label: '3+ Months' },
  { value: 'flexible', label: 'Flexible / No Rush' },
];

export function ProjectIntakeForm({ isOpen, onClose, selectedPackage }: ProjectIntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill package info when modal opens
  useEffect(() => {
    if (selectedPackage && isOpen) {
      // Find matching budget option based on price
      let budgetValue = 'custom';
      if (selectedPackage.price) {
        if (selectedPackage.price <= 3000) budgetValue = '1000-3000';
        else if (selectedPackage.price <= 5000) budgetValue = '3000-5000';
        else if (selectedPackage.price <= 10000) budgetValue = '5000-10000';
        else if (selectedPackage.price <= 20000) budgetValue = '10000-20000';
        else if (selectedPackage.price <= 50000) budgetValue = '20000-50000';
        else budgetValue = '50000+';
      }
      
      setFormData(prev => ({
        ...prev,
        selected_package: `${selectedPackage.name} (${selectedPackage.category})`,
        budget: budgetValue,
      }));
    }
  }, [selectedPackage, isOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(1);
        setFormData(initialFormData);
        setErrors({});
        setSubmitSuccess(false);
        setSubmitError('');
      }, 300);
    }
  }, [isOpen]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (step === 2) {
      if (!formData.project_description.trim()) {
        newErrors.project_description = 'Project description is required';
      } else if (formData.project_description.trim().length < 50) {
        newErrors.project_description = 'Please provide at least 50 characters describing your project';
      }
      if (!formData.budget) {
        newErrors.budget = 'Please select a budget range';
      }
      if (!formData.timeline) {
        newErrors.timeline = 'Please select a timeline';
      }
    }

    if (step === 3) {
      if (!formData.terms_accepted) {
        newErrors.terms_accepted = 'Please accept the terms to continue';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/backend/api/project-requests.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Get response text first to handle empty responses
      const text = await response.text();
      
      if (!text) {
        throw new Error('Server returned empty response. Please try again.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', text);
        throw new Error('Server error. Please try again later.');
      }

      if (data.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Project Details', icon: FileText },
    { number: 3, title: 'Confirm', icon: Check },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0d0d14] to-[#141420] rounded-2xl border border-white/10 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Request Submitted!</h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Thank you for your interest in working with Chronolyte. We'll review your project request and contact you within 24 hours.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Start Your Project</h2>
                  </div>
                  <p className="text-white/50 text-sm">
                    Tell us about your project and we'll get back to you within 24 hours.
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStep === step.number
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-black'
                                : currentStep > step.number
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {currentStep > step.number ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          <span className={`text-xs mt-2 ${
                            currentStep >= step.number ? 'text-white' : 'text-white/40'
                          }`}>
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-16 sm:w-24 h-0.5 mx-2 ${
                            currentStep > step.number ? 'bg-emerald-500' : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <User className="w-4 h-4" />
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => updateField('full_name', e.target.value)}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 bg-white/5 border ${
                              errors.full_name ? 'border-red-500' : 'border-white/10'
                            } rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors`}
                          />
                          {errors.full_name && (
                            <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <Mail className="w-4 h-4" />
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="john@company.com"
                            className={`w-full px-4 py-3 bg-white/5 border ${
                              errors.email ? 'border-red-500' : 'border-white/10'
                            } rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <Building2 className="w-4 h-4" />
                            Company Name <span className="text-white/40">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => updateField('company_name', e.target.value)}
                            placeholder="Your Company Inc."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <Phone className="w-4 h-4" />
                            Phone Number <span className="text-white/40">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Project Details */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {/* Selected Package (read-only) */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <Sparkles className="w-4 h-4" />
                            Selected Package
                          </label>
                          <div className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg text-cyan-400">
                            {formData.selected_package || 'Custom Project'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                              <DollarSign className="w-4 h-4" />
                              Budget Range <span className="text-red-400">*</span>
                            </label>
                            <select
                              value={formData.budget}
                              onChange={(e) => updateField('budget', e.target.value)}
                              className={`w-full px-4 py-3 bg-white/5 border ${
                                errors.budget ? 'border-red-500' : 'border-white/10'
                              } rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer`}
                            >
                              <option value="" className="bg-[#1a1a2e]">Select budget...</option>
                              {budgetOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {errors.budget && (
                              <p className="mt-1 text-sm text-red-400">{errors.budget}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                              <Clock className="w-4 h-4" />
                              Desired Timeline <span className="text-red-400">*</span>
                            </label>
                            <select
                              value={formData.timeline}
                              onChange={(e) => updateField('timeline', e.target.value)}
                              className={`w-full px-4 py-3 bg-white/5 border ${
                                errors.timeline ? 'border-red-500' : 'border-white/10'
                              } rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer`}
                            >
                              <option value="" className="bg-[#1a1a2e]">Select timeline...</option>
                              {timelineOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {errors.timeline && (
                              <p className="mt-1 text-sm text-red-400">{errors.timeline}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <FileText className="w-4 h-4" />
                            Project Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            value={formData.project_description}
                            onChange={(e) => updateField('project_description', e.target.value)}
                            placeholder="Tell us about your project goals, target audience, and what you're looking to achieve..."
                            rows={4}
                            className={`w-full px-4 py-3 bg-white/5 border ${
                              errors.project_description ? 'border-red-500' : 'border-white/10'
                            } rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors resize-none`}
                          />
                          <div className="flex justify-between mt-1">
                            {errors.project_description ? (
                              <p className="text-sm text-red-400">{errors.project_description}</p>
                            ) : (
                              <span />
                            )}
                            <span className={`text-xs ${
                              formData.project_description.length >= 50 ? 'text-emerald-400' : 'text-white/40'
                            }`}>
                              {formData.project_description.length}/50 min
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                            <Sparkles className="w-4 h-4" />
                            Must-Have Features <span className="text-white/40">(optional)</span>
                          </label>
                          <textarea
                            value={formData.must_have_features}
                            onChange={(e) => updateField('must_have_features', e.target.value)}
                            placeholder="List any specific features or functionality you need (e.g., user authentication, payment processing, analytics dashboard...)"
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Confirmation */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Summary */}
                        <div className="bg-white/5 rounded-xl p-5 space-y-4">
                          <h4 className="font-semibold text-white mb-3">Project Summary</h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/50">Name:</span>
                              <p className="text-white">{formData.full_name}</p>
                            </div>
                            <div>
                              <span className="text-white/50">Email:</span>
                              <p className="text-white">{formData.email}</p>
                            </div>
                            {formData.company_name && (
                              <div>
                                <span className="text-white/50">Company:</span>
                                <p className="text-white">{formData.company_name}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-white/50">Package:</span>
                              <p className="text-cyan-400">{formData.selected_package || 'Custom'}</p>
                            </div>
                            <div>
                              <span className="text-white/50">Budget:</span>
                              <p className="text-white">{budgetOptions.find(b => b.value === formData.budget)?.label}</p>
                            </div>
                            <div>
                              <span className="text-white/50">Timeline:</span>
                              <p className="text-white">{timelineOptions.find(t => t.value === formData.timeline)?.label}</p>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/50 text-sm">Project Description:</span>
                            <p className="text-white text-sm mt-1">{formData.project_description}</p>
                          </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className={`p-4 rounded-lg border ${
                          errors.terms_accepted ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-white/5'
                        }`}>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <button
                              type="button"
                              onClick={() => updateField('terms_accepted', !formData.terms_accepted)}
                              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                formData.terms_accepted 
                                  ? 'bg-cyan-500 border-cyan-500' 
                                  : 'bg-transparent border-white/40 hover:border-cyan-400'
                              }`}
                            >
                              {formData.terms_accepted && (
                                <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                              )}
                            </button>
                            <span className="text-sm text-white/70 leading-relaxed">
                              I understand that projects begin after consultation and a 50% deposit payment. 
                              I have read and agree to the{' '}
                              <a href="/terms" target="_blank" className="text-cyan-400 hover:underline">Terms of Service</a>,{' '}
                              <a href="/privacy" target="_blank" className="text-cyan-400 hover:underline">Privacy Policy</a>, and{' '}
                              <a href="/refunds" target="_blank" className="text-cyan-400 hover:underline">Refund Policy</a>.
                            </span>
                          </label>
                          {errors.terms_accepted && (
                            <p className="mt-2 text-sm text-red-400">{errors.terms_accepted}</p>
                          )}
                        </div>

                        {/* Info Notice */}
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                          <p className="text-sm text-cyan-300">
                            <strong>What happens next?</strong><br />
                            After submitting, our team will review your project within 24 hours. 
                            We'll schedule a free consultation call to discuss your requirements 
                            and provide a detailed proposal with timeline and pricing.
                          </p>
                        </div>

                        {submitError && (
                          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">{submitError}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-between">
                  <button
                    onClick={currentStep === 1 ? onClose : prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Project Request
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
