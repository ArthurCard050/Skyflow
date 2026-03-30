import { supabase } from '../lib/supabase';
import { Post, Client, Batch, Notification, TeamMemberRecord, Briefing, BriefingComment } from '../types';

// ─── Mappers ────────────────────────────────────────────────────────────────

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

function mapTeamMember(row: any): TeamMemberRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    memberId: row.member_id,
    role: row.role,
    clientId: row.client_id,
    createdAt: row.created_at,
    name: row.profiles?.name || '',
    email: row.profiles?.email || '',
    avatar: row.profiles?.avatar || '?',
    phone: row.profiles?.phone,
  };
}

function mapBriefing(row: any): Briefing {
  return {
    id: row.id,
    clientId: row.client_id,
    ownerId: row.owner_id,
    title: row.title,
    content: row.content || {},
    createdBy: row.created_by,
    createdByName: row.creator?.name,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    comments: (row.briefing_comments || []).map((c: any): BriefingComment => ({
      id: c.id,
      briefingId: c.briefing_id,
      userId: c.user_id,
      userName: c.profiles?.name || 'Usuário',
      userAvatar: c.profiles?.avatar || '?',
      content: c.content,
      createdAt: c.created_at,
    })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const dbService = {

  // ── Queries ───────────────────────────────────────────────────────────────

  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapClient);
  },

  async getBatches(): Promise<Batch[]> {
    const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapBatch);
  },

  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase.from('posts').select(`
      *,
      media:post_media(*),
      history:post_history(*, profiles(name))
    `).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPost);
  },

  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications').select('*').order('date', { ascending: false });
    if (error) throw error;
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

  // ── Team Members ──────────────────────────────────────────────────────────

  async getTeamMembers(): Promise<TeamMemberRecord[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profiles:member_id(name, email, avatar, phone)')
      .order('created_at');
    if (error) throw error;
    return (data || []).map(mapTeamMember);
  },

  async addTeamMember(
    memberEmail: string,
    memberName: string,
    memberPassword: string,
    role: string,
    ownerId: string,
    clientId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Usar um cliente alternativo para não deslogar o admin na sessão principal do browser
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const { createClient } = await import('@supabase/supabase-js');
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // 1. Criar auth user
      const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
        email: memberEmail,
        password: memberPassword,
        options: {
          data: { name: memberName, role, avatar: memberName.substring(0, 2).toUpperCase() }
        }
      });

      if (signUpError) {
        // Se usuário já existe, tentamos conectá-lo à nossa agência via RPC
        if (signUpError.message.includes('already registered')) {
          const { data: linked, error: linkError } = await supabase.rpc('link_existing_user_to_team', {
            p_email: memberEmail,
            p_owner_id: ownerId,
            p_role: role,
            p_client_id: clientId || null
          });
          
          if (linkError) return { success: false, error: linkError.message };
          if (!linked) return { success: false, error: 'O usuário já existe mas não pôde ser vinculado. Verifique o email.' };
          return { success: true };
        }
        return { success: false, error: signUpError.message };
      }

      const profileId = signUpData?.user?.id;
      if (!profileId) return { success: false, error: 'Não foi possível recuperar a ID do novo membro.' };

      // 2. Upsert profile usando a conexão principal (como Admin, que agora tem permissão no RLS)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: profileId,
        name: memberName,
        email: memberEmail,
        role,
        avatar: memberName.substring(0, 2).toUpperCase(),
      });
      if (profileError) throw profileError;

      // 3. Create team_member record usando a conexão principal (como Admin)
      const { error: tmError } = await supabase.from('team_members').insert({
        owner_id: ownerId,
        member_id: profileId,
        role,
        client_id: clientId || null,
      });

      if (tmError) return { success: false, error: tmError.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao convidar membro' };
    }
  },

  async updateTeamMemberRole(teamMemberId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('team_members').update({ role }).eq('id', teamMemberId);
    if (error) throw error;
    // Also update the member's profile role
    const { data } = await supabase
      .from('team_members').select('member_id').eq('id', teamMemberId).single();
    if (data?.member_id) {
      await supabase.from('profiles').update({ role }).eq('id', data.member_id);
    }
  },

  async removeTeamMember(teamMemberId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members').delete().eq('id', teamMemberId);
    if (error) throw error;
  },

  // ── Briefings ─────────────────────────────────────────────────────────────

  async getBriefings(clientId: string): Promise<Briefing[]> {
    const { data, error } = await supabase
      .from('briefings')
      .select(`
        *,
        creator:created_by(name),
        briefing_comments(*, profiles:user_id(name, avatar))
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapBriefing);
  },

  async upsertBriefing(briefing: Partial<Briefing> & { ownerId: string }): Promise<Briefing> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const validId = briefing.id && isUUID.test(briefing.id) ? briefing.id : undefined;

    const { data, error } = await supabase.from('briefings').upsert({
      ...(validId ? { id: validId } : {}),
      client_id: briefing.clientId,
      owner_id: briefing.ownerId,
      title: briefing.title,
      content: briefing.content || {},
      updated_at: new Date().toISOString(),
      updated_by: briefing.updatedBy,
      ...(validId ? {} : { created_by: briefing.createdBy }),
    }).select(`*, creator:created_by(name), briefing_comments(*, profiles:user_id(name, avatar))`).single();

    if (error) throw error;
    return mapBriefing(data);
  },

  async deleteBriefing(briefingId: string): Promise<void> {
    const { error } = await supabase.from('briefings').delete().eq('id', briefingId);
    if (error) throw error;
  },

  async addBriefingComment(briefingId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase.from('briefing_comments').insert({
      briefing_id: briefingId,
      user_id: userId,
      content,
    });
    if (error) throw error;
  },

  // ── Post Mutations ─────────────────────────────────────────────────────────

  async upsertClient(client: Partial<Client> & { ownerId: string }) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let validId = client.id;
    if (validId && !isUUID.test(validId)) validId = undefined;

    const payload: any = {
      ...(validId ? { id: validId } : {}),
      name: client.name,
      avatar: client.avatar,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      owner_id: client.ownerId,
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const { data, error } = await supabase.from('clients').upsert(payload).select().single();
    if (error) throw error;
    return mapClient(data);
  },

  async upsertPost(post: Partial<Post> & { ownerId: string }) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let validId = post.id;
    if (validId && !isUUID.test(validId)) validId = undefined;

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
      approved_at: post.approvedAt,
      owner_id: post.ownerId,
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data: postData, error } = await supabase.from('posts').upsert(payload).select().single();
    if (error) throw error;

    if (postData && post.media) {
      await supabase.from('post_media').delete().eq('post_id', postData.id);
      if (post.media.length > 0) {
        const mediaPayload = post.media.map((m, index) => ({
          post_id: postData.id,
          url: m.url,
          type: m.type,
          format: m.format,
          sort_order: index,
        }));
        const { error: mediaErr } = await supabase.from('post_media').insert(mediaPayload);
        if (mediaErr) console.error('Erro ao salvar media:', mediaErr);
      }
    }
    return postData;
  },

  async updatePostStatus(postId: string, status: string, approvedAt?: string) {
    const { error } = await supabase.from('posts')
      .update({ status, approved_at: approvedAt }).eq('id', postId);
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
      details,
    });
    if (error) throw error;
  },

  async createBatch(name: string, clientId: string, ownerId: string): Promise<Batch> {
    const { data, error } = await supabase.from('batches')
      .insert({ name, client_id: clientId, owner_id: ownerId })
      .select().single();
    if (error) throw error;
    return mapBatch(data);
  },

  async updateBatch(batchId: string, name: string) {
    const { error } = await supabase.from('batches').update({ name }).eq('id', batchId);
    if (error) throw error;
  },

  async deleteBatch(batchId: string) {
    const { error } = await supabase.from('batches').delete().eq('id', batchId);
    if (error) throw error;
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (error) throw error;
  },

  async createNotification(notification: Omit<Notification, 'id'> & { ownerId: string }) {
    const { error } = await supabase.from('notifications').insert({
      client_id: notification.clientId,
      post_id: notification.postId,
      type: notification.type,
      message: notification.message,
      date: notification.date,
      read: notification.read,
      owner_id: notification.ownerId,
    });
    if (error) console.error('Notification error:', error);
  },
};
