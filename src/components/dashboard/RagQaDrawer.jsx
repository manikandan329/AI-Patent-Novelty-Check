import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, X, Sparkles, HelpCircle } from 'lucide-react';
import { answerRagQuestion } from '../../services/ragQaCopilot';
import Button from '../ui/Button';
import Input from '../ui/Input';

export const RagQaDrawer = ({ isOpen, onClose, reportContext }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your RAG Patent Audit Copilot. I have loaded your complete patent analysis context. Ask me anything about your score determination, feature overlaps, or recommendations!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Why is my novelty score calculated at this value?',
    'Which feature has the highest prior art overlap?',
    'Which retrieved patent is most similar?',
    'How can I improve my novelty score?',
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const answer = await answerRagQuestion(q, reportContext);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: 'Error answering question: ' + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0B1120] border-l border-card-border shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b border-card-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                    RAG Audit Assistant <Sparkles className="w-3.5 h-3.5 text-primary-light" />
                  </h3>
                  <p className="text-[10px] text-text-subtle">Strictly Context-Bound Copilot</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-text-subtle hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Sample Questions Chips */}
            <div className="p-3 bg-[#0F172A] border-b border-card-border/40 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-text-subtle flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-primary-light" /> Suggested RAG Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[10px] bg-card border border-card-border hover:border-primary/40 text-text-muted hover:text-text-main px-2 py-1 rounded-lg transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${
                    m.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-card border border-card-border text-primary-light'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[82%] p-3 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'glass-card border border-card-border text-text-main rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-text-subtle">
                  <Bot className="w-4 h-4 animate-spin text-primary-light" />
                  <span>Synthesizing RAG context answer...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-card-border/60 bg-[#0F172A] flex items-center gap-2"
            >
              <Input
                placeholder="Ask about score, features, or risks..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 text-xs"
              />
              <Button type="submit" variant="primary" size="md" icon={Send} loading={loading}>
                Send
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RagQaDrawer;
