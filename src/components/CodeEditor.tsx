'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { FileNode } from '@/types';

interface CodeEditorProps {
  file?: FileNode;
  onCodeChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onCodeChange }) => {
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No file selected</div>
          <div className="text-gray-500 text-sm">Select a file from the explorer to start editing</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">{file.name}</span>
        <span className="text-xs text-gray-500 ml-2">{file.path}</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content || ''}
          onChange={(value) => onCodeChange(value || '')}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
