import { UserRole, PostStatus, Post } from '../types';

export type View = 'feed' | 'calendar' | 'kanban' | 'reports' | 'team' | 'notifications' | 'account' | 'briefing';

export interface RolePermissions {
  views: View[];
  canCreatePost: boolean;
  canManageClients: boolean;
  canManageTeam: boolean;
  canManageBatches: boolean;
  canEditBriefing: boolean;
  canCommentBriefing: boolean;
  canViewReports: boolean;
  postFieldFocus: 'all' | 'copy' | 'design' | 'scheduling';
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    views: ['feed', 'calendar', 'kanban', 'reports', 'team', 'notifications', 'account', 'briefing'],
    canCreatePost: true,
    canManageClients: true,
    canManageTeam: true,
    canManageBatches: true,
    canEditBriefing: true,
    canCommentBriefing: true,
    canViewReports: true,
    postFieldFocus: 'all',
  },
  copywriter: {
    views: ['feed', 'calendar', 'kanban', 'notifications', 'account', 'briefing'],
    canCreatePost: true,
    canManageClients: false,
    canManageTeam: false,
    canManageBatches: false,
    canEditBriefing: true,
    canCommentBriefing: true,
    canViewReports: false,
    postFieldFocus: 'copy',
  },
  designer: {
    views: ['feed', 'calendar', 'kanban', 'notifications', 'account', 'briefing'],
    canCreatePost: true,
    canManageClients: false,
    canManageTeam: false,
    canManageBatches: false,
    canEditBriefing: false,
    canCommentBriefing: true,
    canViewReports: false,
    postFieldFocus: 'design',
  },
  social_media: {
    views: ['feed', 'calendar', 'kanban', 'notifications', 'account', 'briefing'],
    canCreatePost: true,
    canManageClients: false,
    canManageTeam: false,
    canManageBatches: false,
    canEditBriefing: false,
    canCommentBriefing: true,
    canViewReports: false,
    postFieldFocus: 'scheduling',
  },
  client: {
    views: ['feed', 'calendar', 'notifications', 'account', 'briefing'],
    canCreatePost: false,
    canManageClients: false,
    canManageTeam: false,
    canManageBatches: false,
    canEditBriefing: false,
    canCommentBriefing: true,
    canViewReports: false,
    postFieldFocus: 'all',
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  copywriter: 'Copywriter',
  designer: 'Designer',
  social_media: 'Social Media',
  client: 'Cliente',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30',
  copywriter: 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/30',
  designer: 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/30',
  social_media: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30',
  client: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30',
};

// Kept for backwards compat with permissionService
export const canMovePostByRole = (userRole: UserRole, from: PostStatus, to: PostStatus): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'client') return false;
  const p = ROLE_PERMISSIONS[userRole];
  if (p.postFieldFocus === 'copy') {
    return (from.startsWith('copy_') || to.startsWith('copy_')) || 
           (from === 'copy_approved' && to === 'design_production');
  }
  if (p.postFieldFocus === 'design') {
    return (from.startsWith('design_') || to.startsWith('design_')) ||
           (from === 'design_approved' && to === 'scheduling');
  }
  if (p.postFieldFocus === 'scheduling') {
    return ['scheduling', 'scheduled', 'published'].includes(to) ||
           (from === 'design_approved' && to === 'scheduling');
  }
  return false;
};
