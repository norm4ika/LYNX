import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Detailed generations debug requested')

    // Get all generations with detailed information
    const { data: generations, error: dbError } = await supabaseAdmin
      .from('generations')
      .select(`
        *,
        users(email)
      `)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to fetch generations',
        details: dbError.message
      }, { status: 500 })
    }

    console.log('Fetched generations:', generations?.length)

    // Analyze each generation
    const analysis = generations?.map(gen => ({
      id: gen.id,
      status: gen.status,
      created_at: gen.created_at,
      user_email: gen.users?.email,
      original_image_url: gen.original_image_url,
      generated_image_url: gen.generated_image_url,
      prompt_text: gen.prompt_text,
      error_message: gen.error_message,
      issues: []
    })) || []

    // Identify issues
    analysis.forEach(gen => {
      if (!gen.original_image_url) {
        gen.issues.push('Missing original_image_url')
      }
      if (gen.status === 'completed' && !gen.generated_image_url) {
        gen.issues.push('Completed but missing generated_image_url')
      }
      if (gen.status === 'failed' && !gen.error_message) {
        gen.issues.push('Failed but missing error_message')
      }
      if (gen.original_image_url && gen.original_image_url.includes('undefined')) {
        gen.issues.push('URL contains undefined')
      }
    })

    // Summary statistics
    const summary = {
      total: analysis.length,
      completed: analysis.filter(g => g.status === 'completed').length,
      pending: analysis.filter(g => g.status === 'pending').length,
      failed: analysis.filter(g => g.status === 'failed').length,
      withIssues: analysis.filter(g => g.issues.length > 0).length,
      missingGeneratedImage: analysis.filter(g => g.status === 'completed' && !g.generated_image_url).length,
      urlIssues: analysis.filter(g => g.original_image_url?.includes('undefined')).length
    }

    console.log('Analysis summary:', summary)

    return NextResponse.json({
      summary,
      generations: analysis,
      recommendations: [
        'Check if N8N workflow is properly updating generated_image_url',
        'Verify callback API is working correctly',
        'Check if Supabase storage URLs are being generated properly'
      ]
    })

  } catch (error) {
    console.error('Detailed generations debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
