'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Square, ExternalLink } from 'lucide-react';
import { FileNode } from '@/types';

interface LivePreviewProps {
  files: FileNode[];
}

const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3001');
  const [isLoading, setIsLoading] = useState(false);

  // Extract the main page content from the files
  const getMainPageContent = () => {
    const pageFile = files.find(file => file.path === 'src/app/page.tsx');
    if (!pageFile?.content) return null;

    // For demo purposes, we'll show a simplified preview
    // In a real implementation, this would compile and run the actual code
    return pageFile.content;
  };

  const handleRunPreview = () => {
    setIsLoading(true);
    // Simulate starting the preview server
    setTimeout(() => {
      setIsRunning(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleStopPreview = () => {
    setIsRunning(false);
  };

  const handleRefresh = () => {
    // Simulate refreshing the preview
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const renderPreviewContent = () => {
    if (!isRunning) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-4">Preview Not Running</div>
            <button
              onClick={handleRunPreview}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Starting...' : 'Start Preview'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Click to start the live preview server
            </p>
          </div>
        </div>
      );
    }

    // Show a simulated preview of the calendar app
    return (
      <div className="h-full bg-white overflow-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Calendar App Preview</h1>
          
          {/* Simulated Calendar */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-semibold">January 2024</h2>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Meeting</span>
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: 1 }, (_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-gray-50"></div>
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const hasMeetings = [15, 18].includes(day); // Sample meetings on days 15 and 18
                
                return (
                  <div key={day} className="h-24 border border-gray-200 p-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">{day}</div>
                    {hasMeetings && (
                      <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded mb-1">
                        <div className="font-medium">
                          {day === 15 ? 'Team Standup' : 'Project Review'}
                        </div>
                        <div>
                          {day === 15 ? '09:00 - 09:30' : '14:00 - 15:00'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Preview running on {previewUrl}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Preview Header */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
          <div className="flex items-center space-x-2">
            {isRunning && (
              <>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-md disabled:opacity-50"
                  title="Refresh preview"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={openInNewTab}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-md"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStopPreview}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  title="Stop preview"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          See live changes as you code
        </p>
      </div>

      {/* Preview Content */}
      <div className="flex-1">
        {renderPreviewContent()}
      </div>
    </div>
  );
};

export default LivePreview;
