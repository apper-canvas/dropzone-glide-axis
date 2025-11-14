import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { toast } from "react-toastify";
import { validateFileType, validateFileSize } from "@/utils/fileHelpers";

const DropZone = ({ 
  onFilesSelected,
  className,
  acceptedTypes = [],
  maxFileSize = 100,
  maxFiles = 10,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const validateFiles = useCallback((files) => {
    const validFiles = [];
    const errors = [];
    
    Array.from(files).forEach((file) => {
      // Check file type
      if (acceptedTypes.length > 0) {
        const typeValidation = validateFileType(file, acceptedTypes);
        if (!typeValidation.valid) {
          errors.push(`${file.name}: ${typeValidation.error}`);
          return;
        }
      }
      
      // Check file size
      const sizeValidation = validateFileSize(file, maxFileSize);
      if (!sizeValidation.valid) {
        errors.push(`${file.name}: ${sizeValidation.error}`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Check max files limit
    if (validFiles.length > maxFiles) {
      errors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
      return { validFiles: validFiles.slice(0, maxFiles), errors };
    }
    
    return { validFiles, errors };
  }, [acceptedTypes, maxFileSize, maxFiles]);
  
  const handleFiles = useCallback((files) => {
    if (disabled || !files || files.length === 0) return;
    
    const { validFiles, errors } = validateFiles(files);
    
    // Show errors
    errors.forEach(error => {
      toast.error(error);
    });
    
    // Process valid files
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast.success(`${validFiles.length} file(s) added for upload`);
    }
  }, [disabled, validateFiles, onFilesSelected]);
  
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    setIsDragOver(true);
    setIsDragging(true);
  }, [disabled]);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setIsDragging(false);
    }
  }, [disabled]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    setIsDragOver(true);
  }, [disabled]);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);
  
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);
  
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFiles(files);
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleFiles]);
  
  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer group",
        "bg-gradient-to-br from-slate-50 to-blue-50",
        isDragOver 
          ? "border-primary-500 bg-primary-50 shadow-drop-zone scale-[1.02]" 
          : "border-gray-300 hover:border-primary-400 hover:bg-blue-25",
        disabled && "opacity-50 cursor-not-allowed",
        !isDragOver && !disabled && "hover:shadow-card-hover",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl" />
      </div>
      
      {/* Content */}
      <div className="relative px-8 py-16 text-center">
        {/* Upload Icon */}
        <div className="mb-6">
          <div className={cn(
            "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
            isDragOver 
              ? "bg-primary-500 text-white scale-110 shadow-xl" 
              : "bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 group-hover:scale-105"
          )}>
            <ApperIcon 
              name={isDragOver ? "Download" : "Upload"} 
              className={cn(
                "transition-all duration-300",
                isDragOver ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          </div>
          
          {/* Pulse effect when dragging */}
          {isDragging && (
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-primary-500 animate-ping opacity-20" />
          )}
        </div>
        
        {/* Text Content */}
        <div className="space-y-3">
          <h3 className={cn(
            "text-xl font-bold transition-colors duration-200",
            isDragOver 
              ? "text-primary-900" 
              : "bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent"
          )}>
            {isDragOver ? "Drop files here" : "Upload your files"}
          </h3>
          
          <p className={cn(
            "text-gray-600 transition-colors duration-200",
            isDragOver && "text-primary-700"
          )}>
            {isDragOver 
              ? "Release to start uploading" 
              : "Drag and drop files here, or click to browse"
            }
          </p>
          
          {/* File Info */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              {acceptedTypes.length > 0 ? (
                <span>Accepted: {acceptedTypes.join(", ")}</span>
              ) : (
                <span>All file types accepted</span>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>Max size: {maxFileSize}MB</span>
              <span>Max files: {maxFiles}</span>
            </div>
          </div>
        </div>
        
        {/* Browse Button */}
        {!isDragOver && (
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              icon="FolderOpen"
              disabled={disabled}
              className="shadow-lg hover:shadow-xl"
            >
              Browse Files
            </Button>
          </div>
        )}
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
      </div>
      
      {/* Upload Animation */}
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full rounded-2xl border-2 border-primary-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default DropZone;