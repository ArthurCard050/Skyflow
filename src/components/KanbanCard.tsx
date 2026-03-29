import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Post } from '../types';
import { Clock, MessageSquare, Lock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface KanbanCardProps {
  post: Post;
  onClick: (post: Post) => void;
  isDragDisabled?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ post, onClick, isDragDisabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: post.id,
    data: { post },
    disabled: isDragDisabled || post.status.includes('approved') || post.status === 'published',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // SLA: días en el estado actual (usa createdAt como proxy si no hay updatedAt)
  const getSLADays = () => {
    // Final statuses don't have SLA
    if (post.status === 'published' || post.status.includes('approved')) return 0;
    const ref = new Date(post.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  };
  const slaDays = getSLADays();
  const isSLAOverdue = slaDays > 3;
  const isSLAWarning = slaDays === 3;

  const isLocked = post.status === 'published';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(post)}
      className={cn(
        "bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-3 rounded-xl border shadow-sm hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing",
        isSLAOverdue ? "border-red-300 dark:border-red-700/60" : "border-white/40 dark:border-gray-700/50",
        isLocked && "cursor-pointer border-emerald-100 dark:border-emerald-900/30",
        isDragging && "shadow-xl ring-2 ring-sky-500 rotate-2 z-50"
      )}
    >
      {/* SLA Badge */}
      {isSLAOverdue && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm z-10" title={`${slaDays} dias parado`}>
          <AlertTriangle className="w-2.5 h-2.5" />
          {slaDays}d
        </div>
      )}
      {isSLAWarning && !isLocked && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-400 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm z-10" title={`${slaDays} dias parado`}>
          <Zap className="w-2.5 h-2.5" />
          {slaDays}d
        </div>
      )}
      {/* Locked Indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 text-emerald-500 opacity-50">
          <Lock className="w-4 h-4" />
        </div>
      )}

      {/* Image & Platform Badge */}
      <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-900">
        <img 
          src={post.imageUrl} 
          alt="Post preview" 
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            isLocked && "grayscale-[0.3]"
          )}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1">
          {post.platform}
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-3">
        {post.title && (
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {post.title}
          </h4>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 font-medium">
          {post.caption}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700/50 pt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Data Agendada">
            <Clock className="w-3 h-3" />
            {new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </span>
          
          {post.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
              <MessageSquare className="w-3 h-3" />
              {post.commentsCount}
            </span>
          )}

          {post.version > 1 && (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
              v{post.version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {post.createdBy && (
            <span
              className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-[9px] font-bold flex items-center justify-center"
              title={post.createdBy}
            >
              {post.createdBy.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
