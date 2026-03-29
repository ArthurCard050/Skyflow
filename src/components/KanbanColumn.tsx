import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Post, PostStatus } from '../types';
import { KanbanCard } from './KanbanCard';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface KanbanColumnProps {
  id: PostStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  posts: Post[];
  onCardClick: (post: Post) => void;
  isDragDisabled?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, icon: Icon, color, posts, onCardClick, isDragDisabled }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { status: id },
  });

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full snap-center">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl border mb-4 backdrop-blur-xl transition-colors duration-300",
        color,
        isOver && "ring-2 ring-offset-2 ring-sky-500 bg-sky-50 dark:bg-sky-900/40"
      )}>
        <div className="flex items-center gap-2 font-semibold">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
        </div>
        <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs font-bold">
          {posts.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 min-h-[150px] rounded-xl transition-colors duration-300",
          isOver ? "bg-sky-50/30 dark:bg-sky-900/10 border-2 border-dashed border-sky-300 dark:border-sky-700" : "border-2 border-transparent"
        )}
      >
        <SortableContext 
          items={posts.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          {posts.map((post) => (
            <KanbanCard 
              key={post.id} 
              post={post} 
              onClick={onCardClick}
              isDragDisabled={isDragDisabled}
            />
          ))}
        </SortableContext>
        
        {posts.length === 0 && !isOver && (
          <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm italic">
            Arraste itens aqui
          </div>
        )}
      </div>
    </div>
  );
}
