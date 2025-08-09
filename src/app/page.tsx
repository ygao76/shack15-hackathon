'use client';

import React, { useState } from 'react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import ChatInterface from '@/components/ChatInterface';
import { FileNode, ChatMessage } from '@/types';
import { sampleProjectFiles } from '@/lib/sampleFiles';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [files, setFiles] = useState<FileNode[]>(sampleProjectFiles);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to your coding interview! I\'m here to help you implement the missing functionality in this calendar app.\n\nYour tasks:\n1. Implement meeting creation in Calendar.tsx\n2. Complete the meeting editing functionality\n3. Add attendee management in MeetingModal.tsx\n4. Implement meeting deletion\n\nFeel free to ask me questions as you work through these challenges!',
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleCodeChange = (value: string) => {
    if (selectedFile) {
      // Update the file content in the files array
      const updateFileContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === selectedFile.path) {
            return { ...node, content: value };
          }
          if (node.children) {
            return { ...node, children: updateFileContent(node.children) };
          }
          return node;
        });
      };

      setFiles(updateFileContent);
      setSelectedFile({ ...selectedFile, content: value });
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    // Simulate AI response (in a real app, this would call OpenAI API)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(message),
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
      setIsChatLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple response generator for demo purposes
    const responses = [
      "Great question! For implementing that functionality, you'll want to focus on updating the state management. Make sure to handle both the UI updates and the data persistence.",
      "That's a common challenge in React development. Consider using the useState hook to manage the form data, and don't forget to validate the inputs before submission.",
      "Good thinking! For the attendee management, you'll need to work with array operations. The key is to properly update the state while maintaining immutability.",
      "Excellent approach! Remember to handle edge cases like empty fields and duplicate entries. The user experience will be much better with proper validation.",
      "That's the right direction! For the calendar functionality, make sure to properly format the dates and handle timezone considerations if needed.",
      "Nice work! Don't forget to implement proper error handling and user feedback. Loading states and success messages really improve the user experience."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Code Challenge</h1>
            <p className="text-sm text-gray-600">Calendar App Implementation</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Task:</span> Implement missing calendar functionality
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live Session</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex">
          {/* File Explorer */}
          <div className="w-64 border-r border-gray-200">
            <FileExplorer
              files={files}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile?.path}
            />
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              file={selectedFile}
              onCodeChange={handleCodeChange}
            />
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-96 border-l border-gray-200">
          <ChatInterface
            onSendMessage={handleSendMessage}
            messages={chatMessages}
            isLoading={isChatLoading}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {selectedFile ? (
              <span>Editing: <span className="font-medium">{selectedFile.name}</span></span>
            ) : (
              <span>Select a file to start coding</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>💡 Tip: Ask the AI for help with implementation details</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
