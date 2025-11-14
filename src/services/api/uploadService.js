import uploadSessionsData from "@/services/mockData/uploadSessions.json";
import { generateFileId, generateThumbnail } from "@/utils/fileHelpers";

let uploadSessions = [...uploadSessionsData];
let currentSessionId = Math.max(...uploadSessions.map(s => s.Id)) + 1;

// Simulate upload progress for a file
const simulateUpload = async (file, onProgress) => {
  const totalSize = file.size;
  let uploadedSize = 0;
  const chunkSize = Math.max(totalSize / 100, 1024); // At least 1KB chunks
  
  return new Promise((resolve, reject) => {
    const uploadChunk = () => {
      // Simulate network delay
      setTimeout(() => {
        uploadedSize += chunkSize;
        const progress = Math.min((uploadedSize / totalSize) * 100, 100);
        const speed = chunkSize / 0.1; // Simulate speed (bytes per 100ms)
        
        onProgress({
          progress: Math.round(progress),
          speed,
          uploadedBytes: Math.min(uploadedSize, totalSize)
        });
        
        if (progress >= 100) {
          // Generate mock URL
          const url = `https://dropzone-uploads.com/${generateFileId()}/${encodeURIComponent(file.name)}`;
          resolve({ url, success: true });
        } else {
          // Random chance of failure (5%)
          if (Math.random() < 0.05) {
            reject(new Error("Upload failed due to network error"));
          } else {
            uploadChunk();
          }
        }
      }, Math.random() * 200 + 50); // 50-250ms delay
    };
    
    uploadChunk();
  });
};

export const uploadService = {
  // Create new upload session
  createUploadSession: async (files) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const session = {
      Id: currentSessionId++,
      totalFiles: files.length,
      completedFiles: 0,
      totalSize: files.reduce((total, file) => total + file.size, 0),
      uploadedSize: 0,
      startTime: Date.now(),
      files: files.map(file => ({
        id: generateFileId(),
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
      }))
    };
    
    uploadSessions.unshift(session);
    return { ...session };
  },
  
  // Upload individual file
  uploadFile: async (sessionId, fileId, file, onProgress) => {
    const session = uploadSessions.find(s => s.Id === sessionId);
    if (!session) throw new Error("Session not found");
    
    const fileRecord = session.files.find(f => f.id === fileId);
    if (!fileRecord) throw new Error("File not found");
    
    // Update status to uploading
    fileRecord.status = "uploading";
    
    try {
      // Generate thumbnail if image
      const thumbnail = await generateThumbnail(file);
      fileRecord.thumbnail = thumbnail;
      
      // Simulate upload
      const result = await simulateUpload(file, ({ progress, speed, uploadedBytes }) => {
        fileRecord.uploadProgress = progress;
        fileRecord.uploadSpeed = speed;
        
        // Update session totals
        const totalUploaded = session.files.reduce((total, f) => {
          return total + (f.size * (f.uploadProgress / 100));
        }, 0);
        session.uploadedSize = Math.round(totalUploaded);
        
        onProgress(fileRecord, session);
      });
      
      // Mark as complete
      fileRecord.status = "success";
      fileRecord.url = result.url;
      fileRecord.uploadSpeed = 0;
      session.completedFiles = session.files.filter(f => f.status === "success").length;
      
      return fileRecord;
    } catch (error) {
      fileRecord.status = "error";
      fileRecord.errorMessage = error.message;
      fileRecord.uploadSpeed = 0;
      throw error;
    }
  },
  
  // Retry failed upload
  retryUpload: async (sessionId, fileId, file, onProgress) => {
    const session = uploadSessions.find(s => s.Id === sessionId);
    if (!session) throw new Error("Session not found");
    
    const fileRecord = session.files.find(f => f.id === fileId);
    if (!fileRecord) throw new Error("File not found");
    
    // Reset file state
    fileRecord.uploadProgress = 0;
    fileRecord.status = "pending";
    fileRecord.errorMessage = null;
    fileRecord.uploadSpeed = 0;
    
    return this.uploadFile(sessionId, fileId, file, onProgress);
  },
  
  // Cancel upload
  cancelUpload: async (sessionId, fileId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const session = uploadSessions.find(s => s.Id === sessionId);
    if (!session) throw new Error("Session not found");
    
    const fileIndex = session.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) throw new Error("File not found");
    
    // Remove file from session
    session.files.splice(fileIndex, 1);
    session.totalFiles = session.files.length;
    session.totalSize = session.files.reduce((total, f) => total + f.size, 0);
    
    // Recalculate session totals
    session.completedFiles = session.files.filter(f => f.status === "success").length;
    const totalUploaded = session.files.reduce((total, f) => {
      return total + (f.size * (f.uploadProgress / 100));
    }, 0);
    session.uploadedSize = Math.round(totalUploaded);
    
    return session;
  },
  
  // Get all upload sessions
  getAllSessions: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return uploadSessions.map(session => ({ ...session }));
  },
  
  // Get session by ID
  getSessionById: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const session = uploadSessions.find(s => s.Id === sessionId);
    return session ? { ...session } : null;
  },
  
  // Delete session
  deleteSession: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = uploadSessions.findIndex(s => s.Id === sessionId);
    if (index === -1) throw new Error("Session not found");
    
    uploadSessions.splice(index, 1);
    return true;
  },
  
  // Copy file URL to clipboard
  copyFileUrl: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  }
};