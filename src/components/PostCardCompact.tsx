import React from 'react';
import { Post, UserRole } from '../types';
import { cn } from '../lib/utils';
import { Clock, MessageSquare, Eye } from 'lucide-react';

interface PostCardCompactProps {
  post: Post;
  onClick: (post: Post) => void;
  userRole: UserRole;
  highlighted?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  copy_production: { label: 'Copy: Produção', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  copy_sent:       { label: 'Copy: Enviado',  classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  copy_changes:    { label: 'Copy: Ajustes',  classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  copy_approved:   { label: 'Copy: Aprovado', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  design_production:{ label: 'Design: Produção', classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  design_sent:     { label: 'Design: Enviado', classes: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  design_changes:  { label: 'Design: Ajustes', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  design_approved: { label: 'Design: Aprovado', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  scheduling:      { label: 'Agendamento',    classes: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  scheduled:       { label: 'Agendado',       classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  published:       { label: 'Publicado',      classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: 'bg-pink-500',
  LinkedIn:  'bg-blue-600',
  Facebook:  'bg-blue-500',
};

// Which statuses need attention from the client
const NEEDS_CLIENT_ACTION = ['copy_sent', 'design_sent'];
// Which need agency action
const NEEDS_AGENCY_ACTION = ['copy_changes', 'design_changes'];

export const PostCardCompact: React.FC<PostCardCompactProps> = ({ post, onClick, userRole, highlighted }) => {
  const statusCfg = STATUS_CONFIG[post.status] || { label: post.status, classes: 'bg-gray-100 text-gray-600' };
  const isAgency = userRole !== 'client';
  const needsAttention = isAgency
    ? NEEDS_AGENCY_ACTION.includes(post.status)
    : NEEDS_CLIENT_ACTION.includes(post.status);

  return (
    <button
      onClick={() => onClick(post)}
      className={cn(
        "w-full flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] text-left group",
        highlighted
          ? "border-sky-400 ring-2 ring-sky-400/30 bg-sky-50/70 dark:bg-sky-900/20"
          : needsAttention
          ? "border-orange-300 dark:border-orange-700/60 bg-orange-50/30 dark:bg-orange-900/10"
          : "border-white/40 dark:border-gray-700/50"
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900">
        <img
          src={post.imageUrl}
          alt={post.title || 'Post'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {/* Platform dot */}
        <div className={cn(
          "absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white",
          PLATFORM_COLOR[post.platform] || 'bg-gray-400'
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {post.title || post.platform}
          </p>
          {needsAttention && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400 animate-pulse" title="Requer atenção" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{post.caption}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusCfg.classes)}>
          {statusCfg.label}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </span>
          {post.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-sky-500">
              <MessageSquare className="w-2.5 h-2.5" />
              {post.commentsCount}
            </span>
          )}
        </div>
      </div>

      {/* Hover reveal */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
        <Eye className="w-4 h-4 text-sky-500" />
      </div>
    </button>
  );
};
