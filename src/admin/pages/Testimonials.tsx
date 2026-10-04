import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Star,
  Check,
  X,
  Edit,
  Trash2,
  Quote,
  AlertCircle
} from 'lucide-react';
import { mockTestimonials } from '../mockData';
import type { Testimonial } from '../types';

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400' }
};

function TestimonialFormModal({ 
  testimonial, 
  onClose,
  onSave
}: { 
  testimonial: Testimonial | null; 
  onClose: () => void;
  onSave: (data: Partial<Testimonial>) => void;
}) {
  const [formData, setFormData] = useState(testimonial || {
    id: '',
    client_name: '',
    company: '',
    content: '',
    rating: 5,
    status: 'pending',
    featured: false,
    client_title: '',
    avatar: '',
    created_at: new Date().toISOString()
  });

  const handleSubmit = () => {
    if (!formData.client_name || !formData.company || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#15151f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#15151f] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Client Name *</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
              placeholder="Enter client name"
            />
          </div>

          {/* Company & Title Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="Enter company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Job Title</label>
              <input
                type="text"
                value={formData.client_title}
                onChange={(e) => setFormData({...formData, client_title: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g., CEO"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Testimonial *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
              placeholder="Enter testimonial text"
            />
          </div>

          {/* Rating & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                {[1,2,3,4,5].map(i => <option key={i} value={i} className="bg-[#15151f]">{i} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="pending" className="bg-[#15151f]">Pending</option>
                <option value="approved" className="bg-[#15151f]">Approved</option>
                <option value="rejected" className="bg-[#15151f]">Rejected</option>
              </select>
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-4 h-4 rounded border-white/30 bg-white/5 cursor-pointer"
            />
            <label htmlFor="featured" className="text-sm text-white/70 cursor-pointer">
              Featured on homepage
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity"
            >
              {testimonial ? 'Update' : 'Add'} Testimonial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialModal({ testimonial, onClose }: { testimonial: Testimonial | null; onClose: () => void }) {
  if (!testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#15151f] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="sticky top-0 bg-[#15151f] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Testimonial Details</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="flex items-center gap-4">
            {testimonial.avatar ? (
              <img 
                src={testimonial.avatar} 
                alt={testimonial.client_name}
                className="w-16 h-16 rounded-full bg-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                {testimonial.client_name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{testimonial.client_name}</h3>
              <p className="text-white/60">{testimonial.client_title} at {testimonial.company}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-6 h-6 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
              />
            ))}
            <span className="text-white/50 ml-2">{testimonial.rating}/5</span>
          </div>

          {/* Content */}
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-cyan-500/20" />
            <div className="p-6 bg-white/5 rounded-xl">
              <p className="text-white/80 leading-relaxed italic text-lg">{testimonial.content}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[testimonial.status].bg} ${statusColors[testimonial.status].text}`}>
                {testimonial.status}
              </span>
              {testimonial.featured && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-400">
                  Featured
                </span>
              )}
            </div>
            <span className="text-sm text-white/40">
              Submitted {new Date(testimonial.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {testimonial.status === 'pending' && (
              <>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                  <Check className="w-5 h-5" />
                  Approve
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl font-medium text-red-400 hover:bg-red-500/30 transition-colors">
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </>
            )}
            <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors">
              Edit
            </button>
            <button className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl font-medium text-red-400 hover:bg-red-500/20 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ 
  testimonial, 
  onClick, 
  onEdit, 
  onDelete 
}: { 
  testimonial: Testimonial; 
  onClick: () => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6 hover:border-white/10 cursor-pointer transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {testimonial.avatar ? (
            <img 
              src={testimonial.avatar} 
              alt={testimonial.client_name}
              className="w-12 h-12 rounded-full bg-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
              {testimonial.client_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">
              {testimonial.client_name}
            </p>
            <p className="text-sm text-white/50">{testimonial.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {testimonial.featured && (
            <span className="text-xs text-cyan-400">Featured</span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[testimonial.status].bg} ${statusColors[testimonial.status].text}`}>
            {testimonial.status}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-white/60 line-clamp-3 text-sm leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-white/40">
          {new Date(testimonial.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              onEdit(testimonial);
            }}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              if (confirm('Delete this testimonial?')) {
                onDelete(testimonial.id);
              }
            }}
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonials, setTestimonials] = useState(mockTestimonials);

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          testimonial.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    featured: testimonials.filter(t => t.featured).length
  };

  const handleSaveTestimonial = (data: Partial<Testimonial>) => {
    if (isEditingTestimonial) {
      // Update existing
      setTestimonials(testimonials.map(t => 
        t.id === isEditingTestimonial.id ? { ...t, ...data } : t
      ));
      setIsEditingTestimonial(null);
    } else {
      // Add new
      const newTestimonial: Testimonial = {
        id: `testimonial-${Date.now()}`,
        client_name: data.client_name || '',
        company: data.company || '',
        content: data.content || '',
        rating: data.rating || 5,
        status: data.status || 'pending',
        featured: data.featured || false,
        client_title: data.client_title || '',
        avatar: data.avatar || '',
        created_at: new Date().toISOString()
      };
      setTestimonials([...testimonials, newTestimonial]);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Testimonials</h1>
          <p className="text-white/50 mt-1">Manage client testimonials and reviews</p>
        </div>
        <button 
          onClick={() => {
            setIsEditingTestimonial(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Approved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Featured</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.featured}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all" className="bg-[#15151f]">All Statuses</option>
          <option value="pending" className="bg-[#15151f]">Pending</option>
          <option value="approved" className="bg-[#15151f]">Approved</option>
          <option value="rejected" className="bg-[#15151f]">Rejected</option>
        </select>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTestimonials.map((testimonial) => (
          <TestimonialCard 
            key={testimonial.id} 
            testimonial={testimonial} 
            onClick={() => setSelectedTestimonial(testimonial)}
            onEdit={(t) => {
              setIsEditingTestimonial(t);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteTestimonial}
          />
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="p-12 text-center bg-[#0d0d14] border border-white/5 rounded-2xl">
          <p className="text-white/50">No testimonials found matching your criteria.</p>
        </div>
      )}

      {/* Testimonial View Modal */}
      {selectedTestimonial && (
        <TestimonialModal 
          testimonial={selectedTestimonial} 
          onClose={() => setSelectedTestimonial(null)} 
        />
      )}

      {/* Testimonial Form Modal */}
      {isAddModalOpen && (
        <TestimonialFormModal 
          testimonial={isEditingTestimonial}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditingTestimonial(null);
          }}
          onSave={handleSaveTestimonial}
        />
      )}
    </div>
  );
}
