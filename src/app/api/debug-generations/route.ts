import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Generation {
    id: string
    user_id: string
    original_image_url: string
    generated_image_url: string | null
    prompt_text: string
    status: string
    created_at: string
    updated_at: string
    quality_score: number | null
    error_message: string | null
    users: {
        email: string
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Debug Generations API called')

        // First, get raw data without joins to see exactly what's in the database
        const { data: rawGenerations, error: rawError } = await supabaseAdmin
            .from('generations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3)

        if (rawError) {
            console.error('❌ Raw query error:', rawError)
        } else {
            console.log('🔍 Raw generations data (first 3):', JSON.stringify(rawGenerations, null, 2))
        }

        // Get all generations with user info
        const { data: generations, error } = await supabaseAdmin
            .from('generations')
            .select(`
        id,
        user_id,
        original_image_url,
        generated_image_url,
        prompt_text,
        status,
        created_at,
        updated_at,
        quality_score,
        error_message,
        users!inner(email)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Database error:', error)
            return NextResponse.json({
                error: 'Database error',
                details: error.message
            }, { status: 500 })
        }

        console.log('✅ Fetched all generations:', generations?.length || 0)

        // Log first few generations with full data for debugging
        if (generations && generations.length > 0) {
            console.log('📊 First 3 generations with full data:', generations.slice(0, 3).map((g: Generation) => ({
                id: g.id,
                status: g.status,
                original_image_url: g.original_image_url,
                generated_image_url: g.generated_image_url,
                prompt_text: g.prompt_text,
                quality_score: g.quality_score,
                error_message: g.error_message
            })))

            // Log raw data for first generation
            console.log('🔍 Raw data for first generation:', JSON.stringify(generations[0], null, 2))
        }

        // Group by user
        const generationsByUser = generations?.reduce((acc: any, gen: Generation) => {
            const email = gen.users.email || 'unknown'
            if (!acc[email]) {
                acc[email] = [] as any[]
            }
            acc[email].push({
                id: gen.id,
                user_id: gen.user_id,
                status: gen.status,
                created_at: gen.created_at,
                has_generated_image: !!gen.generated_image_url,
                quality_score: gen.quality_score
            })
            return acc
        }, {}) || {}

        return NextResponse.json({
            success: true,
            totalGenerations: generations?.length || 0,
            generationsByUser,
            allGenerations: generations?.map((g: Generation) => ({
                id: g.id,
                user_id: g.user_id,
                user_email: g.users.email,
                status: g.status,
                created_at: g.created_at,
                has_generated_image: !!g.generated_image_url,
                original_image_url: g.original_image_url,
                generated_image_url: g.generated_image_url,
                prompt_text: g.prompt_text,
                quality_score: g.quality_score,
                error_message: g.error_message
            })),
            rawData: rawGenerations
        })

    } catch (error) {
        console.error('❌ Debug Generations error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
