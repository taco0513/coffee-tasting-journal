import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// React Native Config 대신 직접 환경변수 설정
const supabaseUrl = 'https://iyccdzymklcedzzikwhv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Y2Nkenlta2xjZWR6emlrd2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Njc4NjAsImV4cCI6MjA2ODI0Mzg2MH0.ccBcOx8cqIR_3_nM1mSzdReRZZUG52wcV3msaPFcs0A';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: undefined, // React Native 기본 AsyncStorage 사용
  },
});