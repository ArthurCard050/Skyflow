export type PostStatus = 
  | 'copy_production' 
  | 'copy_sent' 
  | 'copy_changes' 
  | 'copy_approved' 
  | 'design_production' 
  | 'design_sent' 
  | 'design_changes' 
  | 'design_approved' 
  | 'scheduling' 
  | 'scheduled' 
  | 'published';

export type UserRole = 'admin' | 'copywriter' | 'designer' | 'scheduler' | 'client';

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface Batch {
  id: string;
  name: string;
  clientId: string;
  createdAt: string;
}

export interface ActionHistory {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'comment' | 'approved' | 'rejected';
  user: string;
  timestamp: string;
  details?: string;
}

export type MediaType = 'image' | 'video';
export type MediaFormat = 'square' | 'portrait' | 'story' | 'landscape';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  format?: MediaFormat;
}

export interface Post {
  id: string;
  clientId: string;
  batchId?: string;
  media: MediaItem[];
  caption: string;
  status: PostStatus;
  rating?: number; // 1-5 stars, only if approved
  feedback?: string; // Only if changes_requested
  date: string; // Scheduled date
  platform: 'Instagram' | 'LinkedIn' | 'Facebook';
  
  // New fields for SaaS functionality
  format?: MediaFormat;
  title?: string;
  
  // Production Briefing Fields
  contentPillar?: string;
  visualDirection?: string;
  videoScript?: string;
  cta?: string;
  
  version: number;
  commentsCount: number;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  history: ActionHistory[];
}

export interface Notification {
  id: string;
  clientId: string;
  postId: string;
  type: 'approved' | 'changes_requested' | 'mention' | 'status_change';
  message: string;
  date: string;
  read: boolean;
}
