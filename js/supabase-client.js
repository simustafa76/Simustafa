// ============================================================
// ===== SUPABASE CONFIGURATION =====
// ============================================================
const SUPABASE_URL = 'https://hhiypidstbzqmdmxfqns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaXlwaWRzdGJ6cW1kbXhmcW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTExMzUsImV4cCI6MjEwMDIyNzEzNX0.0OHp0pMBiONMci88qLMkNCquaQeJfTICSBYQQrfPmwU';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);