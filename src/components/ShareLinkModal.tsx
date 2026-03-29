import React, { useState, useMemo } from 'react';
import { X, Copy, ExternalLink, Check, Link as LinkIcon, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { Client, Post } from '../types';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  posts: Post[];
  onSimulate: (month?: string) => void;
}

export function ShareLinkModal({ isOpen, onClose, client, posts, onSimulate }: ShareLinkModalProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Extract available months from client's posts
  const availableMonths = useMemo(() => {
    const clientPosts = posts.filter(p => p.clientId === client.id);
    const months = new Set<string>();
    
    clientPosts.forEach(post => {
      const date = new Date(post.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });

    return Array.from(months).sort().reverse();
  }, [posts, client.id]);

  // Simulate a realistic approval URL
  const approvalUrl = `${window.location.origin}?mode=client&id=${client.id}${selectedMonth ? `&month=${selectedMonth}` : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(approvalUrl);
      setCopied(true);
      addToast('Link copiado para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Erro ao copiar o link.', 'error');
    }
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden border border-transparent dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-sky-600" />
                  Link de Aprovação
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <p className="text-sm text-sky-800 mb-2 font-medium">
                    Compartilhe este link com {client.name}:
                  </p>
                  <p className="text-xs text-sky-600/80 leading-relaxed">
                    O cliente terá acesso apenas à visualização e aprovação dos posts desta conta. Nenhuma outra informação da agência será visível.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Filtrar por Mês (Opcional)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none appearance-none"
                    >
                      <option value="">Todos os meses</option>
                      {availableMonths.map(month => (
                        <option key={month} value={month}>
                          {formatMonth(month)}
                        </option>
                      ))}
                    </select>
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Link Personalizado
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono truncate select-all">
                      {approvalUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-600 dark:hover:text-sky-400 text-gray-600 dark:text-gray-300 px-4 rounded-xl transition-all flex items-center justify-center shadow-sm"
                      title="Copiar Link"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSimulate(selectedMonth);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors border border-sky-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Simular Acesso do Cliente
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
