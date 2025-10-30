import { createClient } from '@supabase/supabase-js'

// REEMPLAZA CON TU URL
const supabaseUrl = 'https://wkyxozsgthszpeiqbhav.supabase.co'
// REEMPLAZA CON TU API KEY (anon public)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreXhvenNndGhzenBlaXFiaGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzI1OTcsImV4cCI6MjA3NzM0ODU5N30.2OTq5drz0h7qSC1FMppIPYgyKiMwcdz465zbWPIMmNg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)