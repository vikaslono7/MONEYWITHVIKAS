// ==========================================
// MONEYWITHVIKAS — SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
  "https://gdbjkkxpvxeliytxnuzm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fBOXv1cz4I2Ap9kbQzJUew_xVPjdC8Z";

window.mwvSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Temporary connection test
console.log(
  "MoneyWithVikas Supabase connected:",
  !!mwvSupabase
);
