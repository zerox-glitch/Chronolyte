import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, Edit2, Eye, EyeOff, Star, ExternalLink, Image, Video, Link2, ChevronDown, ChevronUp, X, Upload, Globe, FolderOpen, Loader2 } from 'lucide-react';

interface ProjectImage {
  id?: number;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface Project {
  project_id?: number;
  title: string;
  slug?: string;
  client_name: string;
  short_description: string;
  full_description: string;
  project_type: 'saas' | 'website' | 'automation' | 'ai_tool' | 'custom';
  tech_stack: string[];
  features: string[];
  thumbnail_image: string;
  featured_image: string;
  live_url: string;
  demo_url: string;
  github_url: string;
  case_study_url: string;
  video_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  images: ProjectImage[];
}

const defaultProject: Project = {
  title: '',
  client_name: '',
  short_description: '',
  full_description: '',
  project_type: 'website',
  tech_stack: [],
  features: [],
  thumbnail_image: '',
  featured_image: '',
  live_url: '',
  demo_url: '',
  github_url: '',
  case_study_url: '',
  video_url: '',
  is_featured: false,
  is_published: false,
  display_order: 0,
  images: []
};

const projectTypes = [
  { value: 'saas', label: 'SaaS Application' },
  { value: 'website', label: 'Website' },
  { value: 'automation', label: 'Automation' },
  { value: 'ai_tool', label: 'AI Tool' },
  { value: 'custom', label: 'Custom Solution' }
];

export default function PortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [newTechItem, setNewTechItem] = useState('');
  const [newFeatureItem, setNewFeatureItem] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Media Gallery states
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaGalleryType, setMediaGalleryType] = useState<'image' | 'video'>('image');
  const [mediaGalleryTarget, setMediaGalleryTarget] = useState<'thumbnail' | 'featured' | 'gallery' | 'video'>('gallery');
  const [galleryFiles, setGalleryFiles] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && data.data) {
        const projectList = Array.isArray(data.data) ? data.data : data.data.projects || [];
        setProjects(projectList.map((p: any) => ({
          ...p,
          tech_stack: typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack || '[]') : (p.tech_stack || []),
          features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
          images: p.images || []
        })));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setMessage({ type: 'error', text: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Save project (create or update)
  const saveProject = async (project: Project) => {
    try {
      setSaving(true);
      const isUpdate = !!project.project_id;
      const url = isUpdate 
        ? `/api/projects?id=${project.project_id}`
        : '/api/projects';
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...project,
          tech_stack: project.tech_stack,
          features: project.features
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', isUpdate ? 'Project updated!' : 'Project created!');
        setEditingProject(null);
        setShowAddForm(false);
        fetchProjects();
      } else {
        throw new Error(data.message || 'Failed to save');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  // Delete project
  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Project deleted');
        fetchProjects();
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete project');
    }
  };

  // Toggle project visibility
  const togglePublished = async (project: Project) => {
    const updated = { ...project, is_published: !project.is_published };
    await saveProject(updated);
  };

  // Toggle featured status
  const toggleFeatured = async (project: Project) => {
    const updated = { ...project, is_featured: !project.is_featured };
    await saveProject(updated);
  };

  // Add tech stack item
  const addTechItem = () => {
    if (!newTechItem.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      tech_stack: [...editingProject.tech_stack, newTechItem.trim()]
    });
    setNewTechItem('');
  };

  // Remove tech stack item
  const removeTechItem = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      tech_stack: editingProject.tech_stack.filter((_, i) => i !== index)
    });
  };

  // Add feature item
  const addFeatureItem = () => {
    if (!newFeatureItem.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      features: [...editingProject.features, newFeatureItem.trim()]
    });
    setNewFeatureItem('');
  };

  // Remove feature item
  const removeFeatureItem = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      features: editingProject.features.filter((_, i) => i !== index)
    });
  };

  // Add image URL
  const addImageUrl = () => {
    if (!newImageUrl.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      images: [...editingProject.images, { url: newImageUrl.trim(), alt_text: '' }]
    });
    setNewImageUrl('');
  };

  // Remove image
  const removeImage = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      images: editingProject.images.filter((_, i) => i !== index)
    });
  };

  // Open Media Gallery
  const openMediaGallery = (type: 'image' | 'video', target: 'thumbnail' | 'featured' | 'gallery' | 'video') => {
    setMediaGalleryType(type);
    setMediaGalleryTarget(target);
    setShowMediaGallery(true);
    loadGalleryFiles(type);
  };

  // Load files from gallery
  const loadGalleryFiles = async (type: 'image' | 'video') => {
    setLoadingGallery(true);
    try {
      const response = await fetch(`/backend/api/upload.php?action=gallery&type=${type}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setGalleryFiles(data.data || []);
      } else {
        setGalleryFiles([]);
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setGalleryFiles([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/backend/api/upload.php?action=upload&type=${type}&category=projects`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success && data.data?.url) {
        // Add to gallery and select it
        selectMediaFile(data.data.url);
        showMessage('success', `${type === 'video' ? 'Video' : 'Image'} uploaded successfully!`);
      } else {
        showMessage('error', data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('error', 'Upload failed. Please check your server connection and try again.');
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (type === 'image' && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (type === 'video' && videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  // Select file from gallery
  const selectMediaFile = (url: string) => {
    if (!editingProject) return;

    switch (mediaGalleryTarget) {
      case 'thumbnail':
        setEditingProject({ ...editingProject, thumbnail_image: url });
        break;
      case 'featured':
        setEditingProject({ ...editingProject, featured_image: url });
        break;
      case 'gallery':
        setEditingProject({
          ...editingProject,
          images: [...editingProject.images, { url, alt_text: '' }]
        });
        break;
      case 'video':
        setEditingProject({ ...editingProject, video_url: url });
        break;
    }
    setShowMediaGallery(false);
  };

  // Project Form Component
  const ProjectForm = ({ project, onSave, onCancel }: { project: Project; onSave: (p: Project) => void; onCancel: () => void }) => {
    useEffect(() => {
      setEditingProject(project);
    }, [project]);

    if (!editingProject) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {project.project_id ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., E-Commerce Platform"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={editingProject.client_name}
                onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ABC Corporation"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
              <select
                value={editingProject.project_type}
                onChange={(e) => setEditingProject({ ...editingProject, project_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={editingProject.display_order}
                onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              value={editingProject.short_description}
              onChange={(e) => setEditingProject({ ...editingProject, short_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description for portfolio cards"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea
              value={editingProject.full_description}
              onChange={(e) => setEditingProject({ ...editingProject, full_description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed project description"
            />
          </div>

          {/* Images Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" /> Images
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProject.thumbnail_image}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnail_image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => openMediaGallery('image', 'thumbnail')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    title="Browse Gallery"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </button>
                </div>
                {editingProject.thumbnail_image && (
                  <img src={editingProject.thumbnail_image} alt="Thumbnail" className="mt-2 h-16 rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProject.featured_image}
                    onChange={(e) => setEditingProject({ ...editingProject, featured_image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => openMediaGallery('image', 'featured')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    title="Browse Gallery"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </button>
                </div>
                {editingProject.featured_image && (
                  <img src={editingProject.featured_image} alt="Featured" className="mt-2 h-16 rounded" />
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add image URL..."
                  onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  title="Add URL"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => openMediaGallery('image', 'gallery')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  title="Browse Gallery"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingProject.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={img.alt_text || 'Project image'}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80')}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" /> Video
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo, or upload)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProject.video_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, video_url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://youtube.com/watch?v=... or upload your own"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaGallery('video', 'video')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    title="Browse Videos"
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                </div>
              </div>
              {editingProject.video_url && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  {editingProject.video_url.includes('youtube.com') || editingProject.video_url.includes('youtu.be') ? (
                    <p className="text-xs text-blue-600">YouTube video linked ✓</p>
                  ) : editingProject.video_url.includes('vimeo.com') ? (
                    <p className="text-xs text-blue-600">Vimeo video linked ✓</p>
                  ) : (
                    <video src={editingProject.video_url} controls className="max-w-full h-32 rounded" />
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingProject({ ...editingProject, video_url: '' })}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove video
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" /> Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" /> Live Website URL
                </label>
                <input
                  type="url"
                  value={editingProject.live_url}
                  onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                <input
                  type="url"
                  value={editingProject.demo_url}
                  onChange={(e) => setEditingProject({ ...editingProject, demo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://demo.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={editingProject.github_url}
                  onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Study URL</label>
                <input
                  type="url"
                  value={editingProject.case_study_url}
                  onChange={(e) => setEditingProject({ ...editingProject, case_study_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tech Stack</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTechItem}
                onChange={(e) => setNewTechItem(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add technology (e.g., React, Node.js)"
                onKeyPress={(e) => e.key === 'Enter' && addTechItem()}
              />
              <button
                type="button"
                onClick={addTechItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editingProject.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechItem(index)}
                    className="hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeatureItem}
                onChange={(e) => setNewFeatureItem(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add feature description"
                onKeyPress={(e) => e.key === 'Enter' && addFeatureItem()}
              />
              <button
                type="button"
                onClick={addFeatureItem}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {editingProject.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="flex-1">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeatureItem(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Visibility Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProject.is_published}
                onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Published (visible on website)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProject.is_featured}
                onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-gray-700">Featured (show prominently)</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onSave(editingProject)}
              disabled={saving || !editingProject.title || !editingProject.client_name}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Project'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Manager</h1>
          <p className="text-gray-600 mt-1">Add and manage projects with images, videos, and links</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setEditingProject({ ...defaultProject });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && editingProject && (
        <ProjectForm
          project={editingProject}
          onSave={saveProject}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
            <p className="text-gray-500 mb-6">Start building your portfolio by adding your first project.</p>
            <button
              onClick={() => {
                setEditingProject({ ...defaultProject });
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Your First Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.project_id}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-4 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {project.thumbnail_image ? (
                    <img
                      src={project.thumbnail_image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                    {project.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      project.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {project.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{project.client_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {projectTypes.find(t => t.value === project.project_type)?.label || project.project_type}
                    </span>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Live
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(project)}
                    title={project.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    className={`p-2 rounded-lg transition ${
                      project.is_featured 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => togglePublished(project)}
                    title={project.is_published ? 'Unpublish' : 'Publish'}
                    className={`p-2 rounded-lg transition ${
                      project.is_published 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {project.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProject({ ...project });
                      setShowAddForm(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => project.project_id && deleteProject(project.project_id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setExpandedProject(
                      expandedProject === project.project_id ? null : project.project_id || null
                    )}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    {expandedProject === project.project_id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedProject === project.project_id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.short_description && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                        <p className="text-gray-700">{project.short_description}</p>
                      </div>
                    )}
                    
                    {project.tech_stack?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.tech_stack.map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.features?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {project.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                          {project.features.length > 3 && (
                            <li className="text-gray-400">+{project.features.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Links */}
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Links</h4>
                      <div className="flex flex-wrap gap-3">
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                            <Globe className="w-4 h-4" /> Live Site
                          </a>
                        )}
                        {project.demo_url && (
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-purple-600 hover:underline">
                            <ExternalLink className="w-4 h-4" /> Demo
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-gray-600 hover:underline">
                            <Link2 className="w-4 h-4" /> GitHub
                          </a>
                        )}
                        {(project as any).video_url && (
                          <a href={(project as any).video_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-red-600 hover:underline">
                            <Video className="w-4 h-4" /> Video
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Gallery Preview */}
                    {project.images?.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Gallery ({project.images.length} images)</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {project.images.map((img, i) => (
                            <img
                              key={i}
                              src={img.url}
                              alt={img.alt_text || `Image ${i + 1}`}
                              className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Media Gallery Modal */}
      {showMediaGallery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {mediaGalleryType === 'video' ? 'Select or Upload Video' : 'Select or Upload Image'}
              </h3>
              <button
                onClick={() => setShowMediaGallery(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Upload Section */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Upload a new {mediaGalleryType}:</p>
              <div className="flex gap-3">
                <input
                  ref={mediaGalleryType === 'video' ? videoInputRef : fileInputRef}
                  type="file"
                  accept={mediaGalleryType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => handleFileUpload(e, mediaGalleryType)}
                  className="hidden"
                  id="media-upload-input"
                />
                <label
                  htmlFor="media-upload-input"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${
                    uploadingFile 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Choose {mediaGalleryType === 'video' ? 'Video' : 'Image'}
                    </>
                  )}
                </label>
                <span className="text-xs text-gray-500 self-center">
                  {mediaGalleryType === 'video' 
                    ? 'MP4, WebM, MOV (max 50MB)' 
                    : 'JPG, PNG, GIF, WebP (max 10MB)'}
                </span>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
              {loadingGallery ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : galleryFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No {mediaGalleryType}s in gallery yet</p>
                  <p className="text-sm">Upload one above to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {galleryFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => selectMediaFile(file.url)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition group"
                    >
                      {mediaGalleryType === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Video className="w-8 h-8 text-white/70" />
                          <span className="absolute bottom-1 left-1 right-1 text-xs text-white truncate bg-black/50 px-1 rounded">
                            {file.filename || 'Video'}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={file.url}
                          alt={file.filename || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                        />
                      )}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition flex items-center justify-center">
                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'image')}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileUpload(e, 'video')}
        className="hidden"
      />

      {/* Stats Summary */}
      {projects.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Portfolio Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <div className="text-sm text-gray-500">Total Projects</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.is_published).length}
              </div>
              <div className="text-sm text-gray-500">Published</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {projects.filter(p => p.is_featured).length}
              </div>
              <div className="text-sm text-gray-500">Featured</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-400">
                {projects.filter(p => !p.is_published).length}
              </div>
              <div className="text-sm text-gray-500">Drafts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
