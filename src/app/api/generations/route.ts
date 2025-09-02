import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Generations API called')

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header')
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Missing or invalid authorization header'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔑 Token length:', token.length)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError.message
      }, { status: 401 })
    }

    if (!user) {
      console.error('❌ No user found')
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'No user found'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email, 'ID:', user.id)

    // Get date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Fetch user's recent generations using supabaseAdmin to bypass RLS
    const { data: generations, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString()) // Only last 7 days
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({
        error: 'Failed to fetch generations',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Fetched generations:', generations?.length || 0, 'items for user:', user.id)

    // Log first few generations for debugging
    if (generations && generations.length > 0) {
      console.log('📊 Sample generations:', generations.slice(0, 3).map(g => ({
        id: g.id,
        status: g.status,
        created_at: g.created_at,
        has_generated_image: !!g.generated_image_url
      })))
    }

    // Return the correct format expected by the dashboard
    return NextResponse.json({
      generations: generations || [],
      total: generations?.length || 0
    })

  } catch (error) {
    console.error('❌ Generations API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
