'use client';

import React, { useState } from 'react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import ChatInterface from '@/components/ChatInterface';
import LivePreview from '@/components/LivePreview';
import { FileNode, ChatMessage } from '@/types';
import { sampleProjectFiles } from '@/lib/sampleFiles';
import { callOpenAI } from '@/lib/openai';

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

    try {
      // Prepare conversation history for context
      const conversationHistory = chatMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call OpenAI API
      const response = await callOpenAI([...conversationHistory, { role: 'user', content: message }]);

      if (response.error) {
        throw new Error(response.error);
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your .env.local file and ensure OPENAI_API_KEY is set correctly.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
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
      <div className="grid grid-cols-12 gap-4 h-full p-4">
        {/* File Explorer */}
        <div className="col-span-2 bg-white rounded-lg shadow-md p-4 overflow-hidden">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.path}
          />
        </div>
        
        {/* Code Editor */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4 overflow-hidden">
          <CodeEditor
            file={selectedFile}
            onCodeChange={handleCodeChange}
          />
        </div>
        
        {/* Live Preview */}
        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-hidden">
          <LivePreview files={files} />
        </div>
        
        {/* Chat Interface */}
        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-hidden">
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
            <span>💡 Tip: See live changes in the preview pane as you code</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
