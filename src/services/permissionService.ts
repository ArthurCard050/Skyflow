import { PostStatus, UserRole, Post } from '../types';
import { canMovePostByRole } from '../config/roleConfig';

const ALLOWED_TRANSITIONS: Record<UserRole, PostStatus[]> = {
  admin: [
    'copy_production', 'copy_sent', 'copy_changes', 'copy_approved',
    'design_production', 'design_sent', 'design_changes', 'design_approved',
    'scheduling', 'scheduled', 'published'
  ],
  copywriter: ['copy_production', 'copy_sent', 'copy_changes', 'copy_approved'],
  designer: ['design_production', 'design_sent', 'design_changes', 'design_approved'],
  social_media: ['scheduling', 'scheduled', 'published'],
  client: [],
};

export const canMovePost = (userRole: UserRole, currentStatus: PostStatus, newStatus: PostStatus): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'client') return false;
  return canMovePostByRole(userRole, currentStatus, newStatus);
};

export const canEditPost = (userRole: UserRole, post: Post): boolean => {
  if (post.status === 'published') return false;
  if (userRole === 'admin') return true;
  if (userRole === 'client') return false;
  if (userRole === 'copywriter' && post.status.startsWith('copy_')) return true;
  if (userRole === 'designer' && post.status.startsWith('design_')) return true;
  if (userRole === 'social_media' && (post.status === 'scheduling' || post.status === 'scheduled')) return true;
  return false;
};

export const getNextStatus = (currentStatus: PostStatus, action: 'approve' | 'reject'): PostStatus | null => {
  switch (currentStatus) {
    case 'copy_sent':
      return action === 'approve' ? 'copy_approved' : 'copy_changes';
    case 'design_sent':
      return action === 'approve' ? 'design_approved' : 'design_changes';
    default:
      return null;
  }
};
