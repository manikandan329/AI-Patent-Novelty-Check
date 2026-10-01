import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, X, User, CornerDownRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

export const CommentThreadDrawer = ({ isOpen, onClose, comments = [], onAddComment, onReply, onToggleResolve }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedField, setSelectedField] = useState('Novel Features');
  const [replyInputMap, setReplyInputMap] = useState({});

  if (!isOpen) return null;

  const handleCreateComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(selectedField, selectedField, newCommentText);
    setNewCommentText('');
    toast.success('Comment thread added!');
  };

  const handleSendReply = (commentId) => {
    const text = replyInputMap[commentId];
    if (!text?.trim()) return;

    onReply(commentId, text);
    setReplyInputMap({ ...replyInputMap, [commentId]: '' });
    toast.success('Reply posted!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/80 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-md bg-[#0B1120] border-l border-card-border shadow-2xl flex flex-col justify-between h-full"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-card-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-light" />
              <div>
                <h3 className="text-sm font-bold text-text-main">Inline Patent Comment Threads</h3>
                <p className="text-[10px] text-text-subtle">{comments.length} Active Field Discussions</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-text-subtle hover:text-text-main">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Comment Creator Box */}
          <form onSubmit={handleCreateComment} className="p-4 bg-[#0F172A] border-b border-card-border/60 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Target Patent Field</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full bg-card border border-card-border rounded-xl p-2 text-xs text-text-main focus:outline-none"
              >
                <option value="Novel Features">Novel Features</option>
                <option value="Problem Statement">Problem Statement</option>
                <option value="Working Principle">Working Principle</option>
                <option value="Action Recommendations">Action Recommendations</option>
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Leave feedback or request clarification..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full bg-card border border-card-border rounded-xl p-2.5 text-xs text-text-main focus:outline-none"
            />

            <Button type="submit" variant="primary" size="sm" icon={Send} className="w-full justify-center text-xs">
              Post Comment Thread
            </Button>
          </form>

          {/* Comments List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {comments.map((comm) => (
              <div key={comm.id} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border space-y-3">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm">{comm.field}</Badge>
                  <button
                    onClick={() => onToggleResolve(comm.id)}
                    className={`text-[10px] flex items-center gap-1 font-bold ${
                      comm.resolved ? 'text-success' : 'text-text-subtle hover:text-success'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {comm.resolved ? 'Resolved' : 'Mark Resolved'}
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-text-main">{comm.author} ({comm.role})</span>
                    <span className="text-[10px] text-text-subtle font-mono">{comm.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{comm.text}</p>
                </div>

                {/* Replies */}
                {comm.replies?.length > 0 && (
                  <div className="pl-3 border-l-2 border-primary/30 space-y-2 pt-1">
                    {comm.replies.map((rep) => (
                      <div key={rep.id} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-primary-light text-[11px]">
                          <CornerDownRight className="w-3 h-3" />
                          <span>{rep.author} ({rep.role})</span>
                        </div>
                        <p className="text-text-muted leading-relaxed pl-4">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyInputMap[comm.id] || ''}
                    onChange={(e) => setReplyInputMap({ ...replyInputMap, [comm.id]: e.target.value })}
                    className="flex-1 bg-card border border-card-border rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleSendReply(comm.id)} className="text-xs px-2">
                    Reply
                  </Button>
                </div>

              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommentThreadDrawer;
