import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileText,
  HelpCircle,
  X,
  Check,
  ChevronRight,
  Info,
  ExternalLink,
  Layers,
  GitCompare,
  Network,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  generateRagChatResponse,
  loadUserConversations,
  saveUserConversation,
  deleteUserConversation,
  exportChatHistoryTranscript,
} from '../../services/ragChatbotEngine';
import { getPatentAnalysisReport } from '../../services/ragAnalysisEngine';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const AiAssistantView = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionSearchTerm, setSessionSearchTerm] = useState('');
  const [inputQuery, setInputQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [explanationMode, setExplanationMode] = useState('technical'); // 'technical' | 'simple'
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [patentContext, setPatentContext] = useState({
    submissionId: 'SUB-2026-98142',
    title: 'Quantum Micro-Fluidic Neural Processing Unit',
    category: 'Quantum Electronics',
    noveltyScore: 94.8,
  });

  const chatEndRef = useRef(null);

  // 12 Prompt Shortcuts
  const suggestedPrompts = [
    'Which patent is most similar to my invention?',
    'Why was Patent A considered similar?',
    'Which features of my invention are different?',
    'Compare my invention with Patent A',
    'Which claim has the strongest overlap?',
    'Find patents about autonomous irrigation',
    'What technologies are growing in this field?',
    'Which applicants have the most patents?',
    'Explain this patent in simple terms',
    'Why did the AI give this similarity score?',
    'What should I investigate further?',
  ];

  // Load chat sessions & context on mount
  useEffect(() => {
    loadUserConversations(currentUser?.uid).then((data) => {
      setSessions(data);
      if (data.length > 0) setActiveSession(data[0]);
    });

    getPatentAnalysisReport('SUB-2026-98142').then((report) => {
      if (report) {
        setPatentContext({
          submissionId: report.submissionId || 'SUB-2026-98142',
          title: report.title || 'Quantum Micro-Fluidic Neural Processing Unit',
          category: report.category || 'Quantum Electronics',
          noveltyScore: report.noveltyScore || 94.8,
        });
      }
    });
  }, [currentUser]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, generating]);

  // New Consultation Chat
  const handleNewChat = () => {
    const newSess = {
      sessionId: `session_${Date.now()}`,
      submissionId: patentContext.submissionId,
      title: 'New AI Research Session',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          sender: 'ai',
          summary: 'RAG Context Initialized',
          text: `Hello ${currentUser?.displayName || 'Inventor'}! I am your AI Patent Research Assistant. I have loaded your active context for "${patentContext.title}" (${patentContext.submissionId}).\n\nAsk me about claim overlaps, prior art comparisons, technology trends, or novelty rationale!`,
          sources: [
            { label: 'SUB-2026-98142', type: 'submission', section: 'Technical Specification', similarity: '100%' },
          ],
          actions: [
            { label: 'View Novelty Audit', path: `/dashboard/analysis/${patentContext.submissionId}`, icon: 'FileText' },
            { label: 'Open Comparison Matrix', path: `/dashboard/compare/${patentContext.submissionId}`, icon: 'Layers' },
          ],
          confidence: 'High Confidence (RAG Bound)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    saveUserConversation(currentUser?.uid, newSess).then(setSessions);
    setActiveSession(newSess);
    toast.success('Started new AI research session');
  };

  // Rename Session
  const handleSaveRename = async (sessionId) => {
    if (!editTitle.trim()) return;
    const updated = { ...activeSession, title: editTitle.trim() };
    const all = await saveUserConversation(currentUser?.uid, updated);
    setSessions(all);
    setActiveSession(updated);
    setEditingSessionId(null);
    toast.success('Session renamed');
  };

  // Delete Session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Delete this AI research conversation?')) {
      const updated = await deleteUserConversation(currentUser?.uid, sessionId);
      setSessions(updated);
      if (activeSession?.sessionId === sessionId) {
        setActiveSession(updated[0] || null);
      }
      toast.success('Session deleted');
    }
  };

  // Send Message Handler
  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputQuery;
    if (!text.trim() || !activeSession) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...(activeSession.messages || []), userMsg];
    const updatedSession = { ...activeSession, messages: updatedMessages, updatedAt: new Date().toISOString() };

    setActiveSession(updatedSession);
    if (!textOverride) setInputQuery('');
    setGenerating(true);

    try {
      const aiReply = await generateRagChatResponse(text, updatedMessages, patentContext, explanationMode);
      const finalMessages = [...updatedMessages, aiReply];
      const finalSession = { ...updatedSession, messages: finalMessages };

      setActiveSession(finalSession);
      const updatedAll = await saveUserConversation(currentUser?.uid, finalSession);
      setSessions(updatedAll);
    } catch (err) {
      toast.error('Failed to generate RAG response: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Copy Message Text
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard');
  };

  // Export Chat Transcript
  const handleExport = (format) => {
    if (!activeSession) return;
    exportChatHistoryTranscript(activeSession.title, activeSession.messages, format);
    toast.success(`Exported transcript as ${format.toUpperCase()}`);
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    if (!sessionSearchTerm.trim()) return true;
    const q = sessionSearchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.submissionId?.toLowerCase().includes(q);
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex gap-4 max-w-[1400px] mx-auto animate-fadeIn overflow-hidden pb-4">
      
      {/* ========================================================================= */}
      {/* 1. LEFT PANEL: Conversations Sidebar (280px) */}
      {/* ========================================================================= */}
      <div className="w-72 hidden lg:flex flex-col justify-between glass-card p-4 rounded-2xl border border-card-border/80 shrink-0">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleNewChat}
            className="w-full justify-center shadow-glow-primary text-xs font-bold"
          >
            New Research Consultation
          </Button>

          {/* Search Conversations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={sessionSearchTerm}
              onChange={(e) => setSessionSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl py-1.5 pl-8 pr-2.5 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle px-1">
              Conversations History ({filteredSessions.length})
            </span>

            {filteredSessions.map((s) => {
              const isActive = activeSession?.sessionId === s.sessionId;
              const isEditing = editingSessionId === s.sessionId;

              return (
                <div
                  key={s.sessionId}
                  onClick={() => setActiveSession(s)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-primary/10 border-primary/40 text-text-main font-bold'
                      : 'border-transparent text-text-muted hover:bg-card/60 hover:text-text-main'
                  }`}
                >
                  <div className="min-w-0 pr-2 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-[#0F172A] border border-primary rounded text-xs p-1 text-text-main"
                          autoFocus
                        />
                        <button onClick={() => handleSaveRename(s.sessionId)} className="text-success hover:text-white p-1">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-xs">{s.title}</p>
                        <p className="text-[10px] text-text-subtle font-mono truncate">{s.submissionId}</p>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(s.sessionId);
                          setEditTitle(s.title);
                        }}
                        className="p-1 text-text-subtle hover:text-primary transition-opacity"
                        title="Rename conversation"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(e, s.sessionId)}
                        className="p-1 text-text-subtle hover:text-danger transition-opacity"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Left Footer Info */}
        <div className="pt-3 border-t border-card-border/60 text-center space-y-1">
          <span className="text-[10px] text-text-subtle font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Evidence-Based RAG Bound
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN AREA: Chat Shell & Message History (Flex-1) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between glass-card rounded-2xl border border-card-border/80 min-w-0 overflow-hidden">
        
        {/* Main Chat Header */}
        <div className="p-3.5 px-6 border-b border-card-border/60 flex flex-wrap items-center justify-between gap-3 bg-[#0B1120]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-main truncate">
                {activeSession?.title || 'AI Patent Research Assistant'}
              </h2>
              <p className="text-[10px] text-text-subtle truncate">
                Context: <span className="font-mono text-primary-light font-bold">{patentContext.submissionId}</span> • {patentContext.title}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Export Tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Explanation Mode Toggle */}
            <div className="bg-[#0F172A] border border-card-border p-0.5 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setExplanationMode('technical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  explanationMode === 'technical' ? 'bg-primary text-white shadow' : 'text-text-subtle hover:text-text-main'
                }`}
              >
                Technical
              </button>
              <button
                onClick={() => setExplanationMode('simple')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  explanationMode === 'simple' ? 'bg-primary text-white shadow' : 'text-text-subtle hover:text-text-main'
                }`}
              >
                Simple Mode
              </button>
            </div>

            <Button variant="ghost" size="sm" icon={Download} onClick={() => handleExport('pdf')} className="text-xs">
              PDF
            </Button>
            <Button variant="ghost" size="sm" icon={FileText} onClick={() => handleExport('txt')} className="text-xs">
              TXT
            </Button>
          </div>
        </div>

        {/* Non-Legal Research Disclaimer Banner */}
        <div className="bg-warning/10 border-b border-warning/30 px-6 py-2 flex items-center justify-between text-[11px] text-warning-light">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>This AI assistant provides research support only. It does not provide legal advice or determine official patentability.</span>
          </div>
          <Badge variant="warning" size="sm">Research Support Only</Badge>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#0F172A]/50">
          
          {activeSession?.messages?.map((m) => {
            const isAi = m.sender === 'ai';

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${!isAi ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    !isAi
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-card border border-card-border text-primary-light shadow-md'
                  }`}
                >
                  {!isAi ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                  
                  {isAi && m.summary && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary-light">
                      <Sparkles className="w-3 h-3" /> {m.summary}
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      !isAi
                        ? 'bg-primary text-white rounded-tr-none shadow-lg font-medium'
                        : 'glass-card border border-card-border text-text-main rounded-tl-none whitespace-pre-line shadow-md'
                    }`}
                  >
                    {m.text}

                    {/* Clickable Source Reference Pills */}
                    {isAi && m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-card-border/60 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-text-subtle flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-primary-light" /> Clickable Source References ({m.sources.length})
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {m.sources.map((src, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                if (src.type === 'patent') navigate('/dashboard/research');
                                else if (src.type === 'report') navigate(`/dashboard/analysis/${patentContext.submissionId}`);
                                else navigate(`/dashboard/compare/${patentContext.submissionId}`);
                                toast.success(`Opening source ${src.label}`);
                              }}
                              className="p-1.5 px-2.5 rounded-lg bg-[#0F172A] border border-primary/30 hover:border-primary text-[10px] flex items-center gap-1.5 transition-all text-text-main font-mono"
                            >
                              <span className="font-bold text-primary-light">{src.label}</span>
                              <span className="text-text-subtle">({src.section})</span>
                              {src.similarity && <span className="text-success font-bold">{src.similarity}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Action Buttons inside AI response */}
                    {isAi && m.actions && m.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-card-border/40">
                        {m.actions.map((act, aIdx) => (
                          <Button
                            key={aIdx}
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(act.path)}
                            className="text-[11px] py-1 h-7 bg-primary/10 border-primary/40 text-primary-light hover:bg-primary hover:text-white"
                          >
                            {act.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {isAi && m.confidence && (
                      <div className="mt-2 pt-2 border-t border-card-border/40 flex items-center justify-between text-[10px] text-text-subtle font-mono">
                        <span>{m.confidence}</span>
                        <span>{m.timestamp}</span>
                      </div>
                    )}
                  </div>

                  {/* Message Action Toolbar for AI responses */}
                  {isAi && (
                    <div className="flex items-center gap-3 pt-0.5 text-[11px] text-text-subtle">
                      <button onClick={() => handleCopyMessage(m.text)} className="hover:text-text-main flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button onClick={() => toast.success('Response bookmarked')} className="hover:text-text-main">
                        Bookmark
                      </button>
                      <button
                        onClick={() => handleSendMessage('Can you elaborate on this response?')}
                        className="hover:text-text-main flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}

          {generating && (
            <div className="flex items-center gap-2 text-xs text-text-subtle">
              <Bot className="w-4 h-4 animate-spin text-primary-light" />
              <span>AI Research Copilot retrieving knowledge base context...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-3 bg-[#0B1120] border-t border-card-border/60 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-text-subtle flex items-center gap-1 px-1">
            <HelpCircle className="w-3 h-3 text-primary-light" /> 12 RAG Research Prompts
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] bg-card border border-card-border hover:border-primary/40 text-text-muted hover:text-text-main px-3 py-1 rounded-xl whitespace-nowrap transition-colors shrink-0 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Multiline Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-[#0F172A] border-t border-card-border/60 flex items-center gap-3"
        >
          <textarea
            rows={1}
            placeholder="Ask AI Copilot about your claims, scores, prior art, tech trends, or applicant portfolios..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-card border border-card-border rounded-xl p-3 text-xs text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary resize-none font-sans"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            loading={generating}
            className="shadow-glow-primary shrink-0 font-bold"
          >
            Send
          </Button>
        </form>

      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT PANEL: Active Patent Context & Clickable Source Corpus (320px) */}
      {/* ========================================================================= */}
      <div className="w-80 hidden xl:flex flex-col gap-4 shrink-0 overflow-y-auto">
        
        {/* Active Context Card */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="text-[10px] uppercase font-bold text-primary-light flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Active Invention Context
            </span>
            <Badge variant="success" size="sm">{patentContext.category}</Badge>
          </div>

          <h3 className="text-xs font-bold text-text-main leading-snug">{patentContext.title}</h3>
          <p className="font-mono text-[11px] text-primary-light">{patentContext.submissionId}</p>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
            <span className="text-text-subtle">Novelty Rating</span>
            <span className="font-mono font-extrabold text-success text-base">{patentContext.noveltyScore}%</span>
          </div>
        </Card>

        {/* RAG Prior Art Corpus Cards */}
        <Card className="p-4 space-y-3 flex-1">
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
            RAG Prior Art Corpus
          </h4>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => navigate('/dashboard/research')}
              className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border hover:border-primary/50 cursor-pointer space-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-primary-light font-bold">US-2026-0098412-A1</span>
                <span className="text-[10px] text-success font-mono">94.8% Overlap</span>
              </div>
              <p className="text-text-main font-bold text-[11px]">Quantum Micro-Fluidic Neural Processing Unit</p>
              <span className="text-[10px] text-text-subtle">Quantum Dynamics Inc</span>
            </div>

            <div
              onClick={() => navigate('/dashboard/research')}
              className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border hover:border-primary/50 cursor-pointer space-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-secondary-light font-bold">US-2026-0084719-A1</span>
                <span className="text-[10px] text-warning font-mono">88.2% Overlap</span>
              </div>
              <p className="text-text-main font-bold text-[11px]">Autonomous UAV Swarm Collision Avoidance</p>
              <span className="text-[10px] text-text-subtle">AeroSwarm Robotics Inc</span>
            </div>

            <div
              onClick={() => navigate('/dashboard/research')}
              className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border hover:border-primary/50 cursor-pointer space-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-success font-bold">EP-3940192-B1</span>
                <span className="text-[10px] text-success font-mono">96.1% Overlap</span>
              </div>
              <p className="text-text-main font-bold text-[11px]">Subcutaneous Enzymatic Graphene Glucose Sensor</p>
              <span className="text-[10px] text-text-subtle">BioSensors European SE</span>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default AiAssistantView;
