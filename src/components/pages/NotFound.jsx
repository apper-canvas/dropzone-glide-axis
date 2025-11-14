import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* 404 Visual */}
        <div className="relative">
          {/* Large 404 */}
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-primary-200 to-secondary-200 bg-clip-text select-none">
            404
          </div>
          
          {/* Floating Icons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center animate-bounce">
                <ApperIcon name="FileX" className="w-10 h-10 text-red-600" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-red-200 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </div>
        
        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="primary"
            size="lg"
            icon="Home"
          >
            Go Home
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            icon="ArrowLeft"
          >
            Go Back
          </Button>
        </div>
        
        {/* Help Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Lightbulb" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-left">
                <p className="text-sm font-medium text-blue-900">Looking for file upload?</p>
                <p className="text-sm text-blue-700">
                  Head to the home page to start uploading and managing your files with real-time progress tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;