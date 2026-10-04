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

  const getToken = () => localStorage.getItem('admin_token') || '';
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data.map((p: any) => ({
          ...p,
          id: Number(p.id),
          tech_stack: typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack || '[]') : (p.tech_stack || []),
          metrics: typeof p.metrics === 'string' ? JSON.parse(p.metrics || '{}') : (p.metrics || {})
        })));
        return;
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
    setProjects([]);
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

  const saveProject = async () => {
    if (!formData.title || !formData.client_name) {
      setMessage({ type: 'error', text: 'Title and client name are required' });
      return;
    }

    try {
      const payload: any = {
        title: formData.title,
        client_name: formData.client_name,
        project_type: formData.project_type || 'saas',
        short_description: formData.short_description || '',
        long_description: formData.long_description || '',
        featured_image: formData.featured_image || '',
        tech_stack: formData.tech_stack || [],
        metrics: formData.metrics || {},
        price: formData.price || 0,
        published: 1
      };
      if (editingId === -1) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`/api/projects?id=${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      }
      setMessage({ type: 'success', text: editingId === -1 ? 'Project added!' : 'Project updated!' });
      setEditingId(null);
      setFormData({});
      setShowForm(false);
      loadProjects();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save project' });
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      setMessage({ type: 'success', text: 'Project deleted' });
      loadProjects();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
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
