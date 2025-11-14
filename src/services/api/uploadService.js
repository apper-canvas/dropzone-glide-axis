import { getApperClient } from "@/services/apperClient";
import { generateFileId, generateThumbnail } from "@/utils/fileHelpers";

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
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");
      
      const filesData = files.map(file => ({
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
      }));

      const sessionData = {
        totalFiles_c: files.length,
        completedFiles_c: 0,
        totalSize_c: files.reduce((total, file) => total + file.size, 0),
        uploadedSize_c: 0,
        startTime_c: new Date().toISOString(),
        files_c: JSON.stringify(filesData)
      };

      const response = await apperClient.createRecord("uploadSessions_c", {
        records: [sessionData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const createdSession = response.results?.[0]?.data;
      if (!createdSession) throw new Error("Failed to create session");

      return {
        Id: createdSession.Id,
        totalFiles: sessionData.totalFiles_c,
        completedFiles: sessionData.completedFiles_c,
        totalSize: sessionData.totalSize_c,
        uploadedSize: sessionData.uploadedSize_c,
        startTime: sessionData.startTime_c,
        files: filesData
      };
    } catch (error) {
      console.error("Error creating upload session:", error?.response?.data?.message || error);
      throw error;
    }
  },
  
  // Upload individual file
  uploadFile: async (sessionId, fileId, file, onProgress) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      // Fetch current session
      const sessionResponse = await apperClient.getRecordById("uploadSessions_c", sessionId, {
        fields: [
          { field: { Name: "totalFiles_c" } },
          { field: { Name: "completedFiles_c" } },
          { field: { Name: "totalSize_c" } },
          { field: { Name: "uploadedSize_c" } },
          { field: { Name: "files_c" } }
        ]
      });

      if (!sessionResponse.data) throw new Error("Session not found");

      const session = sessionResponse.data;
      let filesData = JSON.parse(session.files_c || "[]");
      const fileRecord = filesData.find(f => f.id === fileId);
      
      if (!fileRecord) throw new Error("File not found");

      // Update status to uploading
      fileRecord.status = "uploading";

      // Generate thumbnail if image
      const thumbnail = await generateThumbnail(file);
      fileRecord.thumbnail = thumbnail;
      
      // Simulate upload
      const result = await simulateUpload(file, ({ progress, speed, uploadedBytes }) => {
        fileRecord.uploadProgress = progress;
        fileRecord.uploadSpeed = speed;
        
        // Update session totals
        const totalUploaded = filesData.reduce((total, f) => {
          return total + (f.size * (f.uploadProgress / 100));
        }, 0);
        const uploadedSize = Math.round(totalUploaded);
        
        onProgress({ ...fileRecord }, {
          Id: sessionId,
          totalFiles: session.totalFiles_c,
          completedFiles: session.completedFiles_c,
          totalSize: session.totalSize_c,
          uploadedSize: uploadedSize,
          startTime: session.startTime_c,
          files: filesData
        });
      });
      
      // Mark as complete
      fileRecord.status = "success";
      fileRecord.url = result.url;
      fileRecord.uploadSpeed = 0;
      const completedCount = filesData.filter(f => f.status === "success").length;

      // Update database
      const totalUploaded = filesData.reduce((total, f) => {
        return total + (f.size * (f.uploadProgress / 100));
      }, 0);

      const updateResponse = await apperClient.updateRecord("uploadSessions_c", {
        records: [{
          Id: sessionId,
          completedFiles_c: completedCount,
          uploadedSize_c: Math.round(totalUploaded),
          files_c: JSON.stringify(filesData)
        }]
      });

      if (!updateResponse.success) {
        console.error(updateResponse.message);
      }

      return fileRecord;
    } catch (error) {
      console.error("Error uploading file:", error?.response?.data?.message || error);
      throw error;
    }
  },
  
  // Retry failed upload
  retryUpload: async (sessionId, fileId, file, onProgress) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      // Fetch current session
      const sessionResponse = await apperClient.getRecordById("uploadSessions_c", sessionId, {
        fields: [{ field: { Name: "files_c" } }]
      });

      if (!sessionResponse.data) throw new Error("Session not found");

      let filesData = JSON.parse(sessionResponse.data.files_c || "[]");
      const fileRecord = filesData.find(f => f.id === fileId);
      
      if (!fileRecord) throw new Error("File not found");

      // Reset file state
      fileRecord.uploadProgress = 0;
      fileRecord.status = "pending";
      fileRecord.errorMessage = null;
      fileRecord.uploadSpeed = 0;

      return this.uploadFile(sessionId, fileId, file, onProgress);
    } catch (error) {
      console.error("Error retrying upload:", error?.response?.data?.message || error);
      throw error;
    }
  },
  
  // Cancel upload
  cancelUpload: async (sessionId, fileId) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      // Fetch current session
      const sessionResponse = await apperClient.getRecordById("uploadSessions_c", sessionId, {
        fields: [
          { field: { Name: "totalFiles_c" } },
          { field: { Name: "completedFiles_c" } },
          { field: { Name: "totalSize_c" } },
          { field: { Name: "uploadedSize_c" } },
          { field: { Name: "files_c" } }
        ]
      });

      if (!sessionResponse.data) throw new Error("Session not found");

      const session = sessionResponse.data;
      let filesData = JSON.parse(session.files_c || "[]");
      const fileIndex = filesData.findIndex(f => f.id === fileId);
      
      if (fileIndex === -1) throw new Error("File not found");

      // Remove file from session
      filesData.splice(fileIndex, 1);
      const totalSize = filesData.reduce((total, f) => total + f.size, 0);
      const completedCount = filesData.filter(f => f.status === "success").length;
      const totalUploaded = filesData.reduce((total, f) => {
        return total + (f.size * (f.uploadProgress / 100));
      }, 0);

      // Update database
      const updateResponse = await apperClient.updateRecord("uploadSessions_c", {
        records: [{
          Id: sessionId,
          totalFiles_c: filesData.length,
          totalSize_c: totalSize,
          completedFiles_c: completedCount,
          uploadedSize_c: Math.round(totalUploaded),
          files_c: JSON.stringify(filesData)
        }]
      });

      if (!updateResponse.success) {
        console.error(updateResponse.message);
      }

      return {
        Id: sessionId,
        totalFiles: filesData.length,
        completedFiles: completedCount,
        totalSize: totalSize,
        uploadedSize: Math.round(totalUploaded),
        startTime: session.startTime_c,
        files: filesData
      };
    } catch (error) {
      console.error("Error cancelling upload:", error?.response?.data?.message || error);
      throw error;
    }
  },
  
  // Get all upload sessions
  getAllSessions: async () => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords("uploadSessions_c", {
        fields: [
          { field: { Name: "totalFiles_c" } },
          { field: { Name: "completedFiles_c" } },
          { field: { Name: "totalSize_c" } },
          { field: { Name: "uploadedSize_c" } },
          { field: { Name: "startTime_c" } },
          { field: { Name: "files_c" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(session => ({
        Id: session.Id,
        totalFiles: session.totalFiles_c,
        completedFiles: session.completedFiles_c,
        totalSize: session.totalSize_c,
        uploadedSize: session.uploadedSize_c,
        startTime: session.startTime_c,
        files: JSON.parse(session.files_c || "[]")
      }));
    } catch (error) {
      console.error("Error fetching sessions:", error?.response?.data?.message || error);
      return [];
    }
  },
  
  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById("uploadSessions_c", sessionId, {
        fields: [
          { field: { Name: "totalFiles_c" } },
          { field: { Name: "completedFiles_c" } },
          { field: { Name: "totalSize_c" } },
          { field: { Name: "uploadedSize_c" } },
          { field: { Name: "startTime_c" } },
          { field: { Name: "files_c" } }
        ]
      });

      if (!response.data) return null;

      const session = response.data;
      return {
        Id: session.Id,
        totalFiles: session.totalFiles_c,
        completedFiles: session.completedFiles_c,
        totalSize: session.totalSize_c,
        uploadedSize: session.uploadedSize_c,
        startTime: session.startTime_c,
        files: JSON.parse(session.files_c || "[]")
      };
    } catch (error) {
      console.error("Error fetching session:", error?.response?.data?.message || error);
      return null;
    }
  },
  
  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.deleteRecord("uploadSessions_c", {
        RecordIds: [sessionId]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting session:", error?.response?.data?.message || error);
      throw error;
    }
  },
  
  // Copy file URL to clipboard
  copyFileUrl: async (url) => {
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