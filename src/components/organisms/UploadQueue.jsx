import React from "react";
import { cn } from "@/utils/cn";
import FileUploadCard from "@/components/organisms/FileUploadCard";
import UploadStats from "@/components/molecules/UploadStats";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";

const UploadQueue = ({
  session,
  onRetryFile,
  onCancelFile,
  onCopyUrl,
  className
}) => {
  if (!session || !session.files || session.files.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Empty
          title="No files in queue"
          message="Files you upload will appear here with real-time progress tracking."
          icon="FolderOpen"
          showAction={false}
        />
      </div>
    );
  }
  
  const { files } = session;
  const pendingFiles = files.filter(f => f.status === "pending");
  const uploadingFiles = files.filter(f => f.status === "uploading");
  const completedFiles = files.filter(f => f.status === "success");
  const failedFiles = files.filter(f => f.status === "error");
  
  return (
    <div className={cn("space-y-8", className)}>
      {/* Upload Stats */}
      <UploadStats session={session} />
      
      {/* Queue Sections */}
      <div className="space-y-8">
        {/* Currently Uploading */}
        {uploadingFiles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <ApperIcon name="Upload" className="w-3 h-3 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Uploading ({uploadingFiles.length})
              </h3>
              <div className="h-px bg-gradient-to-r from-primary-200 to-transparent flex-1" />
            </div>
            
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <FileUploadCard
                  key={file.id}
                  file={file}
                  onRetry={onRetryFile}
                  onCancel={onCancelFile}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Pending Files */}
        {pendingFiles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ApperIcon name="Clock" className="w-3 h-3 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Waiting ({pendingFiles.length})
              </h3>
              <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1" />
            </div>
            
            <div className="space-y-3">
              {pendingFiles.map((file) => (
                <FileUploadCard
                  key={file.id}
                  file={file}
                  onRetry={onRetryFile}
                  onCancel={onCancelFile}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Failed Files */}
        {failedFiles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <ApperIcon name="XCircle" className="w-3 h-3 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Failed ({failedFiles.length})
              </h3>
              <div className="h-px bg-gradient-to-r from-red-200 to-transparent flex-1" />
            </div>
            
            <div className="space-y-3">
              {failedFiles.map((file) => (
                <FileUploadCard
                  key={file.id}
                  file={file}
                  onRetry={onRetryFile}
                  onCancel={onCancelFile}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Completed Files */}
        {completedFiles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                <ApperIcon name="CheckCircle" className="w-3 h-3 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Completed ({completedFiles.length})
              </h3>
              <div className="h-px bg-gradient-to-r from-success-200 to-transparent flex-1" />
            </div>
            
            <div className="space-y-3">
              {completedFiles.map((file) => (
                <FileUploadCard
                  key={file.id}
                  file={file}
                  onRetry={onRetryFile}
                  onCancel={onCancelFile}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default UploadQueue;