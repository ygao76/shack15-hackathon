'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Square } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isLoading?: boolean;
  enableVoice?: boolean;
  title?: string;
  subtitle?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, messages, isLoading, enableVoice = false, title, subtitle }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Detect Web Speech API support
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = Boolean(SpeechRecognitionImpl);
    setVoiceSupported(supported);
    
    if (!supported) {
      console.warn('Web Speech API not supported in this browser');
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.warn('Web Speech API requires a secure context (HTTPS or localhost)');
      }
    } else {
      console.log('Web Speech API supported:', SpeechRecognitionImpl.name);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const startRecording = async () => {
    // Clear any previous errors
    setVoiceError(null);
    
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      console.error('Speech recognition not supported');
      return;
    }

    // Check microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      console.log('Microphone permission granted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      alert('Please allow microphone access to use voice input');
      return;
    }

    // Add connection test before starting recognition
    try {
      const testConnection = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('Network connectivity test passed');
    } catch (error) {
      console.warn('Network connectivity test failed:', error);
      setVoiceError('Network connectivity issue detected');
    }

    const recognition = new SpeechRecognitionImpl();
    
    // Try different configurations to improve compatibility
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    // Add additional configuration for better compatibility
    if ('webkitSpeechRecognition' in window) {
      // Chrome-specific optimizations
      (recognition as any).maxAlternatives = 1;
      (recognition as any).serviceURI = 'https://speech.googleapis.com/v1/speech:recognize';
    }

    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle specific error types
      switch (event.error) {
        case 'network':
          console.warn('Network error - speech recognition service unavailable');
          setVoiceError('Network error - service temporarily unavailable');
          
          // Retry logic for network errors with exponential backoff
          if (retryCountRef.current < 3) {
            retryCountRef.current++;
            const delay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
            console.log(`Retrying voice recognition (attempt ${retryCountRef.current}/3) in ${delay/1000}s...`);
            
            setTimeout(() => {
              if (!isRecording) {
                console.log('Attempting retry...');
                startRecording();
              }
            }, delay);
          } else {
            retryCountRef.current = 0;
            setVoiceError('Service unavailable after multiple attempts. Try refreshing the page.');
            console.error('Voice recognition failed after 3 attempts');
          }
          break;
        case 'not-allowed':
          console.warn('Microphone access denied');
          alert('Microphone access was denied. Please allow microphone access and try again.');
          break;
        case 'no-speech':
          console.warn('No speech detected');
          alert('No speech was detected. Please speak clearly and try again.');
          break;
        case 'audio-capture':
          console.warn('Audio capture error');
          alert('Audio capture error. Please check your microphone and try again.');
          break;
        case 'aborted':
          console.warn('Speech recognition aborted');
          break;
        default:
          console.warn('Unknown speech recognition error:', event.error);
          alert(`Voice recognition error: ${event.error}. Please try again.`);
      }
      
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join(' ')
        .trim();

      if (transcript) {
        // Auto-send recognized text
        onSendMessage(transcript);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      console.log('Started voice recording');
      
      // Add timeout to prevent hanging
      setTimeout(() => {
        if (isRecording && recognitionRef.current) {
          console.log('Voice recognition timeout - stopping');
          stopRecording();
        }
      }, 30000); // 30 second timeout
      
    } catch (error) {
      console.error('Failed to start voice recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    retryCountRef.current = 0; // Reset retry count when manually stopped
  };

  const resetVoiceRecognition = () => {
    stopRecording();
    setVoiceError(null);
    retryCountRef.current = 0;
    console.log('Voice recognition state reset');
  };

  const headerTitle = title ?? (enableVoice ? 'AI Interviewer' : 'AI Assistant');
  const headerSubtitle = subtitle ?? (enableVoice ? 'Voice and text support' : 'Ask questions or get help during the coding challenge. Please provide JavaScript code examples.');

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <Bot className="w-4 h-4 mr-2" />
          {headerTitle} {enableVoice && voiceSupported ? ' (Voice Enabled)' : ''}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {headerSubtitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Start a conversation with the AI</p>
            <p className="text-xs text-gray-400 mt-1">Ask for JavaScript code examples and solutions</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                {message.role === 'user' && (
                  <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for JavaScript help or code examples..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {enableVoice && (
            <>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!voiceSupported || isLoading}
                className={`p-2 rounded-md border ${
                  isRecording ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'
                } disabled:opacity-50`}
                title={voiceSupported ? (isRecording ? 'Stop Recording' : 'Start Recording') : 'Voice input not supported in this browser'}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {process.env.NODE_ENV === 'development' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Voice support check:');
                      console.log('- voiceSupported:', voiceSupported);
                      console.log('- SpeechRecognition:', !!(window as any).SpeechRecognition);
                      console.log('- webkitSpeechRecognition:', !!(window as any).webkitSpeechRecognition);
                      console.log('- isSecureContext:', window.isSecureContext);
                      console.log('- userAgent:', navigator.userAgent);
                    }}
                    className="p-1 text-xs text-gray-500 hover:text-gray-700"
                    title="Debug voice support"
                  >
                    🐛
                  </button>
                  <button
                    type="button"
                    onClick={resetVoiceRecognition}
                    className="p-1 text-xs text-red-500 hover:text-red-700"
                    title="Reset voice recognition state"
                  >
                    🔄
                  </button>
                </>
              )}
            </>
          )}
          {enableVoice && !voiceSupported && (
            <div className="text-xs text-red-500 px-2" title="Web Speech API not supported in this browser">
              Voice not supported
            </div>
          )}
          {enableVoice && voiceSupported && voiceError && (
            <div className="flex items-center space-x-2 text-xs text-orange-500 px-2">
              <span title={voiceError}>⚠️ {voiceError}</span>
              {voiceError.includes('Network error') && (
                <button
                  onClick={() => {
                    retryCountRef.current = 0;
                    setVoiceError(null);
                    startRecording();
                  }}
                  className="text-blue-500 hover:text-blue-700 underline"
                  title="Retry voice recognition"
                >
                  Retry
                </button>
              )}
              {voiceError.includes('Service unavailable after multiple attempts') && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-green-500 hover:text-green-700 underline"
                  title="Refresh page to reset voice recognition"
                >
                  Refresh Page
                </button>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
