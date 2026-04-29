import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// ── Markdown-like formatter with Premium Styling ──────────────────────────
// ── Markdown-lite Formatter (Synced with Medicine Chat) ─────────────────
const formatMessage = (text) => {
  if (!text) return null;
  
  const renderBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
      }
      
      const keywords = ['Warning:', 'Caution:', 'Note:', 'Tip:', 'Important:'];
      let content = part;
      keywords.forEach(kw => {
        if (content.includes(kw)) {
          content = content.replace(kw, `<span class="font-bold text-red-500">${kw}</span>`);
        }
      });

      if (content !== part) {
        return <span key={i} dangerouslySetInnerHTML={{ __html: content }} />;
      }
      return part;
    });
  };

  return text.split('\n').map((line, lineIdx) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <div key={lineIdx} className="h-2" />;
    
    // Bullet points
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      return (
        <div key={lineIdx} className="flex gap-2 pl-1">
          <span className="text-blue-400 mt-1.5">•</span>
          <span className="flex-1">{renderBoldText(trimmedLine.substring(2))}</span>
        </div>
      );
    }
    
    // Numbered lists
    const numberedMatch = trimmedLine.match(/^(\d+\.)\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={lineIdx} className="flex gap-2 pl-1">
          <span className="text-blue-400 font-bold">{numberedMatch[1]}</span>
          <span className="flex-1">{renderBoldText(numberedMatch[2])}</span>
        </div>
      );
    }

    return <p key={lineIdx}>{renderBoldText(line)}</p>;
  });
};

const QUICK_QUESTIONS = [
  'Summary of this report',
  'Is my report normal?',
  'Explain abnormal values',
  'What are the next steps?',
];

const ReportChat = ({ report, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Welcome message with micro-animation ──────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcomeMsg = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm **Mediot AI** ✨\n\nI've analyzed your **"${report.fileName}"**. I can help you understand your metrics, explain medical terms, or suggest what to discuss with your doctor.\n\nHow can I assist you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
      }, 500);
    }
  }, [isOpen, report.fileName, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [isOpen]);

  const buildReportContext = useCallback(() => {
    const hm = report.healthMetrics;
    if (!hm) return `Report: ${report.fileName}`;
    return `CONTEXT: ${JSON.stringify({
      file: report.fileName,
      metrics: hm.metrics,
      abnormal: hm.abnormalFlags,
      notes: hm.clinicalNotes,
      summary: hm.summary,
      analysis: hm.detailedAnalysis
    })}`;
  }, [report]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reports/${report._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: msg,
          reportContext: buildReportContext(),
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          language
        }),
      });

      const data = await response.json();
      if (data.success) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          followUps: data.data.followUps || [],
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Scroll Lock Logic (Reinforced) ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const chatContent = (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[999] flex flex-col bg-white dark:bg-slate-900 w-full h-full rounded-t-[2rem] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 pt-[calc(1.5rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Mediot AI: Report Analysis</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate max-w-[200px]">{report.fileName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-slate-750'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                      <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">Mediot AI Insights</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed space-y-2">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-750 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {!isLoading && messages.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {(messages[messages.length - 1]?.followUps || QUICK_QUESTIONS).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 border border-transparent hover:border-blue-500/30 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap flex-shrink-0 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your report..."
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-tight">
            AI insights are for information only. Consult your doctor.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(chatContent, document.body);
};

export const ReportChatFAB = ({ onClick, hasReport }) => {
  if (!hasReport) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-4 flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 z-50"
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      <SparklesIcon className="w-5 h-5" />
      <span className="font-medium text-sm">Ask Mediot AI</span>
    </motion.button>
  );
};

ReportChat.propTypes = {
  report: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

ReportChatFAB.propTypes = {
  onClick: PropTypes.func.isRequired,
  hasReport: PropTypes.bool,
};

export default ReportChat;

