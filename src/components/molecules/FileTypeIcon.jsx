import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { getFileIcon, getFileExtension } from "@/utils/fileHelpers";

const FileTypeIcon = ({ 
  filename, 
  className,
  size = 24,
  showBackground = true,
  ...props 
}) => {
  const extension = getFileExtension(filename);
  const iconName = getFileIcon(filename);
  
  const iconColorClass = `file-icon-${extension}`;
  
  if (showBackground) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center rounded-lg bg-gray-100",
          "w-12 h-12",
          className
        )}
        {...props}
      >
        <ApperIcon 
          name={iconName} 
          size={size}
          className={cn("flex-shrink-0", iconColorClass)}
        />
      </div>
    );
  }
  
  return (
    <ApperIcon 
      name={iconName} 
      size={size}
      className={cn("flex-shrink-0", iconColorClass, className)}
      {...props}
    />
  );
};

export default FileTypeIcon;