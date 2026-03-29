import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Calendar, Image as ImageIcon, Type, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Post, Batch } from '../types';
import { useToast } from './Toast';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  clients: Client[];
  batches?: Batch[];
  selectedClientId: string;
  post?: Post | null;
  defaultDate?: string;
  currentUser?: string;
}

export function NewPostModal({ isOpen, onClose, onSave, clients, batches = [], selectedClientId, post, defaultDate, currentUser = 'Ana Silva' }: NewPostModalProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientId, setClientId] = useState(selectedClientId);
  const [batchId, setBatchId] = useState<string>('');
  const [platform, setPlatform] = useState<'Instagram' | 'LinkedIn' | 'Facebook'>('Instagram');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setClientId(post.clientId);
        setBatchId(post.batchId || '');
        setPlatform(post.platform);
        setDate(post.date);
        setCaption(post.caption);
        setTitle(post.title || '');
        setImageUrl(post.imageUrl);
      } else {
        setClientId(selectedClientId);
        setBatchId('');
        setTitle('');
        resetForm();
        if (defaultDate) setDate(defaultDate);
      }
    }
  }, [isOpen, selectedClientId, post, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      addToast('Por favor, adicione uma imagem.', 'error');
      return;
    }

    if (!caption.trim()) {
      addToast('Por favor, escreva uma legenda.', 'error');
      return;
    }

    const newPost: Post = {
      id: post?.id || Math.random().toString(36).substr(2, 9),
      clientId,
      batchId: batchId || undefined,
      platform,
      date,
      caption,
      imageUrl,
      status: post?.status || 'copy_production',
      rating: post?.rating,
      feedback: post?.feedback,
      title: title.trim() || `Post ${platform} — ${new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`,
      version: post ? (post.version || 0) + 1 : 1,
      commentsCount: post?.commentsCount || 0,
      createdAt: post?.createdAt || new Date().toISOString(),
      createdBy: post?.createdBy || currentUser,
      history: post?.history || [
        { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'created', 
          user: currentUser, 
          timestamp: new Date().toISOString() 
        }
      ]
    };

    onSave(newPost);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCaption('');
    setImageUrl('');
    setTitle('');
    setDate(defaultDate || new Date().toISOString().split('T')[0]);
    setPlatform('Instagram');
    setBatchId('');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione um arquivo de imagem.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Imagem muito grande. Máximo 10MB.', 'error');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setIsUploading(false);
      addToast('Imagem carregada com sucesso!', 'success');
    };
    reader.onerror = () => {
      setIsUploading(false);
      addToast('Erro ao ler o arquivo.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post ? 'Editar Post' : 'Novo Post'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{post ? 'Atualize o conteúdo do post.' : 'Crie e agende conteúdo para seus clientes.'}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <form id="new-post-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Image Upload */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Mídia</label>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => !imageUrl && fileInputRef.current?.click()}
                        className={`
                          relative aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-6 cursor-pointer
                          ${imageUrl ? 'border-transparent cursor-default' : isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-gray-800'}
                        `}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando imagem...</p>
                          </div>
                        ) : imageUrl ? (
                          <div className="relative w-full h-full group">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg mr-2 hover:bg-gray-50"
                              >
                                Trocar
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:bg-red-600"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 pointer-events-none">
                            <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto">
                              <Upload className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Clique para selecionar</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ou arraste e solte aqui</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">PNG, JPG, WebP — Máx. 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Título <span className="text-gray-400 font-normal">(opcional)</span></label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: Lançamento Produto X"
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cliente</label>
                          <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                          >
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lote</label>
                          <div className="relative">
                            <select
                              value={batchId}
                              onChange={(e) => setBatchId(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                            >
                              <option value="">Sem lote</option>
                              {batches.filter(b => b.clientId === clientId).map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                            <Folder className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Plataforma</label>
                          <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                          >
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Facebook">Facebook</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Data</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                            />
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Legenda <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Escreva uma legenda incrível..."
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm min-h-[120px] resize-none dark:text-white"
                          />
                          <span className="absolute right-3 bottom-3 text-[10px] text-gray-400">{caption.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center gap-3">
                {post && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">v{post.version} → v{(post.version || 0) + 1}</span>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="new-post-form"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-200 dark:shadow-sky-900/30 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {post ? 'Salvar Alterações' : 'Criar Post'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
