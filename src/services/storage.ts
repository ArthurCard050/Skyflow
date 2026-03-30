import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadMedia(file: File, clientId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload para o Storage:', error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  }
};
