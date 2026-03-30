import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, FileSpreadsheet, Type, UploadCloud, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';
import { Post } from '../types';
import { parseCalendarToPosts } from '../services/aiService';
import * as XLSX from 'xlsx';

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (posts: Post[]) => void;
  clientId: string;
  currentUser: string;
}

export function AIImportModal({ isOpen, onClose, onImport, clientId, currentUser }: AIImportModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        setFileInput(file);
      } else {
        addToast('Por favor, envie apenas arquivos Excel (.xlsx) ou CSV.', 'error');
      }
    }
  }, [addToast]);

  const readExcelFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csvText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleGenerate = async () => {
    let rawContent = '';

    if (activeTab === 'text') {
      if (!textInput.trim()) {
        addToast('Por favor, cole o calendário na caixa de texto.', 'error');
        return;
      }
      rawContent = textInput;
    } else {
      if (!fileInput) {
        addToast('Você precisa selecionar um arquivo primeiro.', 'error');
        return;
      }
      try {
        setIsProcessing(true);
        rawContent = await readExcelFile(fileInput);
      } catch (err) {
        setIsProcessing(false);
        addToast('Erro ao ler a planilha. Tente copiar e colar como texto.', 'error');
        return;
      }
    }

    try {
      setIsProcessing(true);
      const generatedPosts = await parseCalendarToPosts(rawContent, clientId, currentUser);
      addToast(`${generatedPosts.length} posts gerados com sucesso!`, 'success');
      onImport(generatedPosts);
      // Reset
      setTextInput('');
      setFileInput(null);
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Erro ao processar as informações.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Importar Planilha</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transforme rapidamente sua pauta do excel em posts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'text' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Type className="w-4 h-4" /> Colar Texto
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'file' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Enviar Arquivo (.xlsx)
              </button>
            </div>

            {activeTab === 'text' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Copie e cole os dados da sua planilha estruturada (Data, Ideia, Roteiro, CTA). O sistema entenderá os campos automaticamente.
                </p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={'Data\tFormato\tPilar\tArte\tRoteiro\n01/04\tReels\tEngajamento\t...\t...'}
                  className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-mono resize-none dark:text-gray-300 placeholder-gray-400"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Arraste sua planilha Excel baixada diretamente para ler a estrutura e criar os posts.
                </p>
                
                <input 
                  type="file" 
                  ref={fileRef} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.length) setFileInput(e.target.files[0]);
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isDragging 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : fileInput 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {fileInput ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">{fileInput.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(fileInput.size / 1024).toFixed(1)} KB • Pronto para processar</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">Clique para buscar o arquivo</p>
                      <p className="text-xs text-gray-500 mt-1">ou arraste e solte o seu .xlsx aqui</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <span className="font-semibold block mb-0.5">Como a importação funciona?</span>
                O script procurará os cabeçalhos tradicionais da sua pauta ("Data", "Formato", "Pilar", "Roteiro"). Certifique-se de copiá-los junto com os dados. Você pode adicionar as mídias visuais após os posts serem gerados. Entradas fora de formato serão ignoradas.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 rounded-xl transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando planilha...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Importar Posts
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
