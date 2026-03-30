import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(sbUrl, sbKey);

async function testAuth() {
  console.log('Logging in as admin@skyflow.com...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@skyflow.com',
    password: 'skyflow2025' // From earlier seed script fallback
  });

  if (authErr) {
    console.log('❌ Auth Error:', authErr.message);
    // User might have deleted this admin or changed password. We can't test inserts.
    return;
  }
  
  console.log('✅ Logged in! JWT attached.');
  
  console.log('Testing insert...');
  const { data, error } = await supabase.from('clients').upsert({
    name: 'Auth Test Client',
    email: 'testauth@script.com',
    avatar: 'AT'
  }).select().single();

  if (error) {
    console.error('❌ Insert Error:', error);
  } else {
    console.log('✅ Insert Success:', data.id);
  }
}

testAuth();
