'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import ChatInterface from '@/components/ChatInterface';
import LivePreview from '@/components/LivePreview';
import { FileNode, ChatMessage } from '@/types';
import { sampleProjectFiles } from '@/lib/sampleFiles';
import { callOpenAI } from '@/lib/openai';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'challenge' | 'ai'>('challenge');
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [files, setFiles] = useState<FileNode[]>(sampleProjectFiles);

  // Separate chats: Assistant (challenge tab) vs Interviewer (AI tab)
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: 'Hi! I\'m your coding assistant. Ask me anything about the code or the task, and I\'ll reply when you send a message.',
      timestamp: new Date()
    }
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  const [interviewerMessages, setInterviewerMessages] = useState<ChatMessage[]>([
    {
      id: 'interviewer-welcome',
      role: 'assistant',
      content: 'Hello, I\'m your interviewer. I\'ll proactively review your edits, give feedback, and you can also talk to me via voice or text.',
      timestamp: new Date()
    }
  ]);
    const [isInterviewerLoading, setIsInterviewerLoading] = useState(false);

  // Refs for proactive AI feedback (interviewer only)
  const proactiveTimeoutRef = useRef<number | null>(null);
  const lastProactiveAtRef = useRef<number>(0);
  const lastAnalyzedByFileRef = useRef<Record<string, string>>({});

  // Helpers
  const findFileByPath = (nodes: FileNode[], path: string): FileNode | undefined => {
    for (const node of nodes) {
      if (node.path === path && node.type === 'file') return node;
      if (node.children) {
        const found = findFileByPath(node.children, path);
        if (found) return found;
      }
    }
    return undefined;
  };

  const flattenFiles = (nodes: FileNode[]): FileNode[] => {
    const out: FileNode[] = [];
    const walk = (list: FileNode[]) => {
      for (const n of list) {
        if (n.type === 'file') {
          out.push(n);
        }
        if (n.children) {
          walk(n.children);
        }
      }
    };
    walk(nodes);
    return out;
  };

  const allFiles = useMemo(() => flattenFiles(files), [files]);

  useEffect(() => {
    if (!selectedFile) {
      const preferred = findFileByPath(files, 'src/components/Calendar.js');
      const first = preferred || allFiles[0];
      if (first) setSelectedFile(first);
    }
    }, [files, allFiles, selectedFile]);

  const scheduleProactiveFeedback = (filePath: string, oldContent: string, newContent: string) => {
    if (proactiveTimeoutRef.current) {
      window.clearTimeout(proactiveTimeoutRef.current);
    }

    proactiveTimeoutRef.current = window.setTimeout(async () => {
      const now = Date.now();
      if (now - lastProactiveAtRef.current < 10000) {
        return;
      }

      const lastKey = lastAnalyzedByFileRef.current[filePath];
      const currentKey = `${newContent.length}:${(newContent.match(/TODO/gi) || []).length}`;
      if (lastKey === currentKey) {
        return;
      }

      const oldTodos = (oldContent.match(/TODO/gi) || []).length;
      const newTodos = (newContent.match(/TODO/gi) || []).length;
      const deltaLen = Math.abs(newContent.length - oldContent.length);
      const touchedKeyAreas = /(handleCreateMeeting|handleEditMeeting|handleSaveMeeting|handleDeleteMeeting|handleAttendeeChange|addAttendee|removeAttendee|onSave|setIsModalOpen)/.test(newContent);
      const meaningful = touchedKeyAreas || newTodos < oldTodos || deltaLen >= 20;
      if (!meaningful) {
        lastAnalyzedByFileRef.current[filePath] = currentKey;
        return;
      }

      const summaryPoints: string[] = [];
      if (newTodos !== oldTodos) summaryPoints.push(`TODOs changed from ${oldTodos} to ${newTodos}.`);
      if (touchedKeyAreas) summaryPoints.push('Edited key calendar functions or attendee handlers.');
      if (deltaLen) summaryPoints.push(`Content length changed by ${deltaLen} characters.`);

      const maxLen = 1800;
      const truncatedNew = newContent.length > maxLen ? newContent.slice(0, maxLen) + '\n... [truncated]' : newContent;

      setIsInterviewerLoading(true);
      try {
        const guidancePrompt = [
          'You are a proactive coding interviewer reviewing a candidate\'s recent code edit.',
          'File: ' + filePath,
          'Change summary: ' + (summaryPoints.join(' ') || 'Minor changes.'),
          'Latest file content (truncated if long):',
          '```\n' + truncatedNew + '\n```',
          '',
          'Respond concisely (1-3 short sentences).',
          '- If progress is good or completes a TODO, give positive, specific feedback.',
          '- If the candidate seems stuck or the implementation is incomplete, ask one guiding question and give one small hint.',
          '- Avoid repeating instructions already visible in the code.',
          '- Keep under 80 words.',
        ].join('\n');

        const response = await callOpenAI([
          { role: 'assistant', content: 'Monitoring code changes...' },
          { role: 'user', content: guidancePrompt },
        ]);

        if (!response.error && response.content) {
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.content,
            timestamp: new Date()
          };
          setInterviewerMessages(prev => [...prev, aiResponse]);
          lastProactiveAtRef.current = Date.now();
          lastAnalyzedByFileRef.current[filePath] = currentKey;
        }
      } catch (e) {
      } finally {
        setIsInterviewerLoading(false);
      }
    }, 1500);
  };

  const handleCodeChange = (value: string) => {
    if (selectedFile) {
      const previousContent = selectedFile.content || '';

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

      scheduleProactiveFeedback(selectedFile.path, previousContent, value);

      setFiles(prev => updateFileContent(prev));
      setSelectedFile({ ...selectedFile, content: value });
    }
  };

  const handleAssistantSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setAssistantMessages(prev => [...prev, userMessage]);
    setIsAssistantLoading(true);

    try {
      const conversationHistory = assistantMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

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

      setAssistantMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your .env.local file and ensure OPENAI_API_KEY is set correctly.`,
        timestamp: new Date()
      };
      setAssistantMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleInterviewerSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setInterviewerMessages(prev => [...prev, userMessage]);
    setIsInterviewerLoading(true);

    try {
      const conversationHistory = interviewerMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

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

      setInterviewerMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your .env.local file and ensure OPENAI_API_KEY is set correctly.`,
        timestamp: new Date()
      };
      setInterviewerMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsInterviewerLoading(false);
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

      {/* Tabs Controller */}
      <div className="px-4 pt-4">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2 text-sm rounded-t-md ${
              activeTab === 'challenge' ? 'bg-white border border-b-0 border-gray-200 text-blue-700' : 'text-gray-600'
            }`}
          >
            Interview Code Challenge
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm rounded-t-md ${
              activeTab === 'ai' ? 'bg-white border border-b-0 border-gray-200 text-blue-700' : 'text-gray-600'
            }`}
          >
            AI Interviewer
          </button>
        </nav>
      </div>

      {/* Main Content controlled by tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Challenge View (kept mounted) */}
        <div className={`${activeTab === 'challenge' ? 'block' : 'hidden'} grid grid-cols-12 gap-4 flex-1 p-4 pt-0 min-h-0`}>
          {/* File Explorer */}
          <div className="col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-full min-h-0">
            <FileExplorer
              files={files}
              onFileSelect={(file: React.SetStateAction<FileNode | undefined>) => setSelectedFile(file)}
              selectedFile={selectedFile?.path}
            />
          </div>

          {/* Code Editor */}
          <div className="col-span-4 bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">Code Editor</div>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <span>Select file:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={selectedFile?.path || ''}
                  onChange={(e) => {
                    const next = findFileByPath(files, e.target.value);
                    if (next) setSelectedFile(next);
                  }}
                >
                  {allFiles.map(f => (
                    <option key={f.path} value={f.path}>{f.path}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <CodeEditor
                file={selectedFile}
                onCodeChange={handleCodeChange}
              />
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-hidden h-full min-h-0">
            <LivePreview files={allFiles} />
          </div>
          
          {/* Assistant Chat (basic, user-triggered only) */}
          <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-hidden h-full min-h-0">
            <ChatInterface
              onSendMessage={handleAssistantSendMessage}
              messages={assistantMessages}
              isLoading={isAssistantLoading}
              title="AI Assistant"
              subtitle="Get JavaScript code examples and solutions for your coding challenges"
            />
          </div>
        </div>

        {/* AI Interviewer View (kept mounted) */}
        <div className={`${activeTab === 'ai' ? 'block' : 'hidden'} flex-1 p-4 pt-0 min-h-0`}>
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-700">AI Interviewer</h2>
              <p className="text-xs text-gray-500">Speak to the interviewer, get text responses.</p>
            </div>
            <div className="h-[calc(100%-2rem)]">
              <ChatInterface
                onSendMessage={handleInterviewerSendMessage}
                messages={interviewerMessages}
                isLoading={isInterviewerLoading}
                enableVoice
              />
            </div>
          </div>
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
