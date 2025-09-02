import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🧹 Clean Generations API called')

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

        // Delete failed generations older than 1 day
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        const { data: deletedGenerations, error: deleteError } = await supabaseAdmin
            .from('generations')
            .delete()
            .eq('user_id', user.id)
            .eq('status', 'failed')
            .lt('created_at', oneDayAgo.toISOString())
            .select('id, status, created_at')

        if (deleteError) {
            console.error('❌ Delete error:', deleteError)
            return NextResponse.json({
                error: 'Failed to clean generations',
                details: deleteError.message
            }, { status: 500 })
        }

        console.log('✅ Cleaned generations:', deletedGenerations?.length || 0, 'items')

        return NextResponse.json({
            success: true,
            cleanedCount: deletedGenerations?.length || 0,
            message: `Cleaned ${deletedGenerations?.length || 0} old failed generations`
        })

    } catch (error) {
        console.error('❌ Clean Generations error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
