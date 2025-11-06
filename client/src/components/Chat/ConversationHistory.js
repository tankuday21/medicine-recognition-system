import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ConversationHistory = ({ onConversationSelect }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/history?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);
    await loadConversationMessages(conversation._id);
    
    if (onConversationSelect) {
      onConversationSelect(conversation);
    }
  };

  const exportConversation = (conversation) => {
    if (!messages.length) return;

    const conversationText = messages.map(msg => 
      `[${new Date(msg.createdAt).toLocaleString()}] ${msg.sender === 'user' ? 'You' : 'Mediot Assistant'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediot-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessage = (content) => {
    if (content.length > 100) {
      return content.substring(0, 100) + '...';
    }
    return content;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">
            Please sign in to view your conversation history and manage your chats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversation History</h2>
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
        {/* Conversations List */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Your Conversations</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatMessage(conversation.lastMessage)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {conversation.messageCount} messages
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ClockIcon className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>

        {/* Conversation Messages */}
        <div className="p-4">
          {selectedConversation ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Messages</h3>
                <button
                  onClick={() => exportConversation(selectedConversation)}
                  disabled={!messages.length}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {isLoadingMessages ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{formatMessage(message.content)}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No messages in this conversation</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ConversationHistory.propTypes = {
  onConversationSelect: PropTypes.func
};

export default ConversationHistory;