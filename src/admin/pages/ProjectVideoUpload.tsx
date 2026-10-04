import { useState, useEffect, useCallback } from 'react';
import { Upload, Play, Trash2, X, AlertCircle, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';

interface ProjectVideo {
  id: number;
  project_id: number;
  video_url: string;
  video_title: string;
  video_description: string;
  video_type: 'demo' | 'tutorial' | 'testimonial' | 'walkthrough' | 'overview';
  is_primary: boolean;
  display_order: number;
  thumbnail_url?: string;
}

interface Project {
  id: number;
  title: string;
  client_name: string;
  project_type: string;
  cover_image?: string;
  featured_image?: string;
}

export function ProjectVideoUpload() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [uploadingVideo, setUploadingVideo] = useState<File | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState<File | null>(null);
  const [uploadingProjectImage, setUploadingProjectImage] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoType, setVideoType] = useState<ProjectVideo['video_type']>('demo');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New project form state
  const [createNewProject, setCreateNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState('saas');

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects().catch(err => console.error('Failed to load projects:', err));
  }, []);

  // Fetch videos when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchVideos(selectedProject).catch(err => console.error('Failed to load videos:', err));
    }
  }, [selectedProject]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects?published=1');
      const data = await response.json();
      if (data.success && data.data) {
        setProjects(data.data);
      } else {
        // Use mock projects plus any custom projects from localStorage
        const customProjects = localStorage.getItem('all-projects');
        const stored = customProjects ? JSON.parse(customProjects) : [];
        setProjects([...getMockProjects(), ...stored]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Fall back to mock projects plus any custom projects from localStorage
      const customProjects = localStorage.getItem('all-projects');
      const stored = customProjects ? JSON.parse(customProjects) : [];
      setProjects([...getMockProjects(), ...stored]);
      setLoading(false);
    }
  }, []);

  const getMockProjects = () => [
    { id: 1, title: 'InvoiceFlow Pro', client_name: 'InvoiceFlow', project_type: 'saas' },
    { id: 2, title: 'Luxe Real Estate', client_name: 'Luxe RE', project_type: 'website' },
    { id: 3, title: 'LeadGen AI', client_name: 'LeadGen', project_type: 'automation' },
    { id: 4, title: 'DocuMind', client_name: 'DocuMind', project_type: 'ai_tool' },
  ];

  const fetchVideos = useCallback(async (projectId: number) => {
    try {
      const response = await fetch(`/api/project-videos?project_id=${projectId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setVideos(data.data);
      } else {
        // Check localStorage for development data
        const stored = localStorage.getItem(`project-videos-${projectId}`);
        setVideos(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      // Check localStorage for development data
      const stored = localStorage.getItem(`project-videos-${projectId}`);
      setVideos(stored ? JSON.parse(stored) : []);
    }
  }, []);

  const handleVideoUpload = async () => {
    if (!uploadingVideo || !videoTitle) {
      setMessage({ type: 'error', text: 'Please select a video file and add a title' });
      return;
    }
    
    let projectId = selectedProject;
    
    // If creating new project, create it first
    if (createNewProject) {
      if (!newProjectName || !newProjectClient) {
        setMessage({ type: 'error', text: 'Please fill in project name and client name' });
        return;
      }
      
      const maxId = Math.max(0, ...projects.map(p => p.id));
      projectId = maxId + 1;
      
      const newProject: Project = {
        id: projectId,
        title: newProjectName,
        client_name: newProjectClient,
        project_type: newProjectType
      };
      
      // Store in localStorage
      const stored = localStorage.getItem('all-projects');
      const allProjects = stored ? JSON.parse(stored) : [];
      allProjects.push(newProject);
      localStorage.setItem('all-projects', JSON.stringify(allProjects));
      
      setProjects([...projects, newProject]);
      setSelectedProject(projectId);
    } else if (!projectId) {
      setMessage({ type: 'error', text: 'Please select a project or create a new one' });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', uploadingVideo);
      formData.append('project_id', projectId!.toString());
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('type', videoType);
      formData.append('is_primary', isPrimary ? '1' : '0');
      formData.append('action', 'upload');
      
      // Add thumbnail if provided
      if (uploadingThumbnail) {
        formData.append('thumbnail', uploadingThumbnail);
      }

      const response = await fetch('/api/project-videos', {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          video_url: uploadingVideo ? URL.createObjectURL(uploadingVideo) : '',
          video_title: videoTitle,
          video_description: videoDescription,
          video_type: videoType,
          is_primary: isPrimary,
          thumbnail_url: uploadingThumbnail ? URL.createObjectURL(uploadingThumbnail) : '',
          display_order: videos.length
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Video uploaded successfully!' });
        setUploadingVideo(null);
        setUploadingThumbnail(null);
        setVideoTitle('');
        setVideoDescription('');
        setVideoType('demo');
        setIsPrimary(false);
        setCreateNewProject(false);
        setNewProjectName('');
        setNewProjectClient('');
        setNewProjectType('saas');
        fetchVideos(projectId!).catch(err => console.error('Failed to refresh videos:', err));
        setIsUploading(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please check your server connection and try again.' });
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Delete this video?')) return;

    try {
      const response = await fetch('/api/project-videos', {
        method: 'DELETE',
        body: JSON.stringify({ id: videoId }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Video deleted successfully' });
        if (selectedProject) {
          fetchVideos(selectedProject).catch(err => console.error('Failed to refresh videos:', err));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Delete failed. Please check your server connection.' });
    }
  };

  const handleUploadProjectImage = async () => {
    if (!uploadingProjectImage || !selectedProject) {
      setMessage({ type: 'error', text: 'Please select a project and an image' });
      return;
    }

    setIsUploadingProjectImage(true);

    try {
      const formData = new FormData();
      formData.append('image', uploadingProjectImage);
      formData.append('project_id', selectedProject.toString());
      formData.append('type', 'cover'); // Could be 'cover' or 'featured'
      formData.append('action', 'upload-image');

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Project image uploaded successfully!' });
        setUploadingProjectImage(null);
        fetchProjects().catch(err => console.error('Failed to refresh projects:', err));
        setIsUploadingProjectImage(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
        setIsUploadingProjectImage(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed: ' + error });
      setIsUploadingProjectImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
          <Video className="w-7 h-7 text-cyan-400" />
          Video Portfolio Manager
        </h1>
        <p className="text-white/50 mt-1">Upload and manage project showcase videos</p>
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
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Upload Video</h2>

            {/* Project Mode Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white mb-2">Project *</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreateNewProject(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !createNewProject
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
                  }`}
                >
                  Existing
                </button>
                <button
                  onClick={() => setCreateNewProject(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    createNewProject
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
                  }`}
                >
                  New Project
                </button>
              </div>
            </div>

            {/* Existing Project Selection */}
            {!createNewProject && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Select Project</label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#15151f]">
                      {p.title} - {p.project_type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* New Project Form */}
            {createNewProject && (
              <div className="space-y-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., My New SaaS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., Client Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                  <select
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="saas" className="bg-[#15151f]">SaaS</option>
                    <option value="website" className="bg-[#15151f]">Website</option>
                    <option value="automation" className="bg-[#15151f]">Automation</option>
                    <option value="ai_tool" className="bg-[#15151f]">AI Tool</option>
                  </select>
                </div>
              </div>
            )}

            {/* Video File */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Video File *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  onChange={(e) => setUploadingVideo(e.target.files?.[0] || null)}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="block w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-colors text-center"
                >
                  <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-white">{uploadingVideo?.name || 'Click to upload'}</p>
                  <p className="text-xs text-white/40">MP4, WebM, MOV, AVI (Max 500MB)</p>
                </label>
              </div>
            </div>

            {/* Video Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Thumbnail (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setUploadingThumbnail(e.target.files?.[0] || null)}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="block w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-colors text-center"
                >
                  <ImageIcon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-white">{uploadingThumbnail?.name || 'Click to upload'}</p>
                  <p className="text-xs text-white/40">JPG, PNG, WebP, GIF (Max 10MB)</p>
                </label>
              </div>
            </div>

            {/* Video Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Video Title *</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g., Product Demo"
              />
            </div>

            {/* Video Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                placeholder="Describe this video..."
              />
            </div>

            {/* Video Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Video Type</label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="demo" className="bg-[#15151f]">Demo/Walkthrough</option>
                <option value="tutorial" className="bg-[#15151f]">Tutorial</option>
                <option value="testimonial" className="bg-[#15151f]">Testimonial</option>
                <option value="overview" className="bg-[#15151f]">Overview</option>
              </select>
            </div>

            {/* Primary Video */}
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="is-primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is-primary" className="text-sm text-white cursor-pointer flex-1">
                Set as primary video (shows in portfolio)
              </label>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleVideoUpload}
              disabled={isUploading || !uploadingVideo || (!createNewProject && !selectedProject) || (createNewProject && (!newProjectName || !newProjectClient))}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </div>

        {/* Videos List */}
        <div className="lg:col-span-2">
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Project Videos
              {selectedProject && ` (${videos.length})`}
            </h2>

            {!selectedProject ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">Select a project to view its videos</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">No videos uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Thumbnail Preview */}
                      {video.thumbnail_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail_url}
                            alt={video.video_title}
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">{video.video_title}</h3>
                          {video.is_primary && (
                            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full whitespace-nowrap">
                              Primary
                            </span>
                          )}
                          <span className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-full capitalize">
                            {video.video_type}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 line-clamp-2">{video.video_description}</p>
                        <a 
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Watch video
                        </a>
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Image Management Section */}
      {selectedProject && (
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Project Cover Image
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Upload Cover Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUploadingProjectImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="project-image-upload"
                />
                <label
                  htmlFor="project-image-upload"
                  className="block w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-colors text-center"
                >
                  <ImageIcon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-white">{uploadingProjectImage?.name || 'Click to upload'}</p>
                  <p className="text-xs text-white/40">JPG, PNG, WebP (Max 5MB) - Recommended 1200x800px</p>
                </label>
              </div>
              <button
                onClick={handleUploadProjectImage}
                disabled={isUploadingProjectImage || !uploadingProjectImage || !selectedProject}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
              >
                {isUploadingProjectImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>

            {/* Current Image Preview */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Current Cover Image</label>
              {projects.find(p => p.id === selectedProject)?.featured_image ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden">
                  <img 
                    src={projects.find(p => p.id === selectedProject)?.featured_image}
                    alt="Project cover"
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs text-white/60 text-center">Click upload to replace</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-sm text-white/60">No cover image yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectVideoUpload;
