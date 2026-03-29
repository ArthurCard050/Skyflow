import React, { useState, useEffect } from 'react';
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
}

export function NewPostModal({ isOpen, onClose, onSave, clients, batches = [], selectedClientId, post }: NewPostModalProps) {
  const { addToast } = useToast();
  const [clientId, setClientId] = useState(selectedClientId);
  const [batchId, setBatchId] = useState<string>('');
  const [platform, setPlatform] = useState<'Instagram' | 'LinkedIn' | 'Facebook'>('Instagram');
  const [date, setDate] = useState('2026-03-01');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setClientId(post.clientId);
        setBatchId(post.batchId || '');
        setPlatform(post.platform);
        setDate(post.date);
        setCaption(post.caption);
        setImageUrl(post.imageUrl);
      } else {
        setClientId(selectedClientId);
        setBatchId('');
        resetForm();
      }
    }
  }, [isOpen, selectedClientId, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      addToast('Por favor, adicione uma imagem.', 'error');
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
      status: post?.status || 'pending',
      rating: post?.rating,
      feedback: post?.feedback,
      title: post?.title || 'Novo Post',
      version: post?.version || 1,
      commentsCount: post?.commentsCount || 0,
      createdAt: post?.createdAt || new Date().toISOString(),
      createdBy: post?.createdBy || 'Ana Silva', // Hardcoded for now as we don't have auth context here
      history: post?.history || [
        { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'created', 
          user: 'Ana Silva', 
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
    setDate('2026-03-01');
    setPlatform('Instagram');
    setBatchId('');
  };

  // Simulate file upload
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In a real app, we would handle the file here. 
    // For demo, we'll just set a random image if they drop something
    setImageUrl(`https://picsum.photos/seed/${Math.random()}/800/800`);
    addToast('Imagem carregada com sucesso!', 'success');
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
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Mídia</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        className={`
                          relative aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-6
                          ${imageUrl ? 'border-transparent' : isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-gray-50 dark:hover:bg-gray-800'}
                        `}
                      >
                        {imageUrl ? (
                          <div className="relative w-full h-full group">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pointer-events-none">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Arraste e solte sua imagem</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ou clique para gerar aleatoriamente</p>
                            </div>
                          </div>
                        )}
                        {/* Hidden click trigger for demo purposes */}
                        {!imageUrl && (
                          <button
                            type="button"
                            onClick={() => setImageUrl(`https://picsum.photos/seed/${Math.random()}/800/800`)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        )}
                      </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
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
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lote (Opcional)</label>
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

                      <div className="grid grid-cols-2 gap-4">
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Legenda</label>
                        <div className="relative">
                          <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Escreva uma legenda incrível..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm min-h-[120px] resize-none dark:text-white"
                          />
                          <Type className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 bottom-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
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
                  {post ? 'Salvar Alterações' : 'Publicar Post'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
