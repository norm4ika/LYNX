import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const authHeader = request.headers.get('authorization')
    let currentUser = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      currentUser = user
    }

    // Get all users from auth.users (admin only)
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    // Get all users from public.users
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')

    // Get generations count
    const { count: generationsCount, error: genError } = await supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      currentUser: currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        created_at: currentUser.created_at
      } : null,
      authUsersCount: authUsers?.users?.length || 0,
      authUsers: authUsers?.users?.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      })) || [],
      publicUsersCount: publicUsers?.length || 0,
      publicUsers: publicUsers || [],
      generationsCount: generationsCount || 0,
      errors: {
        authError: authError?.message || null,
        publicError: publicError?.message || null,
        genError: genError?.message || null
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
