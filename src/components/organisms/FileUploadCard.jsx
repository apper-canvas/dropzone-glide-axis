import React, { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import FileTypeIcon from "@/components/molecules/FileTypeIcon";
import { formatFileSize, formatUploadSpeed, calculateETA } from "@/utils/fileHelpers";
import { toast } from "react-toastify";

const FileUploadCard = ({ 
  file,
  onRetry,
  onCancel,
  onCopyUrl,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "gray";
      case "uploading": return "primary";
      case "success": return "success";
      case "error": return "danger";
      default: return "gray";
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "Clock";
      case "uploading": return "Upload";
      case "success": return "CheckCircle";
      case "error": return "XCircle";
      default: return "File";
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Waiting";
      case "uploading": return "Uploading";
      case "success": return "Complete";
      case "error": return "Failed";
      default: return "Unknown";
    }
  };
  
  const handleCopyUrl = async () => {
    if (file.url && onCopyUrl) {
      try {
        await onCopyUrl(file.url);
        toast.success("File URL copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy URL");
      }
    }
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200",
        "border border-gray-100 overflow-hidden animate-slide-up",
        isHovered && "transform hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* File Header */}
        <div className="flex items-start space-x-4">
          {/* File Icon / Thumbnail */}
          <div className="flex-shrink-0">
            {file.thumbnail ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={file.thumbnail} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <FileTypeIcon filename={file.name} />
            )}
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                  {file.uploadSpeed > 0 && (
                    <span className="ml-2 text-primary-600">
                      • {formatUploadSpeed(file.uploadSpeed)}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Status Badge */}
              <Badge 
                variant={getStatusColor(file.status)}
                className="ml-3 flex-shrink-0"
              >
                <ApperIcon 
                  name={getStatusIcon(file.status)} 
                  className="w-3 h-3 mr-1" 
                />
                {getStatusText(file.status)}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            {(file.status === "uploading" || file.status === "pending") && (
              <div className="mt-3 space-y-2">
                <ProgressBar 
                  value={file.uploadProgress} 
                  max={100}
                  variant={file.status === "uploading" ? "primary" : "gray"}
                  animated={file.status === "uploading"}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{file.uploadProgress}% complete</span>
                  {file.status === "uploading" && file.uploadSpeed > 0 && (
                    <span>
                      {calculateETA(
                        (file.size * file.uploadProgress) / 100,
                        file.size,
                        file.uploadSpeed
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {file.status === "error" && file.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ApperIcon name="AlertTriangle" className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{file.errorMessage}</p>
                </div>
              </div>
            )}
            
            {/* Success Actions */}
            {file.status === "success" && file.url && (
              <div className="mt-3 flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon="Copy"
                  onClick={handleCopyUrl}
                >
                  Copy URL
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="ExternalLink"
                  onClick={() => window.open(file.url, "_blank")}
                >
                  Open
                </Button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            {file.status === "error" && onRetry && (
              <Button
                variant="outline"
                size="sm"
                icon="RotateCcw"
                onClick={() => onRetry(file.id)}
              >
                Retry
              </Button>
            )}
            
            {(file.status === "pending" || file.status === "uploading") && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => onCancel(file.id)}
              >
                Cancel
              </Button>
            )}
            
            {file.status === "success" && (
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <ApperIcon name="Check" className="w-4 h-4 text-success-600" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated Success Border */}
      {file.status === "success" && (
        <div className="h-1 bg-gradient-to-r from-success-500 to-success-400 animate-scale-in" />
      )}
    </div>
  );
};

export default FileUploadCard;