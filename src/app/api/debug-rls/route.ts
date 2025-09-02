import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Debug RLS API called')

        // Get the authorization header
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'No authorization header'
            }, { status: 401 })
        }

        const token = authHeader.substring(7)

        // Verify the token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({
                error: 'Auth error',
                details: authError?.message || 'No user found'
            }, { status: 401 })
        }

        // Test with regular supabase client (with RLS)
        const { data: generationsWithRLS, error: rlsError } = await supabase
            .from('generations')
            .select('id, status, created_at')
            .eq('user_id', user.id)
            .limit(5)

        // Test with admin client (without RLS)
        const { data: generationsWithoutRLS, error: adminError } = await supabaseAdmin
            .from('generations')
            .select('id, status, created_at')
            .eq('user_id', user.id)
            .limit(5)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email
            },
            rlsTest: {
                count: generationsWithRLS?.length || 0,
                error: rlsError?.message || null,
                data: generationsWithRLS || []
            },
            adminTest: {
                count: generationsWithoutRLS?.length || 0,
                error: adminError?.message || null,
                data: generationsWithoutRLS || []
            },
            conclusion: generationsWithRLS?.length === generationsWithoutRLS?.length
                ? 'RLS working correctly'
                : 'RLS blocking access'
        })

    } catch (error) {
        console.error('❌ Debug RLS error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
