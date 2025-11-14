import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  className,
  variant = "primary",
  size = "md",
  animated = false,
  showLabel = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600", 
    success: "bg-gradient-to-r from-success-500 to-success-600",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    danger: "bg-gradient-to-r from-red-500 to-red-600"
  };
  
  const sizes = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3"
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div 
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-out rounded-full",
            variants[variant],
            sizes[size],
            animated && "progress-gradient"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;