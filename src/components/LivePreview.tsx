'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Square, ExternalLink, X, AlertTriangle } from 'lucide-react';
import { FileNode } from '@/types';



interface LivePreviewProps {
  files: FileNode[];
}

const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compiledCode, setCompiledCode] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastCompileTime = useRef<number>(0);

  // Extract and compile the main components
  const compileAndExecute = async () => {
    if (!files || files.length === 0) {
      setError('No files available for compilation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the component files from the actual files array
      const calendarFile = files.find(file => file.path === 'src/components/Calendar.js');
      const meetingModalFile = files.find(file => file.path === 'src/components/MeetingModal.js');

      if (!calendarFile?.content) {
        throw new Error(`Calendar component not found. Available files: ${files.map(f => f.path).join(', ')}`);
      }

            // Extract and clean the component code from your actual files
      const extractComponentCode = (content: string) => {
        let cleaned = content
          .replace(/'use client';?\s*/g, '') // Remove 'use client' directive
          .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '') // Remove all import statements
          .replace(/export\s+default\s+/g, '') // Remove export default
          .replace(/export\s*{.*?};?\s*/g, '') // Remove named exports
          .replace(/:\s*React\.FC/g, '') // Remove React.FC type annotation
          .replace(/:\s*React\.FC<.*?>/g, '') // Remove React.FC with generics
          .replace(/useState<[^>]*>/g, 'useState') // Remove useState generic types
          .replace(/useState<[^>]*>\(/g, 'useState(') // Remove useState generic types with parentheses
          .trim();

        // Debug: Log the content before and after cleaning
        console.log('Original content:', content.substring(0, 200));
        console.log('Cleaned content:', cleaned.substring(0, 200));
        
        // Ensure the cleaned content is valid JavaScript/JSX
        if (cleaned.includes('{') && cleaned.includes('}')) {
          console.log('JSX detected in cleaned content');
        }
        
        return cleaned;
      };

              const calendarCode = extractComponentCode(calendarFile.content);
        const meetingModalCode = meetingModalFile?.content ? extractComponentCode(meetingModalFile.content) : '';
        
        // Debug: Log the cleaned code to see what we're working with
        console.log('Cleaned Calendar Code:', calendarCode.substring(0, 500));
        console.log('Cleaned MeetingModal Code:', meetingModalCode.substring(0, 500));

              // Create the app code using your actual component code
        const uniqueId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const appCode = `
          // React and ReactDOM are loaded globally from UMD scripts
          const { useState, useEffect } = React;
          const { createRoot } = ReactDOM;
          
          // Mock Meeting type and icons for your components
          const Meeting = {
            id: '',
            title: '',
            date: new Date(),
            startTime: '',
            endTime: '',
            description: '',
            attendees: []
          };

          // Mock icons (simple text replacements)
          const ChevronLeft = () => <span>←</span>;
          const ChevronRight = () => <span>→</span>;
          const Plus = () => <span>+</span>;
          const X = () => <span>×</span>;
          const Trash2 = () => <span>🗑️</span>;
          const UserPlus = () => <span>👤+</span>;

          // Your actual MeetingModal component code
          ${meetingModalCode}

          // Your actual Calendar component code
          ${calendarCode}

          // Main App that uses your components
          const App = () => {
            return (
              <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                  <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar App</h1>
                  <Calendar />
                </div>
              </div>
            );
          };

          // Render the app
          const root = createRoot(document.getElementById('root'));
          root.render(<App />);
        `;

        // Debug: Log the final appCode before Babel transformation
        console.log('Final appCode length:', appCode.length);
        console.log('Final appCode preview:', appCode.substring(0, 1000));

      // Create the HTML document with the compiled code
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendar App Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"></script>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    * { box-sizing: border-box; }
    
    /* Ensure calendar grid displays correctly */
    .grid { display: grid; }
    .grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .gap-0 { gap: 0; }
    
    /* Calendar day styling */
    .h-24 { height: 6rem; }
    .border { border-width: 1px; }
    .border-gray-200 { border-color: rgb(229 231 235); }
    .p-1 { padding: 0.25rem; }
    .overflow-y-auto { overflow-y: auto; }
    
    /* Today's styling */
    .bg-blue-50 { background-color: rgb(239 246 255); }
    .border-blue-300 { border-color: rgb(147 197 253); }
    .text-blue-700 { color: rgb(29 78 216); }
    
    /* Regular day styling */
    .bg-white { background-color: rgb(255 255 255); }
    .text-gray-700 { color: rgb(55 65 81); }
    
    /* Button styling */
    .bg-blue-600 { background-color: rgb(37 99 235); }
    .text-white { color: rgb(255 255 255); }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .hover\\:bg-blue-700:hover { background-color: rgb(29 78 216); }
    
    /* Layout utilities */
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .space-x-4 > * + * { margin-left: 1rem; }
    .p-4 { padding: 1rem; }
    .border-b { border-bottom-width: 1px; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .font-semibold { font-weight: 600; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Transform TypeScript code to JavaScript using Babel
    const ${uniqueId} = Babel.transform(\`${appCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, {
      presets: ['react'],
      filename: 'app.jsx'
    }).code;
    
    try {
      // Execute the transformed code
      eval(${uniqueId});
    } catch (error) {
      console.error('Babel transformation error:', error);
      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Compilation failed. Check console for details.</div>';
    }
  </script>
</body>
</html>`;

      setCompiledCode(htmlContent);
      setIsRunning(true);
      lastCompileTime.current = Date.now();

      // Update the iframe content
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compile code');
      console.error('Compilation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    compileAndExecute();
  };

  const handleStopPreview = () => {
    setIsRunning(false);
    setError(null);
    setCompiledCode('');
  };

  // Auto-compile when files change (with debouncing)
  useEffect(() => {
    if (isRunning && files.length > 0) {
      const timeoutId = setTimeout(() => {
        compileAndExecute();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [files, isRunning]);

  // Initial compilation - only when files are available and not already running
  useEffect(() => {
            if (!isRunning && files.length > 0 && files.some(f => f.path === 'src/components/Calendar.js')) {
      // Small delay to ensure files are fully loaded
      const timeoutId = setTimeout(() => {
        compileAndExecute();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [files, isRunning]);

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
          {isRunning ? 'Live code execution' : 'Click to start preview'}
        </p>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {!isRunning ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-4">Preview Not Running</div>
              <button
                onClick={compileAndExecute}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Compiling...' : 'Start Preview'}</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Click to compile and run the code
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="absolute top-2 left-2 right-2 z-10 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">Compilation Error: {error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              srcDoc={compiledCode}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Code Preview"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
