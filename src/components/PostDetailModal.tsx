import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { canEditPost, canMovePost } from '../services/permissionService';
import { UserRole, PostStatus, Post, ActionHistory, MediaItem } from '../types';
import { X, Check, MessageSquare, Clock, History, AlertCircle, Edit2, Lock, Save, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MediaCarousel } from './MediaCarousel';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  userRole: UserRole;
  onApprove: (id: string, rating: number) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onAddComment: (id: string, comment: string) => void;
  onEdit?: (post: Post) => void;
  onStatusChange?: (id: string, status: PostStatus) => void;
}

const STATUS_OPTIONS: { group: string; color: string; items: { id: PostStatus; label: string }[] }[] = [
  {
    group: '📝 Copy',
    color: 'text-blue-600',
    items: [
      { id: 'copy_production', label: 'Produção' },
      { id: 'copy_sent', label: 'Enviado' },
      { id: 'copy_changes', label: 'Ajustes' },
      { id: 'copy_approved', label: 'Aprovado' },
    ]
  },
  {
    group: '🎨 Design',
    color: 'text-purple-600',
    items: [
      { id: 'design_production', label: 'Produção' },
      { id: 'design_sent', label: 'Enviado' },
      { id: 'design_changes', label: 'Ajustes' },
      { id: 'design_approved', label: 'Aprovado' },
    ]
  },
  {
    group: '📅 Publicação',
    color: 'text-sky-600',
    items: [
      { id: 'scheduling', label: 'Agendamento' },
      { id: 'scheduled', label: 'Agendado' },
      { id: 'published', label: 'Publicado' },
    ]
  },
];

const STATUS_LABEL: Record<PostStatus, string> = {
  copy_production: 'Copy: Produção',
  copy_sent: 'Copy: Enviado',
  copy_changes: 'Copy: Ajustes',
  copy_approved: 'Copy: Aprovado',
  design_production: 'Design: Produção',
  design_sent: 'Design: Enviado',
  design_changes: 'Design: Ajustes',
  design_approved: 'Design: Aprovado',
  scheduling: 'Agendamento',
  scheduled: 'Agendado',
  published: 'Publicado',
};

const STATUS_COLOR: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
  changes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  production: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  sent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  published: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  scheduling: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
};

function getStatusColorClass(status: PostStatus): string {
  for (const [key, cls] of Object.entries(STATUS_COLOR)) {
    if (status === key || status.includes(key)) return cls;
  }
  return STATUS_COLOR.production;
}

export function PostDetailModal({ 
  isOpen, 
  onClose, 
  post, 
  userRole, 
  onApprove, 
  onRequestChanges, 
  onAddComment,
  onEdit,
  onStatusChange
}: PostDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'briefing' | 'history' | 'comments'>('details');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [actionState, setActionState] = useState<'idle' | 'approving' | 'rejecting'>('idle');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!isOpen || !post) return null;

  const isAgency = userRole !== 'client';
  const isLocked = post.status === 'published';
  const canEdit = canEditPost(userRole, post);
  const canApprove = (userRole === 'client' && !isLocked && !post.status.includes('approved'));

  const handleApprove = () => {
    if (userRole === 'client') {
      if (rating > 0) {
        onApprove(post.id, rating);
        setActionState('idle');
        onClose();
      }
    } else {
      onApprove(post.id, 0);
      setActionState('idle');
      onClose();
    }
  };

  const handleRequestChanges = () => {
    if (feedback.trim()) {
      onRequestChanges(post.id, feedback);
      setActionState('idle');
      onClose();
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(post.id, comment);
      setComment('');
    }
  };

  const handleStatusSelect = (newStatus: PostStatus) => {
    if (newStatus !== post.status && onStatusChange) {
      if (canMovePost(userRole, post.status, newStatus)) {
        onStatusChange(post.id, newStatus);
        setStatusDropdownOpen(false);
      }
    } else {
      setStatusDropdownOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-md">
                {post.title || 'Detalhes do Post'}
              </h2>

              {/* Status Badge / Dropdown */}
              {isAgency && !isLocked ? (
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 uppercase transition-all hover:shadow-md cursor-pointer",
                      getStatusColorClass(post.status)
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", 
                       post.status.includes('approved') ? "bg-emerald-500" :
                       post.status.includes('changes') ? "bg-orange-500" :
                       post.status === 'published' ? "bg-green-500" : "bg-blue-500"
                    )} />
                    {STATUS_LABEL[post.status]}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", statusDropdownOpen && "rotate-180")} />
                  </button>

                  {statusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setStatusDropdownOpen(false)} />
                      <div className="absolute top-full mt-2 left-0 z-30 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 max-h-72 overflow-y-auto">
                        {STATUS_OPTIONS.map((group) => (
                          <div key={group.group}>
                            <div className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider", group.color)}>
                              {group.group}
                            </div>
                            {group.items.map((item) => {
                              const isCurrent = post.status === item.id;
                              const allowed = canMovePost(userRole, post.status, item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleStatusSelect(item.id)}
                                  disabled={!allowed && !isCurrent}
                                  className={cn(
                                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors",
                                    isCurrent
                                      ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-semibold"
                                      : allowed
                                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                      : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                  )}
                                >
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-sky-600" />}
                                  {!isCurrent && allowed && <ArrowRight className="w-3.5 h-3.5 opacity-40" />}
                                  {!isCurrent && !allowed && <Lock className="w-3 h-3 opacity-30" />}
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 uppercase",
                  getStatusColorClass(post.status)
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", 
                     post.status.includes('approved') ? "bg-emerald-500" :
                     post.status.includes('changes') ? "bg-orange-500" :
                     post.status === 'published' ? "bg-green-500" : "bg-blue-500"
                  )} />
                  {STATUS_LABEL[post.status]}
                </span>
              )}

              {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left: Preview */}
            <div className="w-full md:w-1/2 bg-gray-50 dark:bg-black/20 p-6 flex justify-center overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-gray-800">
              <div className="max-w-sm w-full space-y-4 h-fit my-auto">
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative group">
                  <MediaCarousel media={post.media} expandable={false} />
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-2.5 w-24 bg-gray-200 rounded mb-1" />
                      <div className="h-2 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {post.caption}
                  </p>
                  <div className="mt-3 flex gap-2 text-blue-600 text-xs font-medium">
                    {post.caption.match(/#\w+/g)?.map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions & Details */}
            <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-900">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'details' 
                      ? "border-sky-500 text-sky-600 dark:text-sky-400" 
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Detalhes
                </button>
                {isAgency && (
                  <button
                    onClick={() => setActiveTab('briefing')}
                    className={cn(
                      "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'briefing' 
                        ? "border-sky-500 text-sky-600 dark:text-sky-400" 
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Briefing 🎨
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'history' 
                      ? "border-sky-500 text-sky-600 dark:text-sky-400" 
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Histórico
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'comments' 
                      ? "border-sky-500 text-sky-600 dark:text-sky-400" 
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Comentários ({post.commentsCount})
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Versão</span>
                        <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">v{post.version}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Plataforma</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{post.platform}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Agendado para</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(new Date(post.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Criado por</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{post.createdBy || 'Sistema'}</p>
                      </div>
                    </div>

                    {/* Client Actions: Approve / Request Changes */}
                    {!isLocked && userRole === 'client' && canApprove && (
                      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {actionState === 'idle' ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setActionState('approving')}
                              className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Aprovar
                            </button>
                            <button
                              onClick={() => setActionState('rejecting')}
                              className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Solicitar Ajustes
                            </button>
                          </div>
                        ) : actionState === 'approving' ? (
                          <div className="space-y-3 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Avalie este conteúdo:</p>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRating(star)}
                                  className={cn(
                                    "p-1 transition-transform hover:scale-110 text-2xl",
                                    star <= rating ? "text-yellow-400" : "text-gray-300"
                                  )}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleApprove}
                                disabled={rating === 0}
                                className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setActionState('idle')}
                                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Descreva o que precisa ser ajustado..."
                              className="w-full p-3 text-sm border border-orange-200 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleRequestChanges}
                                disabled={!feedback.trim()}
                                className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                              >
                                Enviar Solicitação
                              </button>
                              <button
                                onClick={() => setActionState('idle')}
                                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Agency Actions: Edit */}
                    {isAgency && !isLocked && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => onEdit && onEdit(post)}
                          className="flex-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-4 py-2.5 rounded-xl font-medium hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar Post
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'briefing' && isAgency && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 flex items-center rounded-lg">
                        <Lock className="w-3 h-3 mr-1" /> Interno - Invisível para Clientes
                      </p>
                      <button
                        onClick={() => onEdit && onEdit(post)}
                        className="text-xs font-medium text-sky-600 hover:underline flex items-center"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Editar Briefing
                      </button>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-800">
                      <h3 className="text-sm font-bold text-sky-800 dark:text-sky-300 mb-2 flex items-center gap-2">
                        Pilar de Conteúdo
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.contentPillar || 'Não definido.'}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                      <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                        Direção de Arte / Ideia Visual
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.visualDirection || 'Nenhuma direção de arte especificada.'}
                      </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                      <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                        Draft de Copy / Roteiro
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.videoScript || 'Nenhum roteiro especificado.'}
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                        Call to Action (CTA)
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.cta || 'Nenhum CTA especificado.'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-2">
                    {post.history?.map((action, index) => (
                      <div key={action.id || index} className="relative">
                        <div className={cn(
                          "absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
                          action.type === 'created' && "bg-blue-500",
                          action.type === 'approved' && "bg-emerald-500",
                          action.type === 'status_change' && "bg-orange-500",
                          action.type === 'comment' && "bg-gray-400"
                        )} />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {action.type === 'created' && 'Post Criado'}
                            {action.type === 'approved' && 'Aprovado'}
                            {action.type === 'status_change' && 'Status Alterado'}
                            {action.type === 'comment' && 'Comentário Adicionado'}
                            {action.type === 'updated' && 'Post Atualizado'}
                          </span>
                          <span className="text-xs text-gray-500">
                            por <span className="font-medium text-gray-700 dark:text-gray-300">{action.user}</span> • {format(new Date(action.timestamp), "dd/MM/yyyy HH:mm")}
                          </span>
                          {action.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                              {action.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 mb-4">
                      {post.history?.filter(h => h.type === 'comment').length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum comentário ainda.</p>
                        </div>
                      ) : (
                        post.history?.filter(h => h.type === 'comment').map((comment) => (
                          <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.user}</span>
                              <span className="text-[10px] text-gray-400">{format(new Date(comment.timestamp), "dd/MM HH:mm")}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{comment.details}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Escreva um comentário..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!comment.trim()}
                          className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
