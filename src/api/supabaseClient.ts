import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN KUNCI ANDA DARI PROJECT SETTINGS > API
const supabaseUrl = 'https://yjoabdxbsewahzxolouv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqb2FiZHhic2V3YWh6eG9sb3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDg2NTksImV4cCI6MjA3ODgyNDY1OX0.2x6j-CDPNJFWdJ3bM3SuEvwogV8tRq3pvANwtFbjfz8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
