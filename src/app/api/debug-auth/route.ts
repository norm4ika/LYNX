import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth API called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No authorization header',
        authHeader: authHeader || 'null'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔑 Token length:', token.length)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      return NextResponse.json({
        error: 'Auth error',
        details: authError.message,
        code: authError.name
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({
        error: 'No user found',
        tokenLength: token.length
      }, { status: 401 })
    }

    // Get user's generations count
    const { data: generations, error: dbError } = await supabase
      .from('generations')
      .select('id')
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      generations: {
        count: generations?.length || 0,
        error: dbError?.message || null
      },
      token: {
        length: token.length,
        valid: true
      }
    })

  } catch (error) {
    console.error('❌ Debug Auth error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
