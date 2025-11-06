import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/Chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import {
  InformationCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Chat = () => {
  const [chatContext, setChatContext] = useState(null);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const [isRecentChatsExpanded, setIsRecentChatsExpanded] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load conversation history for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
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
      setIsLoadingConversations(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setChatContext({
      type: 'conversation',
      conversationId: conversation._id
    });
    setIsRecentChatsExpanded(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Main Chat Area - Full Height */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <ChatInterface
            initialContext={chatContext}
            onContextChange={setChatContext}
          />
        </div>
      </div>

      {/* Bottom Bar with Collapsible Sections */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Recent Chats - Only for authenticated users */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => setIsRecentChatsExpanded(!isRecentChatsExpanded)}
                className="w-full py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    Recent Chats {conversations.length > 0 && `(${conversations.length})`}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    isRecentChatsExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isRecentChatsExpanded && (
                <div className="py-3 px-4 sm:px-6 max-h-64 overflow-y-auto">
                  {isLoadingConversations ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.slice(0, 5).map((conversation) => (
                        <button
                          key={conversation._id}
                          onClick={() => handleConversationSelect(conversation)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {conversation.lastMessage.substring(0, 60)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {conversation.messageCount} messages
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.lastActivity).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        No conversation history available yet.
                      </p>
                      <p className="text-xs text-gray-400">
                        Conversation history feature is coming soon!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Important Notice */}
          <button
            onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
            className="w-full py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-900">
                Important Safety Notice
              </span>
            </div>
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${
                isNoticeExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isNoticeExpanded && (
            <div className="pb-4 px-4 sm:px-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 leading-relaxed">
                  <strong>Medical Disclaimer:</strong> This AI assistant provides general health information only 
                  and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult 
                  qualified healthcare professionals for medical concerns. In case of emergency, call your local 
                  emergency services immediately (911 in the US, 999 in the UK, 112 in EU).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;