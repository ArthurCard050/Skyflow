import { supabase } from '../lib/supabase';
import { Post, Client, Batch, Notification, ActionHistory, MediaItem } from '../types';

// Helper to convert DB snake_case to TS camelCase
function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
  };
}

function mapBatch(row: any): Batch {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    createdAt: row.created_at,
  };
}

function mapPost(row: any): Post {
  return {
    id: row.id,
    clientId: row.client_id,
    batchId: row.batch_id,
    caption: row.caption || '',
    status: row.status,
    rating: row.rating,
    feedback: row.feedback,
    date: row.date,
    platform: row.platform,
    format: row.format,
    title: row.title,
    contentPillar: row.content_pillar,
    visualDirection: row.visual_direction,
    videoScript: row.video_script,
    cta: row.cta,
    version: row.version,
    commentsCount: row.comments_count,
    createdAt: row.created_at,
    createdBy: row.created_by,
    approvedAt: row.approved_at,
    media: (row.media || []).map((m: any) => ({
      id: m.id,
      url: m.url,
      type: m.type,
      format: m.format,
    })).sort((a: any, b: any) => a.sort_order - b.sort_order),
    history: (row.history || []).map((h: any) => ({
      id: h.id,
      type: h.type,
      user: h.profiles?.name || 'Sistema',
      timestamp: h.timestamp,
      details: h.details,
    })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  };
}

export const dbService = {
  // Queries
  async getClients(): Promise<Client[]> {
    const { data } = await supabase.from('clients').select('*');
    return (data || []).map(mapClient);
  },

  async getBatches(): Promise<Batch[]> {
    const { data } = await supabase.from('batches').select('*');
    return (data || []).map(mapBatch);
  },

  async getPosts(): Promise<Post[]> {
    const { data } = await supabase.from('posts').select(`
      *,
      media:post_media(*),
      history:post_history(
        *,
        profiles(name)
      )
    `);
    return (data || []).map(mapPost);
  },

  async getNotifications(): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*').order('date', { ascending: false });
    return (data || []).map(row => ({
      id: row.id,
      clientId: row.client_id,
      postId: row.post_id,
      type: row.type,
      message: row.message,
      date: row.date,
      read: row.read,
    }));
  },

  // Mutations
  async upsertClient(client: Partial<Client>) {
    const payload = {
      ...(client.id ? { id: client.id } : {}),
      name: client.name,
      avatar: client.avatar,
      email: client.email,
      phone: client.phone,
      notes: client.notes
    };
    const { data, error } = await supabase.from('clients').upsert(payload).select().single();
    if (error) throw error;
    return mapClient(data);
  },

  async upsertPost(post: Partial<Post>) {
    // Garantir UUID válido caso o frontend gere um ID curto
    // Como id no Post pode ser curto, caso seja no formato curto, convertemos ou assumimos que o supabase cuida se for texto (que não é, é UUID). 
    // Na verdade nosso banco espera UUID! O Frontend ('Math.random().toString(36)...') gera string curta!
    // Para simplificar, deixamos o Supabase gerar se for undefined, mas precisamos do ID para os post_media.
    // O mais seguro é mandar o Supabase gerar omitindo o ID (se não for UUID válido), mas o React precisa dele.
    
    // UUID v4 format regex
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let validId = post.id;
    if (validId && !isUUID.test(validId)) {
       // Se o ID for o antigo (curto), deletamos de partial ID para o DB auto-gerar UUID
       validId = undefined; 
    }

    const payload: any = {
      ...(validId ? { id: validId } : {}),
      client_id: post.clientId,
      batch_id: post.batchId,
      caption: post.caption,
      status: post.status,
      rating: post.rating,
      feedback: post.feedback,
      date: post.date,
      platform: post.platform,
      format: post.format,
      title: post.title,
      content_pillar: post.contentPillar,
      visual_direction: post.visualDirection,
      video_script: post.videoScript,
      cta: post.cta,
      comments_count: post.commentsCount,
      approved_at: post.approvedAt
    };
    
    // Cleanup undefined keys
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    // Upsert the main Post row
    const { data: postData, error } = await supabase.from('posts').upsert(payload).select().single();
    if (error) throw error;
    
    // Synchronize the associated Media Array into post_media Table
    if (postData && post.media) {
      // Remove all old media
      await supabase.from('post_media').delete().eq('post_id', postData.id);
      
      if (post.media.length > 0) {
        const mediaPayload = post.media.map((m, index) => ({
          post_id: postData.id,
          url: m.url,
          type: m.type,
          format: m.format,
          sort_order: index
        }));
        
        const { error: mediaErr } = await supabase.from('post_media').insert(mediaPayload);
        if (mediaErr) console.error('Erro ao salvar media array:', mediaErr);
      }
    }
    
    return postData;
  },

  async updatePostStatus(postId: string, status: string, approvedAt?: string) {
    const { error } = await supabase.from('posts').update({ status, approved_at: approvedAt }).eq('id', postId);
    if (error) throw error;
  },

  async deletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  },

  async deleteClient(clientId: string) {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;
  },

  async addHistory(postId: string, type: string, userId: string, details?: string) {
    const { error } = await supabase.from('post_history').insert({
      post_id: postId,
      type,
      user_id: userId,
      details
    });
    if (error) throw error;
  }
};
