// Storage service using Cloudflare R2
// R2 is S3-compatible. We use Supabase Storage as fallback if R2 is not configured.
// To enable R2: add VITE_R2_ENDPOINT, VITE_R2_BUCKET, VITE_R2_PUBLIC_URL to .env
// and deploy a Cloudflare Worker as upload proxy (see docs).

import { supabase } from '../lib/supabase';

const R2_ENDPOINT = import.meta.env.VITE_R2_ENDPOINT; // Worker URL
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

interface StorageProvider {
  uploadMedia(file: File, path: string): Promise<string>;
}

const supabaseProvider: StorageProvider = {
  async uploadMedia(file: File, clientId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${clientId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('media').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data.publicUrl;
  },
};

const r2Provider: StorageProvider = {
  async uploadMedia(file: File, clientId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const key = `${clientId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    const response = await fetch(R2_ENDPOINT!, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`R2 upload failed: ${msg}`);
    }

    return `${R2_PUBLIC_URL}/${key}`;
  },
};

// Auto-select provider based on env config
const activeProvider: StorageProvider = R2_ENDPOINT ? r2Provider : supabaseProvider;

export const storageService = {
  async uploadMedia(file: File, clientId: string): Promise<string> {
    return activeProvider.uploadMedia(file, clientId);
  },
};
