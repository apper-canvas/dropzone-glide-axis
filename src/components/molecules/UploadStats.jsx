import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { formatFileSize, formatUploadSpeed } from "@/utils/fileHelpers";

const UploadStats = ({ 
  session,
  className,
  compact = false
}) => {
  if (!session) return null;
  
  const { totalFiles, completedFiles, totalSize, uploadedSize } = session;
  const isComplete = completedFiles === totalFiles;
  const progressPercentage = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
  
  // Calculate overall upload speed
  const activeFiles = session.files.filter(f => f.status === "uploading");
  const totalSpeed = activeFiles.reduce((total, file) => total + (file.uploadSpeed || 0), 0);
  
  if (compact) {
    return (
      <div className={cn("flex items-center space-x-4 text-sm", className)}>
        <div className="flex items-center space-x-2">
          <ApperIcon name="File" className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            {completedFiles}/{totalFiles} files
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ApperIcon name="HardDrive" className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            {formatFileSize(uploadedSize)}/{formatFileSize(totalSize)}
          </span>
        </div>
        
        {totalSpeed > 0 && (
          <div className="flex items-center space-x-2">
            <ApperIcon name="Zap" className="w-4 h-4 text-primary-500" />
            <span className="text-primary-600 font-medium">
              {formatUploadSpeed(totalSpeed)}
            </span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {/* Files Progress */}
      <div className="bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="Files" className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {completedFiles}<span className="text-gray-400">/{totalFiles}</span>
            </p>
            <p className="text-sm text-gray-500">Files</p>
          </div>
        </div>
      </div>
      
      {/* Size Progress */}
      <div className="bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="HardDrive" className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatFileSize(uploadedSize)}
            </p>
            <p className="text-sm text-gray-500">
              of {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Upload Speed */}
      <div className="bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {totalSpeed > 0 ? formatUploadSpeed(totalSpeed) : "0 KB/s"}
            </p>
            <p className="text-sm text-gray-500">Speed</p>
          </div>
        </div>
      </div>
      
      {/* Progress Percentage */}
      <div className="bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isComplete ? "bg-success-100" : "bg-yellow-100"
          )}>
            <ApperIcon 
              name={isComplete ? "CheckCircle" : "Clock"} 
              className={cn(
                "w-5 h-5",
                isComplete ? "text-success-600" : "text-yellow-600"
              )} 
            />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(progressPercentage)}%
            </p>
            <p className="text-sm text-gray-500">
              {isComplete ? "Complete" : "Progress"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStats;