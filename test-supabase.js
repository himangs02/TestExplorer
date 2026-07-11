const { createClient } = require('@supabase/supabase-js');
const url = 'https://ykbehghnwjciwwlxipcw.supabase.co';
const key = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await supabase.from('prep_modules').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Modules found:', data.length);
  }
}
main();
