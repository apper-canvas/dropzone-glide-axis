import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  className,
  title = "No files uploaded yet",
  message = "Drag and drop files here or click to browse and upload your first file.",
  icon = "Upload",
  onAction,
  actionLabel = "Browse Files",
  showAction = true
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      {/* Empty State Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <ApperIcon name={icon} className="w-12 h-12 text-gray-400" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse opacity-20"></div>
      </div>
      
      {/* Empty State Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-gray-500 leading-relaxed">
          {message}
        </p>
      </div>
      
      {/* Call to Action */}
      {showAction && onAction && (
        <div className="mt-8">
          <Button
            onClick={onAction}
            icon={icon}
            variant="primary"
            size="lg"
          >
            {actionLabel}
          </Button>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 max-w-lg">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Lightbulb" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-left">
            <p className="text-sm font-medium text-blue-900">Pro Tips:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Drag multiple files at once for batch upload</li>
              <li>• Supported formats: images, documents, videos & more</li>
              <li>• Maximum file size: 100MB per file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empty;