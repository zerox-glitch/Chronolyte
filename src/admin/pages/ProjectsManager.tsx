import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Save } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  client_name: string;
  project_type: string;
  short_description: string;
  long_description?: string;
  tech_stack: string[];
  featured_image: string;
  price?: number;
  metrics?: Record<string, string>;
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    // Load from backend or use mock + custom projects
    const customProjects = localStorage.getItem('all-projects');
    const stored = customProjects ? JSON.parse(customProjects) : [];
    
    const defaults: Project[] = [
      {
        id: 1,
        title: 'InvoiceFlow Pro',
        client_name: 'InvoiceFlow',
        project_type: 'saas',
        short_description: 'Complete invoicing and billing SaaS platform with automated reminders, payment tracking, and financial analytics.',
        long_description: 'A comprehensive SaaS solution for managing invoices, tracking payments, and generating financial reports. Features automated reminders and integration with major payment gateways.',
        featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        tech_stack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
        price: 4500,
        metrics: { users: '2,500+', revenue: '$45K MRR' }
      },
      {
        id: 2,
        title: 'Luxe Real Estate',
        client_name: 'Luxe RE',
        project_type: 'website',
        short_description: 'Premium real estate website with virtual tours, property search, and lead capture system.',
        long_description: 'A stunning real estate website featuring virtual property tours, advanced search filters, and an integrated lead capture system to convert visitors into qualified leads.',
        featured_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        tech_stack: ['Next.js', 'Framer Motion', 'Sanity CMS'],
        price: 3200,
        metrics: { traffic: '50K/mo', leads: '200+/mo' }
      },
      {
        id: 3,
        title: 'LeadGen AI',
        client_name: 'LeadGen',
        project_type: 'automation',
        short_description: 'Automated lead generation system with AI-powered qualification and CRM integration.',
        long_description: 'An intelligent automation system that generates, qualifies, and nurtures leads using AI. Integrates with major CRM platforms for seamless workflow.',
        featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        tech_stack: ['Python', 'OpenAI', 'Zapier', 'HubSpot'],
        price: 5000,
        metrics: { leads: '1,000+/mo', accuracy: '95%' }
      }
    ];

    const combined = defaults.map(d => {
      const custom = stored.find((p: any) => p.id === d.id);
      return custom ? { ...d, ...custom } : d;
    });
    combined.push(...stored.filter((p: any) => !defaults.find(d => d.id === p.id)));
    
    setProjects(combined);
  };

  const startAdd = () => {
    setFormData({ tech_stack: [], project_type: 'saas', metrics: {} });
    setEditingId(-1);
    setShowForm(true);
  };

  const startEdit = (project: Project) => {
    setFormData(project);
    setEditingId(project.id);
    setShowForm(true);
  };

  const addTech = () => {
    if (!techInput) return;
    const tech_stack = [...(formData.tech_stack || []), techInput];
    setFormData({ ...formData, tech_stack });
    setTechInput('');
  };

  const removeTech = (index: number) => {
    const tech_stack = (formData.tech_stack || []).filter((_, i) => i !== index);
    setFormData({ ...formData, tech_stack });
  };

  const saveProject = () => {
    if (!formData.title || !formData.client_name) {
      setMessage({ type: 'error', text: 'Title and client name are required' });
      return;
    }

    let updated;
    if (editingId === -1) {
      const newId = Math.max(0, ...projects.map(p => p.id)) + 1;
      const newProject: Project = {
        id: newId,
        title: formData.title,
        client_name: formData.client_name,
        project_type: formData.project_type || 'saas',
        short_description: formData.short_description || '',
        long_description: formData.long_description,
        featured_image: formData.featured_image || 'https://via.placeholder.com/400x300',
        tech_stack: formData.tech_stack || [],
        price: formData.price,
        metrics: formData.metrics
      };
      updated = [...projects, newProject];
    } else {
      updated = projects.map(p =>
        p.id === editingId
          ? { ...p, ...formData }
          : p
      );
    }

    setProjects(updated);
    
    // Save custom projects to localStorage
    const defaultIds = [1, 2, 3];
    const customProjects = updated.filter(p => !defaultIds.includes(p.id));
    if (customProjects.length > 0) {
      localStorage.setItem('all-projects', JSON.stringify(customProjects));
    }

    setMessage({ type: 'success', text: editingId === -1 ? 'Project added!' : 'Project updated!' });
    setEditingId(null);
    setFormData({});
    setShowForm(false);
    setTimeout(() => setMessage(null), 2000);
  };

  const deleteProject = (id: number) => {
    if (!confirm('Delete this project?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    
    const customProjects = updated.filter(p => ![1, 2, 3].includes(p.id));
    if (customProjects.length > 0) {
      localStorage.setItem('all-projects', JSON.stringify(customProjects));
    } else {
      localStorage.removeItem('all-projects');
    }
    
    setMessage({ type: 'success', text: 'Project deleted' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects Manager</h1>
          <p className="text-white/50 mt-1">Manage your portfolio projects with details and pricing</p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={message.type === 'success' ? 'text-emerald-200' : 'text-red-200'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0d0d14] pb-4">
            <h2 className="text-lg font-bold text-white">
              {editingId === -1 ? 'Add Project' : 'Edit Project'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({});
              }}
              className="text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., MyApp Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Client Name *</label>
                <input
                  type="text"
                  value={formData.client_name || ''}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                <select
                  value={formData.project_type || 'saas'}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="saas" className="bg-[#15151f]">SaaS</option>
                  <option value="website" className="bg-[#15151f]">Website</option>
                  <option value="automation" className="bg-[#15151f]">Automation</option>
                  <option value="ai_tool" className="bg-[#15151f]">AI Tool</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Price</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Short Description *</label>
              <textarea
                value={formData.short_description || ''}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                placeholder="Brief project description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Long Description</label>
              <textarea
                value={formData.long_description || ''}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                placeholder="Detailed project information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Featured Image URL</label>
              <input
                type="url"
                value={formData.featured_image || ''}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                placeholder="https://..."
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Technologies</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Add tech and press Enter"
                />
                <button
                  onClick={addTech}
                  className="px-4 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(formData.tech_stack || []).map((tech, index) => (
                  <div key={index} className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                    {tech}
                    <button
                      onClick={() => removeTech(index)}
                      className="text-cyan-300 hover:text-cyan-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveProject}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Project
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({});
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <p className="text-sm text-white/60">{project.client_name} • {project.project_type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(project)}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-white/60 text-sm mb-3">{project.short_description}</p>

            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech_stack.slice(0, 3).map(tech => (
                  <span key={tech} className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
                {project.tech_stack.length > 3 && (
                  <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                    +{project.tech_stack.length - 3}
                  </span>
                )}
              </div>
            )}

            {project.price && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-cyan-400 font-bold">${project.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsManager;
