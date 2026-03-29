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
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { canMovePost } from '../services/permissionService';
import { cn } from '../lib/utils';

interface KanbanViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onStatusChange: (postId: string, newStatus: PostStatus) => void;
  userRole: UserRole;
}

type PhaseId = 'copy' | 'design' | 'publish';

interface Phase {
  id: PhaseId;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  columns: { id: PostStatus; title: string; icon: React.ElementType; color: string }[];
}

const PHASES: Phase[] = [
  {
    id: 'copy',
    label: '📝 Copy',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50/80 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    columns: [
      { id: 'copy_production', title: 'Produção', icon: FileText, color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
      { id: 'copy_sent', title: 'Enviado', icon: Send, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
      { id: 'copy_changes', title: 'Ajustes', icon: AlertCircle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
      { id: 'copy_approved', title: 'Aprovado', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    ],
  },
  {
    id: 'design',
    label: '🎨 Design',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50/80 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    columns: [
      { id: 'design_production', title: 'Produção', icon: Palette, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
      { id: 'design_sent', title: 'Enviado', icon: Send, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
      { id: 'design_changes', title: 'Ajustes', icon: AlertCircle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
      { id: 'design_approved', title: 'Aprovado', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    ],
  },
  {
    id: 'publish',
    label: '📅 Publicação',
    color: 'text-sky-700 dark:text-sky-300',
    bgColor: 'bg-sky-50/80 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800/60',
    columns: [
      { id: 'scheduling', title: 'Agendamento', icon: CalendarIcon, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' },
      { id: 'scheduled', title: 'Agendado', icon: Clock, color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
      { id: 'published', title: 'Publicado', icon: Check, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800' },
    ],
  },
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.5' } },
  }),
};

export const KanbanView: React.FC<KanbanViewProps> = ({ posts, onPostClick, onStatusChange, userRole }) => {
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Record<PhaseId, boolean>>({
    copy: false,
    design: false,
    publish: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const togglePhase = (phaseId: PhaseId) => {
    setCollapsedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const post = posts.find(p => p.id === event.active.id);
    if (post) setActivePost(post);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActivePost(null); return; }

    const activeId = active.id as string;
    const overId = over.id as string;
    const dragged = posts.find(p => p.id === activeId);
    if (!dragged) return;

    // Check if dropped on a column
    const allColumns = PHASES.flatMap(p => p.columns);
    const isOverColumn = allColumns.some(col => col.id === overId);
    let newStatus: PostStatus | undefined;

    if (isOverColumn) {
      newStatus = overId as PostStatus;
    } else {
      const overPost = posts.find(p => p.id === overId);
      if (overPost) newStatus = overPost.status;
    }

    if (newStatus && newStatus !== dragged.status) {
      if (canMovePost(userRole, dragged.status, newStatus)) {
        onStatusChange(activeId, newStatus);
      }
    }

    setActivePost(null);
  };

  const phaseCounts = (phase: Phase) =>
    phase.columns.reduce((sum, col) => sum + posts.filter(p => p.status === col.id).length, 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] min-w-full px-1">
        {PHASES.map((phase) => {
          const isCollapsed = collapsedPhases[phase.id];
          const count = phaseCounts(phase);

          return (
            <div key={phase.id} className={cn(
              "flex-shrink-0 flex flex-col rounded-2xl border backdrop-blur-sm transition-all duration-300",
              phase.bgColor,
              phase.borderColor,
              isCollapsed ? "w-16" : "w-auto"
            )}>
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className={cn(
                  "flex items-center gap-2 p-3 font-bold text-sm rounded-t-2xl transition-colors hover:opacity-80",
                  phase.color,
                  isCollapsed ? "flex-col justify-center h-full writing-vertical" : "w-full justify-between px-4 py-3"
                )}
              >
                {isCollapsed ? (
                  <div className="flex flex-col items-center gap-3 h-full justify-center">
                    <ChevronRight className="w-4 h-4 opacity-60" />
                    <span
                      className="text-xs font-semibold"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
                    >
                      {phase.label.replace(/^[\p{Emoji}\s]+/u, '')}
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-black/30",
                      phase.color
                    )}>
                      {count}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{phase.label}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold bg-white/60 dark:bg-black/30",
                        phase.color
                      )}>
                        {count}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </>
                )}
              </button>

              {/* Phase Columns */}
              {!isCollapsed && (
                <div className="flex gap-4 p-3 flex-1 overflow-y-hidden">
                  {phase.columns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      id={column.id}
                      title={column.title}
                      icon={column.icon}
                      color={column.color}
                      posts={posts.filter(p => p.status === column.id)}
                      onCardClick={onPostClick}
                      isDragDisabled={userRole === 'client'}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activePost ? (
            <KanbanCard post={activePost} onClick={() => {}} isDragDisabled={false} />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
