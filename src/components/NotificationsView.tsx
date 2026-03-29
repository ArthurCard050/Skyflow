import React from 'react';
import { motion } from 'motion/react';
import { Notification, Client } from '../types';
import { Check, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationsViewProps {
  notifications: Notification[];
  clients: Client[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationsView({ 
  notifications, 
  clients, 
  onMarkAsRead, 
  onDelete,
  onClearAll,
  onNotificationClick
}: NotificationsViewProps) {
    if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-dashed border-white/30 dark:border-gray-700/50 transition-colors">
        <div className="w-16 h-16 bg-white/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sem notificações</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Você está em dia com todas as atualizações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações</h2>
        <button 
          onClick={onClearAll}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Limpar tudo
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const client = clients.find(c => c.id === notification.clientId);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 group relative backdrop-blur-xl",
                notification.read 
                  ? "bg-white/60 dark:bg-gray-800/60 border-white/40 dark:border-gray-700/50" 
                  : "bg-sky-50/60 dark:bg-sky-900/20 border-sky-100/50 dark:border-sky-800/50 shadow-sm"
              )}
              onClick={() => {
                if (!notification.read) onMarkAsRead(notification.id);
                onNotificationClick(notification);
              }}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                notification.type === 'approved' 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              )}>
                {notification.type === 'approved' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {client?.name || 'Cliente Desconhecido'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(notification.date).toLocaleDateString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
