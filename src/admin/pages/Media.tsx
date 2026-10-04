import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';

export default function Media() {
  const [activeTab, setActiveTab] = useState<'projects' | 'testimonials' | 'general'>('projects');

  const tabs = [
    { id: 'projects', label: 'Project Images & Videos', icon: '🎯' },
    { id: 'testimonials', label: 'Testimonial Images', icon: '⭐' },
    { id: 'general', label: 'General Media', icon: '📁' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-1">Manage images and videos for your website</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-1">📸 Project Images</h3>
              <p className="text-sm text-blue-700">Upload showcase images for your projects</p>
            </div>
            <FileUpload category="projects" fileType="image" />

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-1">🎬 Project Videos</h3>
              <p className="text-sm text-purple-700">Upload demo videos or case study videos</p>
            </div>
            <FileUpload category="projects" fileType="video" />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-1">👤 Client Profile Images</h3>
              <p className="text-sm text-amber-700">Upload profile images for client testimonials</p>
            </div>
            <FileUpload category="testimonials" fileType="image" />
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-1">🖼️ General Images</h3>
              <p className="text-sm text-green-700">Upload miscellaneous images for your website</p>
            </div>
            <FileUpload category="general" fileType="image" />

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-green-900 mb-1">📹 General Videos</h3>
              <p className="text-sm text-green-700">Upload miscellaneous videos for your website</p>
            </div>
            <FileUpload category="general" fileType="video" />
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Usage Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ <strong>Images:</strong> JPG, PNG, GIF, WebP (Max 10MB)</li>
          <li>✓ <strong>Videos:</strong> MP4, WebM, MOV, AVI (Max 50MB)</li>
          <li>✓ Click the URL to copy it for use in projects or testimonials</li>
          <li>✓ Uploaded files are organized by category for easy management</li>
          <li>✓ All uploads are securely stored and tracked</li>
        </ul>
      </div>

      {/* Quick Reference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-3">🔗 API Reference</h3>
        <div className="bg-gray-50 rounded p-4 text-xs font-mono text-gray-700 overflow-x-auto">
          <div className="mb-2">Upload: POST /backend/api/upload.php?action=upload&type=image&category=projects</div>
          <div className="mb-2">List: GET /backend/api/upload.php?action=list&type=image&category=projects</div>
          <div>Delete: DELETE /backend/api/upload.php?action=delete&filename=NAME</div>
        </div>
      </div>
    </div>
  );
}
