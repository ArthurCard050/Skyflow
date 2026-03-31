import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FileText, Trash2, Save, X, MessageSquare, Loader2, Edit2, Send } from 'lucide-react';
import { Briefing, BriefingComment, Client } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { dbService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { ROLE_PERMISSIONS } from '../config/roleConfig';
import { storageService } from '../services/storage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BriefingViewProps {
  selectedClientId: string;
  clients: Client[];
}

export function BriefingView({ selectedClientId, clients }: BriefingViewProps) {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [comment, setComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const contentRef = useRef<Record<string, any>>({});

  const permissions = profile ? ROLE_PERMISSIONS[profile.role] : null;
  const canEdit = permissions?.canEditBriefing ?? false;
  const canComment = permissions?.canCommentBriefing ?? false;
  const currentClient = clients.find(c => c.id === selectedClientId);

  useEffect(() => {
    loadBriefings();
  }, [selectedClientId]);

  const loadBriefings = async () => {
    setIsLoading(true);
    setSelectedBriefing(null);
    try {
      const data = await dbService.getBriefings(selectedClientId);
      setBriefings(data);
    } catch (err: any) {
      addToast('Erro ao carregar briefings: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBriefing = async () => {
    if (!profile) return;
    const newBriefing: Partial<Briefing> & { ownerId: string } = {
      clientId: selectedClientId,
      ownerId: profile.ownerId,
      title: 'Novo Briefing',
      content: {},
      createdBy: profile.id,
      updatedBy: profile.id,
    };
    setIsSaving(true);
    try {
      const saved = await dbService.upsertBriefing(newBriefing);
      setBriefings(prev => [saved, ...prev]);
      setSelectedBriefing(saved);
      setEditTitle(saved.title);
      contentRef.current = saved.content;
      setIsDirty(false);
      addToast('Briefing criado!', 'success');
    } catch (err: any) {
      addToast('Erro: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectBriefing = (b: Briefing) => {
    setSelectedBriefing(b);
    setEditTitle(b.title);
    contentRef.current = b.content;
    setIsDirty(false);
  };

  const handleSave = async () => {
    if (!selectedBriefing || !profile) return;
    setIsSaving(true);
    try {
      const updated = await dbService.upsertBriefing({
        id: selectedBriefing.id,
        clientId: selectedBriefing.clientId,
        ownerId: profile.ownerId,
        title: editTitle,
        content: contentRef.current,
        updatedBy: profile.id,
      });
      setBriefings(prev => prev.map(b => b.id === updated.id ? { ...updated, comments: selectedBriefing.comments } : b));
      setSelectedBriefing(prev => prev ? { ...prev, ...updated } : updated);
      setIsDirty(false);
      addToast('Briefing salvo!', 'success');
    } catch (err: any) {
      addToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (briefingId: string) => {
    try {
      await dbService.deleteBriefing(briefingId);
      setBriefings(prev => prev.filter(b => b.id !== briefingId));
      if (selectedBriefing?.id === briefingId) setSelectedBriefing(null);
      setShowDeleteConfirm(null);
      addToast('Briefing excluído.', 'success');
    } catch (err: any) {
      addToast('Erro: ' + err.message, 'error');
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !selectedBriefing || !profile) return;
    setIsPostingComment(true);
    try {
      await dbService.addBriefingComment(selectedBriefing.id, profile.id, comment.trim());
      const newComment: BriefingComment = {
        id: Math.random().toString(36),
        briefingId: selectedBriefing.id,
        userId: profile.id,
        userName: profile.name,
        userAvatar: profile.avatar,
        content: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      setSelectedBriefing(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment],
      } : prev);
      setComment('');
      addToast('Comentário adicionado!', 'success');
    } catch (err: any) {
      addToast('Erro: ' + err.message, 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Left: Briefing List */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Briefings</h2>
            <p className="text-xs text-gray-500">{currentClient?.name}</p>
          </div>
          {canEdit && (
            <button
              onClick={handleCreateBriefing}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg transition-colors shadow-md shadow-sky-200 dark:shadow-sky-900/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5">
          {briefings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem briefings ainda.</p>
              {canEdit && <p className="text-xs mt-1">Crie o primeiro acima.</p>}
            </div>
          ) : (
            briefings.map(b => (
              <motion.button
                key={b.id}
                onClick={() => handleSelectBriefing(b)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition-all group relative ${
                  selectedBriefing?.id === b.id
                    ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'
                    : 'bg-white/60 dark:bg-gray-800/60 border-white/40 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <p className={`text-sm font-medium truncate ${selectedBriefing?.id === b.id ? 'text-sky-700 dark:text-sky-300' : 'text-gray-900 dark:text-white'}`}>
                  {b.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDistanceToNow(new Date(b.updatedAt), { locale: ptBR, addSuffix: true })}
                </p>
                <p className="text-xs text-gray-400">
                  {b.comments?.length || 0} comentário{(b.comments?.length || 0) !== 1 ? 's' : ''}
                </p>
                {canEdit && (
                  <button
                    onClick={e => { e.stopPropagation(); setShowDeleteConfirm(b.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Right: Editor + Comments */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {selectedBriefing ? (
          <>
            {/* Title bar */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedBriefing(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
                title="Fechar briefing"
              >
                <X className="w-5 h-5" />
              </button>
              {canEdit ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => { setEditTitle(e.target.value); setIsDirty(true); }}
                  className="flex-1 min-w-0 text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-sky-400 outline-none text-gray-900 dark:text-white transition-colors py-1 truncate"
                  placeholder="Título do briefing..."
                />
              ) : (
                <h3 className="flex-1 min-w-0 text-2xl font-bold text-gray-900 dark:text-white truncate">{selectedBriefing.title}</h3>
              )}
              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md disabled:opacity-50 shrink-0"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              )}
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
              <RichTextEditor
                key={selectedBriefing.id}
                content={selectedBriefing.content}
                editable={canEdit}
                onChange={json => { contentRef.current = json; setIsDirty(true); }}
                onImageUpload={canEdit ? async (file) => {
                  if (!profile) throw new Error('No profile');
                  return storageService.uploadMedia(file, profile.ownerId);
                } : undefined}
                placeholder="Descreva o briefing completo aqui: objetivos, tom de voz, referências visuais, público-alvo..."
              />
            </div>

            {/* Comments */}
            {canComment && (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-500" />
                  Comentários ({selectedBriefing.comments?.length || 0})
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                  {(selectedBriefing.comments || []).map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {c.userAvatar}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.userName}</span>
                          <span className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(c.createdAt), { locale: ptBR, addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePostComment()}
                    placeholder="Escreva um comentário..."
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!comment.trim() || isPostingComment}
                    className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isPostingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Selecione um briefing</p>
            <p className="text-sm mt-1">
              {canEdit ? 'ou crie um novo para começar.' : 'para visualizar o conteúdo.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full pointer-events-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir Briefing?</h3>
                <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita. Todos os comentários serão removidos.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => handleDelete(showDeleteConfirm!)}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
