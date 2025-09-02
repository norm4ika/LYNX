import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Delete Generation API called for ID:', params.id)
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Missing or invalid authorization header'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError?.message || 'No user found'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email, 'ID:', user.id)

    // First, get the generation to check ownership and get image URLs
    const { data: generation, error: fetchError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json({
        error: 'Generation not found or access denied',
        details: fetchError?.message || 'Generation not found'
      }, { status: 404 })
    }

    console.log('✅ Generation found:', generation.id, 'Status:', generation.status)

    // Delete the generation
    const { error: deleteError } = await supabaseAdmin
      .from('generations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      return NextResponse.json({
        error: 'Failed to delete generation',
        details: deleteError.message
      }, { status: 500 })
    }

    console.log('✅ Generation deleted successfully:', params.id)

    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully',
      deletedId: params.id
    })

  } catch (error) {
    console.error('❌ Delete Generation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
