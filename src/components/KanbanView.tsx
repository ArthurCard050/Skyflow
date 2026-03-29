import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Post, PostStatus, UserRole } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Check, 
  PenTool, 
  Send, 
  Palette, 
  Calendar as CalendarIcon, 
  FileText 
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { canMovePost } from '../services/permissionService';

interface KanbanViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onStatusChange: (postId: string, newStatus: PostStatus) => void;
  userRole: UserRole;
}

const COLUMNS: { id: PostStatus; title: string; icon: React.ElementType; color: string }[] = [
  // Copy Phase
  { 
    id: 'copy_production', 
    title: 'Copy: Produção', 
    icon: FileText, 
    color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800' 
  },
  { 
    id: 'copy_sent', 
    title: 'Copy: Enviado', 
    icon: Send, 
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
  },
  { 
    id: 'copy_changes', 
    title: 'Copy: Ajustes', 
    icon: AlertCircle, 
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' 
  },
  { 
    id: 'copy_approved', 
    title: 'Copy: Aprovado', 
    icon: CheckCircle, 
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
  },
  
  // Design Phase
  { 
    id: 'design_production', 
    title: 'Design: Produção', 
    icon: Palette, 
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
  },
  { 
    id: 'design_sent', 
    title: 'Design: Enviado', 
    icon: Send, 
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' 
  },
  { 
    id: 'design_changes', 
    title: 'Design: Ajustes', 
    icon: AlertCircle, 
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' 
  },
  { 
    id: 'design_approved', 
    title: 'Design: Aprovado', 
    icon: CheckCircle, 
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
  },

  // Final Phase
  { 
    id: 'scheduling', 
    title: 'Agendamento', 
    icon: CalendarIcon, 
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' 
  },
  { 
    id: 'scheduled', 
    title: 'Agendado', 
    icon: Clock, 
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400 border-sky-200 dark:border-sky-800' 
  },
  { 
    id: 'published', 
    title: 'Publicado', 
    icon: Check, 
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800' 
  },
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const KanbanView: React.FC<KanbanViewProps> = ({ posts, onPostClick, onStatusChange, userRole }) => {
  const [activePost, setActivePost] = useState<Post | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const post = posts.find(p => p.id === active.id);
    if (post) setActivePost(post);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActivePost(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activePost = posts.find(p => p.id === activeId);
    if (!activePost) return;

    // Check if dropped on a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    
    let newStatus: PostStatus | undefined;

    if (isOverColumn) {
      newStatus = overId as PostStatus;
    } else {
      // Dropped on another card, find its status
      const overPost = posts.find(p => p.id === overId);
      if (overPost) {
        newStatus = overPost.status;
      }
    }

    if (newStatus && newStatus !== activePost.status) {
      // Use centralized permission service
      if (canMovePost(userRole, activePost.status, newStatus)) {
        onStatusChange(activeId, newStatus);
      } else {
        // Optionally show a toast or shake animation for denied action
        console.log('Permission denied');
      }
    }

    setActivePost(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] min-w-full snap-x snap-mandatory px-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            color={column.color}
            posts={posts.filter((post) => post.status === column.id)}
            onCardClick={onPostClick}
            isDragDisabled={userRole === 'client'} // Clients can never drag
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activePost ? (
            <KanbanCard 
              post={activePost} 
              onClick={() => {}} 
              isDragDisabled={false} // Visual only
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}


