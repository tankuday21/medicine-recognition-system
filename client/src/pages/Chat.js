import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BackButton } from '../components/ui/PremiumComponents';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import { useLayout } from '../contexts/LayoutContext';

const quickSuggestions = [
  { id: 1, text: 'What are the side effects of Paracetamol?', icon: '💊' },
  { id: 2, text: 'How to manage high blood pressure?', icon: '❤️' },
  { id: 3, text: 'What foods help with diabetes?', icon: '🥗' },
  { id: 4, text: 'Signs of vitamin deficiency', icon: '🔬' },
];

const formatText = (text) => {
  if (!text) return null;
  
  const renderBoldText = (str) => {
    // First, split by bold markdown
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      let isBold = part.startsWith('**') && part.endsWith('**');
      let content = isBold ? part.slice(2, -2) : part;
      
      const keywords = [
        { regex: /Warning:/i, color: 'text-red-600 dark:text-red-400' },
        { regex: /Caution:/i, color: 'text-orange-600 dark:text-orange-400' },
        { regex: /Note:/i, color: 'text-blue-600 dark:text-blue-400' },
        { regex: /Tip:/i, color: 'text-emerald-600 dark:text-emerald-400' },
        { regex: /Important:/i, color: 'text-rose-600 dark:text-rose-400' }
      ];

      let formattedContent = content;
      let matchedKeyword = null;

      keywords.forEach(kw => {
        if (kw.regex.test(formattedContent)) {
          matchedKeyword = kw;
          formattedContent = formattedContent.replace(kw.regex, (match) => 
            `<span class="font-black uppercase tracking-wider ${kw.color}">${match}</span>`
          );
        }
      });

      if (matchedKeyword || content !== formattedContent) {
        return (
          <span key={i} className={isBold ? "font-bold text-gray-900 dark:text-white" : ""}>
            <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </span>
        );
      }

      if (isBold) {
        return <strong key={i} className="font-bold text-indigo-700 dark:text-indigo-300">{content}</strong>;
      }
      
      return part;
    });
  };

  return text.split('\n').map((line, lineIdx) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <div key={lineIdx} className="h-2" />;
    
    // Bullet points
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
      return (
        <div key={lineIdx} className="flex gap-2 pl-1 my-2 items-start">
          <span className="text-violet-500 mt-1.5 flex-shrink-0 text-xs">●</span>
          <span className="flex-1 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            {renderBoldText(trimmedLine.substring(2))}
          </span>
        </div>
      );
    }
    
    // Numbered lists
    const numberedMatch = trimmedLine.match(/^(\d+\.)\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={lineIdx} className="flex gap-2 pl-1 my-2 items-start">
          <span className="text-violet-600 font-black min-w-[22px] text-sm">{numberedMatch[1]}</span>
          <span className="flex-1 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            {renderBoldText(numberedMatch[2])}
          </span>
        </div>
      );
    }

    return <p key={lineIdx} className="my-1.5 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">{renderBoldText(line)}</p>;
  });
};

const useTypewriter = (text, speed = 5, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text || '');
      setIsComplete(true);
      return;
    }
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        const charsToAdd = Math.min(4, text.length - index);
        setDisplayedText(text.slice(0, index + charsToAdd));
        index += charsToAdd;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

const MessageContent = React.memo(({ content, isNew, onTypingComplete }) => {
  const { displayedText, isComplete } = useTypewriter(content, 4, isNew);

  useEffect(() => {
    if (isComplete && isNew) onTypingComplete?.();
  }, [isComplete, isNew, onTypingComplete]);

  return (
    <div className="text-[15px] leading-relaxed">
      {formatText(isNew ? displayedText : content)}
      {isNew && !isComplete && <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse" />}
    </div>
  );
});

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [newMessageId, setNewMessageId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { setHideBottomNav } = useLayout();

  useEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setConversations(data.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [isAuthenticated]);

  // Load a specific conversation
  const loadConversation = async (convId) => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/chat/conversations/${convId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setConversationId(convId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setNewMessageId(null);
    setShowHistory(false);
    setShowMenu(false);
  };

  // Delete conversation
  const deleteConversation = async (convId, e) => {
    e?.stopPropagation();
    if (!isAuthenticated) return;
    try {
      await fetch(`/api/chat/conversations/${convId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (conversationId === convId) startNewConversation();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100 && messages.length > 0);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTypingComplete = useCallback(() => setNewMessageId(null), []);

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), content: text.trim(), sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({ message: text.trim(), conversationId, language })
      });
      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        if (data.data.conversationId && !conversationId) {
          setConversationId(data.data.conversationId);
        }
        const aiMessageId = (Date.now() + 1).toString();
        setNewMessageId(aiMessageId);
        setMessages(prev => [...prev, {
          id: aiMessageId,
          content: data.data.message,
          sender: 'assistant',
          timestamp: new Date(data.data.timestamp),
          followUpQuestions: data.data.followUpSuggestions
        }]);
        loadConversations(); // Refresh conversation list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: t('chat.errorProcessing'),
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = (content) => navigator.clipboard.writeText(content);

  return (
    <div className="fixed inset-0 flex flex-col h-[100dvh] bg-gray-100 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-100 dark:bg-slate-950 pt-2 pb-2 px-3 sm:pt-4 sm:pb-3 sm:px-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
        <div className="flex items-center justify-between">
          <BackButton onClick={() => navigate(-1)} />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <SparklesSolid className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-gray-100 dark:border-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{t('chat.mediotAssistant')}</h1>
              <p className="text-[10px] sm:text-xs text-emerald-500 font-semibold">{t('chat.online', 'Online')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* History Button */}
            {isAuthenticated && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowHistory(true); loadConversations(); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-gray-200" />
              </motion.button>
            )}
            {/* Menu Button */}
            <div className="relative">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <EllipsisVerticalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-gray-200" />
              </motion.button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                      <button onClick={startNewConversation} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <PlusIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('chat.newChat', 'New Chat')}</span>
                      </button>
                      {messages.length > 0 && (
                        <button onClick={() => { setMessages([]); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <TrashIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">{t('chat.clearChat', 'Clear Chat')}</span>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowHistory(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 flex flex-col"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('chat.recentChats')}</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <button onClick={startNewConversation} className="m-4 flex items-center justify-center gap-2 py-3 bg-violet-500 text-white rounded-xl font-medium">
                <PlusIcon className="w-5 h-5" />
                {t('chat.newChat', 'New Chat')}
              </button>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <ArrowPathIcon className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('chat.noHistory')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <motion.button
                        key={conv.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${conversationId === conv.id
                          ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{conv.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(conv.lastMessageAt).toLocaleDateString()} • {conv.messageCount} messages
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteConversation(conv.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full px-5">
            <div className="flex flex-col items-center pt-4 pb-6">
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('chat.howCanIHelp')}</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-500 dark:text-gray-400 text-sm">{t('chat.welcomeMessage', 'Ask me anything about health & medicine')}</motion.p>
            </div>
            <div className="flex-1 space-y-3">
              {quickSuggestions.map((suggestion, index) => (
                <motion.button key={suggestion.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + index * 0.08 }} whileTap={{ scale: 0.98 }} onClick={() => sendMessage(suggestion.text)} className="w-full flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-left shadow-sm">
                  <span className="text-3xl flex-shrink-0">{suggestion.icon}</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-medium leading-snug">{suggestion.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {messages.map((message) => {
              const isNewAiMessage = message.sender === 'assistant' && message.id === newMessageId;
              return (
                <motion.div key={message.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[88%] sm:max-w-[80%]">
                    <div className={`
                      px-4 py-3 shadow-sm transition-all
                      ${message.sender === 'user' 
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-[1.25rem] rounded-tr-[0.25rem] shadow-violet-500/10' 
                        : message.isError 
                          ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-[1.25rem] rounded-tl-[0.25rem] border border-red-200 dark:border-red-800/50' 
                          : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-[1.25rem] rounded-tl-[0.25rem] border border-gray-100 dark:border-slate-800 shadow-lg shadow-gray-200/20 dark:shadow-none'
                      }
                    `}>
                      {message.sender === 'assistant' ? (
                        <MessageContent content={message.content} isNew={isNewAiMessage} onTypingComplete={handleTypingComplete} />
                      ) : (
                        <div className="text-[15px] leading-relaxed font-medium">{message.content}</div>
                      )}
                      <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${message.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.sender === 'assistant' && <SparklesSolid className="w-2.5 h-2.5 text-violet-400/50" />}
                      </div>
                    </div>
                    {message.sender === 'assistant' && !message.isError && !isNewAiMessage && (
                      <div className="flex items-center gap-0.5 mt-1 ml-1">
                        <button onClick={() => copyMessage(message.content)} className="p-1.5 text-gray-400 hover:text-violet-500 rounded-lg"><ClipboardDocumentIcon className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg"><HandThumbUpIcon className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><HandThumbDownIcon className="w-4 h-4" /></button>
                      </div>
                    )}
                    {message.followUpQuestions?.length > 0 && !isNewAiMessage && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.followUpQuestions.slice(0, 2).map((q, i) => (
                          <button key={i} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-full">{q.length > 30 ? q.substring(0, 30) + '...' : q}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (<motion.div key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-2 h-2 bg-violet-500 rounded-full" />))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-gray-100 dark:bg-slate-950 px-4 pt-3 pb-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-full border border-gray-200 dark:border-slate-800">
            <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder={t('chat.askPlaceholder')} className="w-full px-5 py-3.5 bg-transparent border-none ring-0 focus:ring-0 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none" style={{ border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }} disabled={isLoading} />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()} disabled={!inputMessage.trim() || isLoading} className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${inputMessage.trim() && !isLoading ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}`}>
            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
