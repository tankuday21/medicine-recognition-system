import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterface = ({ initialContext = null, onContextChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        content: `Hello! I'm Mediot Assistant, your AI health companion. I can help you with:

• Medicine information and interactions
• General health questions
• Symptom guidance
• Dosage information

${!isAuthenticated ? '\n💡 Sign in to save your conversation history and get personalized recommendations.' : ''}

How can I help you today?`,
        sender: 'assistant',
        timestamp: new Date(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: initialContext
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.data.message,
          sender: 'assistant',
          timestamp: new Date(data.data.timestamp),
          confidence: data.data.confidence,
          sources: data.data.sources,
          followUpQuestions: data.data.followUpQuestions
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFollowUpQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const parseMarkdown = (text) => {
    // Parse markdown-style formatting
    let parsed = text;
    
    // Bold: **text** or __text__
    parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Code: `code`
    parsed = parsed.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    
    return parsed;
  };

  const formatMessage = (content) => {
    // Split by lines and process each line
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Check for bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const bulletContent = line.replace(/^[\s]*[•\-\*][\s]*/, '');
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-blue-600 mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(bulletContent) }} />
          </div>
        );
      }
      
      // Check for numbered lists
      if (/^\d+\./.test(line.trim())) {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-2 my-1">
              <span className="text-blue-600 font-semibold">{match[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: parseMarkdown(match[2]) }} />
            </div>
          );
        }
      }
      
      // Regular line with markdown
      if (line.trim()) {
        return (
          <div key={index} className="my-1">
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }} />
          </div>
        );
      }
      
      // Empty line (spacing)
      return <div key={index} className="h-2" />;
    });
  };

  const getMessageIcon = (message) => {
    if (message.sender === 'user') {
      return null;
    }
    
    if (message.isError) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    
    if (message.isWelcome) {
      return <SparklesIcon className="h-5 w-5 text-blue-500" />;
    }
    
    return <SparklesIcon className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mediot Assistant</h2>
            <p className="text-sm text-gray-500">AI Health Companion</p>
          </div>
        </div>
        
        {initialContext && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <InformationCircleIcon className="h-4 w-4" />
            <span>Context: {initialContext.type || 'Medicine'}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.sender === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  {getMessageIcon(message)}
                  <span className="text-xs font-medium">
                    {message.isError ? 'Error' : 'Mediot Assistant'}
                  </span>
                </div>
              )}
              
              <div className="text-sm">
                {formatMessage(message.content)}
              </div>
              
              {message.confidence && (
                <div className="mt-2 text-xs opacity-75">
                  Confidence: {message.confidence}%
                </div>
              )}
              
              <div className="mt-1 text-xs opacity-75">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Follow-up Questions */}
        {messages.length > 1 && messages[messages.length - 1]?.followUpQuestions && (
          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-sm text-gray-600 w-full mb-2">Suggested questions:</p>
            {messages[messages.length - 1].followUpQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpQuestion(question)}
                className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full border-2 border-gray-200 focus-within:border-blue-500 transition-all shadow-sm hover:shadow-md">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about medicines, health conditions, or symptoms..."
              className="flex-1 px-5 py-3 bg-transparent text-base placeholder-gray-400"
              style={{ 
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}
              disabled={isLoading}
            />
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="mr-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-110 disabled:transform-none disabled:hover:scale-100 focus:outline-none"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send
          </div>
        </div>
      </div>
    </div>
  );
};

ChatInterface.propTypes = {
  initialContext: PropTypes.object,
  onContextChange: PropTypes.func
};

export default ChatInterface;