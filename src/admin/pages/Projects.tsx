import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Clock, 
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { mockProjects, mockUsers } from '../mockData';
import type { Project } from '../types';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  planning: { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-500' },
  in_progress: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-500' },
  review: { bg: 'bg-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-500' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  on_hold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' }
};

const typeLabels: Record<string, string> = {
  saas: 'SaaS',
  website: 'Website',
  automation: 'Automation',
  ai_tool: 'AI Tool'
};

function ProjectFormModal({ 
  project, 
  onClose,
  onSave
}: { 
  project: Project | null; 
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}) {
  const [formData, setFormData] = useState(project || {
    id: '',
    name: '',
    client_name: '',
    description: '',
    type: 'website' as const,
    status: 'planning' as const,
    budget: 0,
    progress: 0,
    deadline: new Date().toISOString().split('T')[0],
    team_members: [],
    created_at: new Date().toISOString()
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.client_name || !formData.budget) {
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
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
              placeholder="Enter project name"
            />
          </div>

          {/* Client & Type Row */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-white mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="saas" className="bg-[#15151f]">SaaS</option>
                <option value="website" className="bg-[#15151f]">Website</option>
                <option value="automation" className="bg-[#15151f]">Automation</option>
                <option value="ai_tool" className="bg-[#15151f]">AI Tool</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
              placeholder="Enter project description"
            />
          </div>

          {/* Budget & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Budget (USD) *</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="planning" className="bg-[#15151f]">Planning</option>
                <option value="in_progress" className="bg-[#15151f]">In Progress</option>
                <option value="review" className="bg-[#15151f]">Review</option>
                <option value="completed" className="bg-[#15151f]">Completed</option>
                <option value="on_hold" className="bg-[#15151f]">On Hold</option>
              </select>
            </div>
          </div>

          {/* Progress & Deadline Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
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
              {project ? 'Update' : 'Create'} Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;

  const teamMembers = mockUsers.filter(u => project.team_members.includes(u.id));
  const colors = statusColors[project.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#15151f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#15151f] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Project Details</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
                  {typeLabels[project.type]}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">{project.name}</h3>
              <p className="text-white/60 mt-1">{project.client_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/50">Budget</p>
              <p className="text-2xl font-bold text-emerald-400">${project.budget.toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-white/50 mb-2">Description</p>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-white/80 leading-relaxed">{project.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">Progress</span>
              <span className="font-medium text-white">{project.progress}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/50 mb-1">Start Date</p>
              <p className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                {new Date(project.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/50 mb-1">Deadline</p>
              <p className="text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <p className="text-sm text-white/50 mb-3">Team Members</p>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-8 h-8 rounded-full bg-gray-700"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-white/50">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity">
              Update Progress
            </button>
            <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors">
              Edit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  onClick,
  onEdit,
  onDelete
}: { 
  project: Project; 
  onClick: () => void;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const colors = statusColors[project.status];
  const teamMembers = mockUsers.filter(u => project.team_members.includes(u.id));

  return (
    <div 
      onClick={onClick}
      className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6 hover:border-white/10 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <span className={`text-xs font-medium capitalize ${colors.text}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              onEdit(project);
            }}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              if (confirm('Delete this project?')) {
                onDelete(project.id);
              }
            }}
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 top-6">
          {typeLabels[project.type]}
        </span>
      </div>

      <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-cyan-400 transition-colors">
        {project.name}
      </h3>
      <p className="text-sm text-white/50 mb-4">{project.client_name}</p>

      <p className="text-sm text-white/60 line-clamp-2 mb-4">{project.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/40">Progress</span>
          <span className="text-white">{project.progress}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">${project.budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((member) => (
              <img 
                key={member.id}
                src={member.avatar} 
                alt={member.name}
                className="w-6 h-6 rounded-full border-2 border-[#0d0d14] bg-gray-700"
              />
            ))}
          </div>
          <span className="text-xs text-white/40 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(project.deadline).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState(mockProjects);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0)
  };

  const handleSaveProject = (data: Partial<Project>) => {
    if (isEditingProject) {
      // Update existing
      setProjects(projects.map(p => 
        p.id === isEditingProject.id ? { ...p, ...data } : p
      ));
      setIsEditingProject(null);
    } else {
      // Add new
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: data.name || '',
        client_name: data.client_name || '',
        description: data.description || '',
        type: data.type || 'website',
        status: data.status || 'planning',
        budget: data.budget || 0,
        progress: data.progress || 0,
        deadline: data.deadline || new Date().toISOString().split('T')[0],
        team_members: data.team_members || [],
        created_at: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Projects</h1>
          <p className="text-white/50 mt-1">Manage your client projects</p>
        </div>
        <button 
          onClick={() => {
            setIsEditingProject(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Total Projects</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">In Progress</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-white/50">Total Budget</p>
          <p className="text-2xl font-bold text-white mt-1">${(stats.totalBudget / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search projects..."
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
          <option value="planning" className="bg-[#15151f]">Planning</option>
          <option value="in_progress" className="bg-[#15151f]">In Progress</option>
          <option value="review" className="bg-[#15151f]">Review</option>
          <option value="completed" className="bg-[#15151f]">Completed</option>
          <option value="on_hold" className="bg-[#15151f]">On Hold</option>
        </select>
        <div className="flex items-center bg-[#0d0d14] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-3 text-sm ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 text-sm ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => setSelectedProject(project)}
              onEdit={(p) => {
                setIsEditingProject(p);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Project</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Progress</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Budget</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Deadline</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((project) => {
                  const colors = statusColors[project.status];
                  return (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{project.name}</p>
                          <p className="text-sm text-white/50">{project.client_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-emerald-400">
                          ${project.budget.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/50">
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedProject(project)}
                            className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setIsEditingProject(project);
                              setIsAddModalOpen(true);
                            }}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Delete this project?')) {
                                handleDeleteProject(project.id);
                              }
                            }}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center bg-[#0d0d14] border border-white/5 rounded-2xl">
          <p className="text-white/50">No projects found matching your criteria.</p>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {/* Project Form Modal */}
      {isAddModalOpen && (
        <ProjectFormModal 
          project={isEditingProject}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}
