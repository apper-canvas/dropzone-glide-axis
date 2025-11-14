import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  className,
  title = "Something went wrong",
  message = "We encountered an error while processing your request. Please try again.",
  onRetry,
  showRetry = true
}) => {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4",
      className
    )}>
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <ApperIcon name="AlertTriangle" className="w-10 h-10 text-red-600" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-red-200 rounded-full animate-ping opacity-30"></div>
        </div>
        
        {/* Error Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              icon="RefreshCw"
              variant="primary"
              size="lg"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
            icon="RotateCcw"
          >
            Refresh Page
          </Button>
        </div>
        
        {/* Additional Help */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If the problem persists, try refreshing the page or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;