import React from "react";
import { cn } from "@/utils/cn";

const Loading = ({ className, text = "Loading...", variant = "default" }) => {
  if (variant === "skeleton") {
    return (
      <div className={cn("animate-pulse space-y-6", className)}>
        {/* Drop Zone Skeleton */}
        <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
        
        {/* File Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50",
      className
    )}>
      <div className="text-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center animate-pulse-soft">
            <svg className="w-8 h-8 text-white animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl animate-ping opacity-20"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            DropZone
          </h2>
          <p className="text-gray-600 font-medium">{text}</p>
        </div>
        
        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;