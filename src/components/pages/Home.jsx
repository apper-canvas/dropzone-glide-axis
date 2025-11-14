import React, { useEffect, useState } from "react";
import { uploadService } from "@/services/api/uploadService";
import { toast } from "react-toastify";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import DropZone from "@/components/organisms/DropZone";
import UploadQueue from "@/components/organisms/UploadQueue";

export default function Home() {
  const [currentSession, setCurrentSession] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load last session on mount
  useEffect(() => {
    const loadLastSession = async () => {
      try {
        const sessions = await uploadService.getAllSessions();
        if (sessions && sessions.length > 0) {
          setCurrentSession(sessions[0]);
        }
      } catch (err) {
        console.info("Failed to load previous sessions");
      }
    };
    loadLastSession();
  }, []);
  
  // File upload handlers
  // File upload handlers
  const handleFilesSelected = async (files) => {
    try {
      setError(null);
      setLoading(true);
      
      // Create new session or use existing one
      let session = currentSession;
      if (!session) {
        session = await uploadService.createUploadSession(files);
        setCurrentSession(session);
      } else {
        // Add files to existing session
        const newFiles = files.map(file => ({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: "pending",
          url: null,
          thumbnail: null,
          uploadSpeed: 0,
          errorMessage: null,
          timestamp: Date.now()
        }));
        
        session.files = [...session.files, ...newFiles];
        session.totalFiles += files.length;
        session.totalSize += files.reduce((total, file) => total + file.size, 0);
        setCurrentSession({ ...session });
      }
      
      // Start uploading files
      files.forEach(async (file, index) => {
        const fileRecord = session.files.find(f => f.name === file.name && f.status === "pending");
        if (fileRecord && !uploadingFiles.has(fileRecord.id)) {
          setUploadingFiles(prev => new Set(prev).add(fileRecord.id));
          await uploadFile(session.Id, fileRecord.id, file);
        }
      });
      
    } catch (err) {
      setError("Failed to create upload session");
      toast.error("Failed to start upload");
    } finally {
      setLoading(false);
    }
  };
  
  const uploadFile = async (sessionId, fileId, file) => {
    try {
      await uploadService.uploadFile(sessionId, fileId, file, (updatedFile, updatedSession) => {
        setCurrentSession(updatedSession);
      });
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };
  
  const handleRetryFile = async (fileId) => {
    if (!currentSession) return;
    
    const fileRecord = currentSession.files.find(f => f.id === fileId);
    if (!fileRecord || uploadingFiles.has(fileId)) return;
    
    setUploadingFiles(prev => new Set(prev).add(fileId));
    
    try {
      // Create a mock file object for retry
      const mockFile = {
        name: fileRecord.name,
        size: fileRecord.size,
        type: fileRecord.type
      };
      
      await uploadService.retryUpload(currentSession.Id, fileId, mockFile, (updatedFile, updatedSession) => {
        setCurrentSession(updatedSession);
      });
      
      toast.success(`Retry successful for ${fileRecord.name}`);
    } catch (err) {
      toast.error(`Retry failed for ${fileRecord.name}`);
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };
  
  const handleCancelFile = async (fileId) => {
    if (!currentSession) return;
    
    try {
      const updatedSession = await uploadService.cancelUpload(currentSession.Id, fileId);
      setCurrentSession(updatedSession);
      
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      
      toast.info("Upload cancelled");
    } catch (err) {
      toast.error("Failed to cancel upload");
    }
  };
  
  const handleCopyUrl = async (url) => {
    await uploadService.copyFileUrl(url);
  };
  
  const handleRetry = () => {
    setError(null);
    setLoading(false);
  };
  
  if (loading && !currentSession) {
    return <Loading text="Preparing upload session..." />;
  }
  
  if (error && !currentSession) {
    return (
      <ErrorView
        title="Upload Error"
        message={error}
        onRetry={handleRetry}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
              DropZone
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload and manage files quickly with instant visual feedback and real-time progress tracking.
          </p>
        </div>
        
        {/* Drop Zone */}
        <div className="mb-12">
          <DropZone
            onFilesSelected={handleFilesSelected}
            maxFileSize={100}
            maxFiles={20}
            disabled={loading}
          />
        </div>
        
        {/* Upload Queue */}
        {currentSession && (
          <div className="mb-8">
            <UploadQueue
              session={currentSession}
              onRetryFile={handleRetryFile}
              onCancelFile={handleCancelFile}
              onCopyUrl={handleCopyUrl}
            />
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>Secure uploads with SSL encryption</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Real-time progress tracking</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
              <span>Multiple file format support</span>
            </div>
          </div>
</div>
      </div>
    </div>
  );
}