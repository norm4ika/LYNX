import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - admin functions will not work properly')
  console.error('This will cause RLS policy failures for callback endpoints')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey, // Fallback to anon key if service role key is not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          original_image_url: string
          generated_image_url: string | null
          prompt_text: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payment_intent_id: string | null
          error_message: string | null
          quality_score: number | null
          processing_time: number | null
          commercial_style: string | null
          target_audience: string | null
          brand_guidelines: string | null
          workflow_metadata: any | null
          n8n_execution_id: string | null
          workflow_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_image_url: string
          generated_image_url?: string | null
          prompt_text: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payment_intent_id?: string | null
          error_message?: string | null
          quality_score?: number | null
          processing_time?: number | null
          commercial_style?: string | null
          target_audience?: string | null
          brand_guidelines?: string | null
          workflow_metadata?: any | null
          n8n_execution_id?: string | null
          workflow_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_image_url?: string
          generated_image_url?: string | null
          prompt_text?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payment_intent_id?: string | null
          error_message?: string | null
          quality_score?: number | null
          processing_time?: number | null
          commercial_style?: string | null
          target_audience?: string | null
          brand_guidelines?: string | null
          workflow_metadata?: any | null
          n8n_execution_id?: string | null
          workflow_version?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
