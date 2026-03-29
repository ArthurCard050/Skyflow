import { PostStatus, UserRole, Post } from '../types';

// Define allowed transitions for each role
const ALLOWED_TRANSITIONS: Record<UserRole, PostStatus[]> = {
  admin: [
    'copy_production', 'copy_sent', 'copy_changes', 'copy_approved',
    'design_production', 'design_sent', 'design_changes', 'design_approved',
    'scheduling', 'scheduled', 'published'
  ],
  copywriter: [
    'copy_production', 'copy_sent', 'copy_changes', 'copy_approved'
  ],
  designer: [
    'design_production', 'design_sent', 'design_changes', 'design_approved'
  ],
  scheduler: [
    'scheduling', 'scheduled', 'published'
  ],
  client: [] // Clients cannot move cards directly, only approve/request changes via buttons
};

// Define specific rules for transitions
export const canMovePost = (userRole: UserRole, currentStatus: PostStatus, newStatus: PostStatus): boolean => {
  // Admin can do anything
  if (userRole === 'admin') return true;

  // Client cannot move cards
  if (userRole === 'client') return false;

  const allowedStatuses = ALLOWED_TRANSITIONS[userRole] || [];
  const isTargetAllowed = allowedStatuses.includes(newStatus);
  const isSourceAllowed = allowedStatuses.includes(currentStatus);

  // General Rule: Must own the source status to move it
  // Exception: Scheduler picking up approved design
  if (!isSourceAllowed) {
    if (userRole === 'scheduler' && currentStatus === 'design_approved' && newStatus === 'scheduling') {
      return true;
    }
    return false;
  }

  // If they own the source, can they move to target?
  if (isTargetAllowed) return true;

  // Handoffs (Push model)
  if (userRole === 'copywriter' && currentStatus === 'copy_approved' && newStatus === 'design_production') return true;
  if (userRole === 'designer' && currentStatus === 'design_approved' && newStatus === 'scheduling') return true;

  return false;
};

export const canEditPost = (userRole: UserRole, post: Post): boolean => {
  if (post.status === 'published') return false; // Locked after publish
  if (userRole === 'admin') return true;
  if (userRole === 'client') return false; // Clients only comment/approve

  // Role-based editing
  if (userRole === 'copywriter' && post.status.startsWith('copy_')) return true;
  if (userRole === 'designer' && post.status.startsWith('design_')) return true;
  if (userRole === 'scheduler' && (post.status === 'scheduling' || post.status === 'scheduled')) return true;

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
