import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(sbUrl, sbKey);

async function debugDatabase() {
  console.log('1. Fetching current clients...');
  const { data: clients, error: fetchErr } = await supabase.from('clients').select('*');
  console.log('Clients:', clients, fetchErr || 'No fetch error');

  console.log('\n2. Attempting to insert a new client...');
  const payload = {
    name: 'Debug Test Client',
    avatar: 'DT',
    email: 'debug@test.com'
  };
  
  const { data: insertData, error: insertErr } = await supabase.from('clients').upsert(payload).select().single();
  
  if (insertErr) {
    console.error('❌ Insert Error:', insertErr);
  } else {
    console.log('✅ Insert Success:', insertData);
  }
}

debugDatabase();
