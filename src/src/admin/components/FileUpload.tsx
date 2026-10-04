import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
  original_name: string;
}

interface FileUploadProps {
  category?: string;
  fileType?: 'image' | 'video';
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ 
  category = 'general', 
  fileType = 'image',
  onUploadSuccess,
  onUploadError 
}: FileUploadProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const maxFileSize = fileType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  const maxFileSizeMB = fileType === 'image' ? 10 : 50;
  const acceptedFormats = fileType === 'image' 
    ? 'image/jpeg,image/png,image/gif,image/webp' 
    : 'video/mp4,video/webm,video/quicktime,video/x-msvideo';

  // Load existing files
  useEffect(() => {
    loadFiles();
  }, [category, fileType]);

  const loadFiles = async () => {
    try {
      const response = await fetch(
        `/backend/api/upload.php?action=list&type=${fileType}&category=${category}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load files');
      
      const data = await response.json();
      if (data.success) {
        setFiles(data.data.files || []);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Upload each file
    for (let i = 0; i < selectedFiles.length; i++) {
      await uploadFile(selectedFiles[i]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setError('');
    setSuccess('');

    // Validate file size
    if (file.size > maxFileSize) {
      const error = `File too large. Maximum size: ${maxFileSizeMB}MB`;
      setError(error);
      onUploadError?.(error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `/backend/api/upload.php?action=upload&type=${fileType}&category=${category}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      if (data.success) {
        const newFile = {
          filename: data.data.filename,
          url: data.data.url,
          size: data.data.size,
          type: fileType,
          original_name: file.name
        };
        setFiles([newFile, ...files]);
        setSuccess(`${data.data.message}! Click to copy URL.`);
        setUploadProgress(100);
        onUploadSuccess?.(newFile);

        // Reset progress after 2 seconds
        setTimeout(() => setUploadProgress(0), 2000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
      loadFiles(); // Reload file list
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm('Delete this file?')) return;

    setDeleteLoading(filename);
    try {
      const response = await fetch(
        `/backend/api/upload.php?action=delete&filename=${encodeURIComponent(filename)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Delete failed');

      setFiles(files.filter(f => f.filename !== filename));
      setSuccess('File deleted successfully');
    } catch (err) {
      setError('Failed to delete file');
    } finally {
      setDeleteLoading(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Upload {fileType === 'image' ? 'Images' : 'Videos'} - {category}
        </h3>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            {fileType === 'image' ? (
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-gray-700 font-medium">
              Click to upload {fileType === 'image' ? 'image' : 'video'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Max size: {maxFileSizeMB}MB
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-gray-700">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.filename}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  <p
                    className="text-xs text-blue-600 cursor-pointer hover:underline truncate"
                    onClick={() => copyToClipboard(file.url)}
                    title={file.url}
                  >
                    {file.url}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(file.filename)}
                  disabled={deleteLoading === file.filename}
                  className="ml-2 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50"
                >
                  {deleteLoading === file.filename ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <p className="text-gray-500 text-center py-8">
          No {fileType}s uploaded yet
        </p>
      )}
    </div>
  );
}
