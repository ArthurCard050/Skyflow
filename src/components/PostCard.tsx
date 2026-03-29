import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Star, MessageSquare, Instagram, Facebook, Linkedin, ChevronDown, ChevronUp, Maximize2, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Post, PostStatus } from '../types';
import { cn } from '../lib/utils';

interface PostCardProps {
  post: Post;
  onApprove: (id: string, rating: number) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onImageClick: (url: string) => void;
  onEdit?: (post: Post) => void;
  onMarkAsPublished?: (id: string) => void;
  onDelete?: (id: string) => void;
  userRole: 'agency' | 'client';
  id?: string;
  highlighted?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onApprove, 
  onRequestChanges, 
  onImageClick, 
  onEdit,
  onMarkAsPublished,
  onDelete,
  userRole,
  id,
  highlighted 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'approving' | 'rejecting'>('idle');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleApproveClick = () => setActionState('approving');
  const handleRejectClick = () => setActionState('rejecting');
  const handleCancelAction = () => {
    setActionState('idle');
    setRating(0);
    setFeedback('');
  };

  const submitApproval = () => {
    if (rating > 0) {
      onApprove(post.id, rating);
      setActionState('idle');
    }
  };

  const submitFeedback = () => {
    if (feedback.trim()) {
      onRequestChanges(post.id, feedback);
      setActionState('idle');
    }
  };

  const PlatformIcon = {
    Instagram: Instagram,
    Facebook: Facebook,
    LinkedIn: Linkedin,
  }[post.platform];

  return (
    <motion.div
      id={id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/40 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-sky-200/50 dark:hover:border-sky-900/50 group/card hover:-translate-y-1",
        post.status.includes('production') && "border-l-[6px] border-l-gray-300",
        post.status.includes('sent') && "border-l-[6px] border-l-sky-500",
        post.status.includes('approved') && "border-l-[6px] border-l-emerald-500 opacity-95",
        post.status.includes('changes') && "border-l-[6px] border-l-orange-500",
        post.status === 'published' && "border-l-[6px] border-l-blue-500 opacity-90",
        highlighted && "ring-4 ring-sky-200 dark:ring-sky-900 shadow-xl scale-[1.02] z-10"
      )}
    >
      <div className="p-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
        {/* Image Section */}
        <div 
          className="relative group aspect-square md:aspect-[4/5] md:h-auto rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-zoom-in shadow-inner"
          onClick={() => onImageClick(post.imageUrl)}
        >
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
             <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
               <Maximize2 className="text-white w-6 h-6" />
             </div>
          </div>
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
            <PlatformIcon className="w-3.5 h-3.5" />
            {post.platform}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col h-full py-1">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Conteúdo de {post.platform}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={post.status} />
              {userRole === 'agency' && onEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                  title="Editar Post"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {userRole === 'agency' && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(post.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Excluir Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <div className="relative">
              <p className={cn(
                "text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-[15px]",
                !isExpanded && "line-clamp-4"
              )}>
                {post.caption}
              </p>
              {post.caption.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sky-600 dark:text-sky-400 text-xs font-semibold mt-2 flex items-center gap-1 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                >
                  {isExpanded ? (
                    <>Ver menos <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Ver mais <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <AnimatePresence mode="wait">
              {/* Only show actions if user is client and post is pending approval */}
              {userRole === 'client' && (post.status === 'copy_sent' || post.status === 'design_sent') && actionState === 'idle' && (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={handleApproveClick}
                    className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar Conteúdo
                  </button>
                  <button
                    onClick={handleRejectClick}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Solicitar Ajuste
                  </button>
                </motion.div>
              )}

              {/* Agency View for Pending Posts */}
              {userRole === 'agency' && (post.status === 'copy_sent' || post.status === 'design_sent') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700"
                >
                  <Clock className="w-5 h-5 text-sky-500" />
                  <span className="text-sm font-medium">Aguardando aprovação do cliente</span>
                </motion.div>
              )}

              {actionState === 'approving' && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Como você avalia este conteúdo?</span>
                    <button onClick={handleCancelAction} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-3 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors drop-shadow-sm",
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600 fill-gray-100 dark:fill-gray-800"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={submitApproval}
                    disabled={rating === 0}
                    className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-100 dark:shadow-emerald-900/20"
                  >
                    Confirmar Aprovação
                  </button>
                </motion.div>
              )}

              {actionState === 'rejecting' && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">O que precisa ser ajustado?</span>
                    <button onClick={handleCancelAction} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Descreva as alterações necessárias com detalhes..."
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none h-32 bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm"
                  />
                  <button
                    onClick={submitFeedback}
                    disabled={!feedback.trim()}
                    className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-100 dark:shadow-orange-900/20"
                  >
                    Enviar Solicitação
                  </button>
                </motion.div>
              )}

              {post.status.includes('approved') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4 text-emerald-800 dark:text-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Aprovado</span>
                      <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">Este post está pronto para publicação.</span>
                    </div>
                    {post.rating && (
                      <div className="ml-auto flex gap-0.5 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < post.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {userRole === 'agency' && onMarkAsPublished && (
                    <button
                      onClick={() => onMarkAsPublished(post.id)}
                      className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Publicado
                    </button>
                  )}
                </motion.div>
              )}

              {post.status.includes('changes') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-3 text-orange-800 dark:text-orange-200 bg-orange-50/50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-800/30"
                >
                  <div className="flex items-center gap-3 font-bold text-sm text-orange-900 dark:text-orange-100">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    Alterações Solicitadas
                  </div>
                  <p className="text-sm text-orange-800/90 dark:text-orange-200/90 pl-11 leading-relaxed">
                    "{post.feedback}"
                  </p>
                </motion.div>
              )}
              {post.status === 'published' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 text-blue-800 dark:text-blue-200 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/30"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Publicado</span>
                    <span className="text-xs text-blue-700/80 dark:text-blue-300/80">Este post já foi publicado.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const getConfig = (s: PostStatus) => {
    if (s.includes('approved')) return {
      bg: "bg-emerald-50/50 backdrop-blur-sm",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200/50 dark:border-emerald-800/50",
      dot: "bg-emerald-500",
      label: s.replace('_', ' ').toUpperCase(),
      icon: Check
    };
    if (s.includes('changes')) return {
      bg: "bg-orange-50/50 backdrop-blur-sm",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200/50 dark:border-orange-800/50",
      dot: "bg-orange-500",
      label: "Ajustes",
      icon: AlertCircle
    };
    if (s === 'published') return {
      bg: "bg-blue-50/50 backdrop-blur-sm",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200/50 dark:border-blue-800/50",
      dot: "bg-blue-500",
      label: "Publicado",
      icon: Check
    };
    // Default (Pending/Production/Sent)
    return {
      bg: "bg-sky-50/50 backdrop-blur-sm",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-200/50 dark:border-sky-800/50",
      dot: "bg-sky-500",
      label: s.replace('_', ' ').toUpperCase(),
      icon: Clock
    };
  };

  const config = getConfig(status);
  const Icon = config.icon;

  return (
    <span className={cn(
      "pl-2 pr-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors",
      config.bg,
      config.text,
      config.border
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
