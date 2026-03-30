import { Post, PostStatus, ActionHistory } from '../types';
import { INITIAL_POSTS } from '../data/mockData';

// Simulate database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class PostService {
  private posts: Post[] = [...INITIAL_POSTS];

  async getPosts(clientId: string): Promise<Post[]> {
    await delay(300);
    return this.posts.filter(p => p.clientId === clientId);
  }

  async updateStatus(postId: string, newStatus: PostStatus, userId: string, userName: string): Promise<Post> {
    await delay(500);
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const post = this.posts[postIndex];
    
    // Business Rule: Cannot edit approved posts (unless reverting status, handled by logic)
    // Here we just update the status
    
    const newHistory: ActionHistory = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'status_change',
      user: userName,
      timestamp: new Date().toISOString(),
      details: `Status alterado de ${post.status} para ${newStatus}`
    };

    const updatedPost = {
      ...post,
      status: newStatus,
      approvedAt: (newStatus === 'copy_approved' || newStatus === 'design_approved') ? new Date().toISOString() : post.approvedAt,
      history: [newHistory, ...post.history]
    };

    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }

  async addComment(postId: string, comment: string, userId: string, userName: string): Promise<Post> {
    await delay(300);
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const post = this.posts[postIndex];
    
    const newHistory: ActionHistory = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'comment',
      user: userName,
      timestamp: new Date().toISOString(),
      details: comment
    };

    const updatedPost = {
      ...post,
      commentsCount: post.commentsCount + 1,
      history: [newHistory, ...post.history]
    };

    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }
}

export const postService = new PostService();
