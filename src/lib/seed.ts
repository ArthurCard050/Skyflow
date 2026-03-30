import { supabase } from './supabase';
import { INITIAL_POSTS, CLIENTS, INITIAL_BATCHES } from '../data/mockData';

export async function seedDatabase() {
  console.log('🌱 Iniciando Seeding do Banco de Dados...');

  try {
    // 1. Criar o Usuário Admin
    console.log('Criando Admin...');
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: 'admin@skyflow.com',
      password: 'skyflow2025',
      options: {
        data: {
          name: 'Ana Silva',
          role: 'admin',
          avatar: 'AS'
        }
      }
    });

    if (authErr) throw authErr;
    
    // Ignorar erro se o user já existir
    const userId = authData.user?.id;
    
    if (userId) {
      // 2. Inserir Profile do Admin manually caso n exista trigger
      await supabase.from('profiles').upsert({
        id: userId,
        name: 'Ana Silva',
        email: 'admin@skyflow.com',
        role: 'admin',
        avatar: 'AS'
      });
    }

    // 3. Criar os Clientes
    console.log('Inserindo Clientes...');
    for (const client of CLIENTS) {
      await supabase.from('clients').upsert({
        id: '00000000-0000-4000-a000-00000000000' + client.id, // Fake UUID
        name: client.name,
        avatar: client.avatar,
        email: client.email || `${client.name.replace(' ', '').toLowerCase()}@cliente.com`
      });
    }

    // 4. Criar Lotes
    console.log('Inserindo Lotes...');
    for (const batch of INITIAL_BATCHES) {
      await supabase.from('batches').upsert({
        id: '00000000-0000-4000-b000-00000000000' + batch.id,
        name: batch.name,
        client_id: '00000000-0000-4000-a000-00000000000' + batch.clientId,
      });
    }

    // 5. Inserir Posts
    console.log('Inserindo Posts...');
    for (const post of INITIAL_POSTS) {
      const dbPost = {
        id: post.id.length === 36 ? post.id : '00000000-0000-4000-c000-00000000000' + post.id, // fake uuid to pass
        client_id: '00000000-0000-4000-a000-00000000000' + post.clientId,
        batch_id: post.batchId ? ('00000000-0000-4000-b000-00000000000' + post.batchId) : null,
        caption: post.caption,
        status: post.status,
        date: post.date,
        platform: post.platform,
        comments_count: post.commentsCount || 0,
        created_by: userId,
      };

      const { data: postRef, error: pErr } = await supabase.from('posts').upsert(dbPost).select('id').single();
      
      if (pErr) {
        console.error('Post error:', pErr);
        continue;
      }

      // Insert Media
      if (postRef && post.media) {
        for (const [index, m] of post.media.entries()) {
          await supabase.from('post_media').upsert({
            post_id: postRef.id,
            url: m.url,
            type: m.type,
            format: m.format,
            sort_order: index
          });
        }
      }
    }

    console.log('✅ Banco Semeado com Sucesso!');
    alert('Banco populado com sucesso! Agora você pode logar.');
  } catch (err: any) {
    console.error('❌ Erro no seed:', err);
    alert('Erro: ' + err.message);
  }
}
