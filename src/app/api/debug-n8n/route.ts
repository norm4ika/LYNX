import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 N8N Workflow Debug Requested')

    // Get recent generations to analyze N8N issues
    const { data: recentGenerations, error: dbError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to fetch generations',
        details: dbError.message
      }, { status: 500 })
    }

    // Analyze N8N workflow issues
    const analysis = recentGenerations?.map(gen => ({
      id: gen.id,
      status: gen.status,
      created_at: gen.created_at,
      original_image_url: gen.original_image_url,
      generated_image_url: gen.generated_image_url,
      error_message: gen.error_message,
      n8n_execution_id: gen.n8n_execution_id,
      workflow_metadata: gen.workflow_metadata,
      issues: [] as string[]
    })) || []

    // Identify N8N-specific issues
    analysis.forEach(gen => {
      if (gen.status === 'completed' && !gen.generated_image_url) {
        gen.issues.push('N8N: Completed without generated image')
      }
      if (gen.status === 'completed' && gen.generated_image_url && gen.generated_image_url.endsWith('/')) {
        gen.issues.push('N8N: Generated image URL is truncated (ends with /)')
      }
      if (gen.status === 'completed' && gen.generated_image_url && gen.generated_image_url.includes('undefined')) {
        gen.issues.push('N8N: Generated image URL contains undefined')
      }
      if (gen.status === 'failed' && gen.error_message?.includes('N8N')) {
        gen.issues.push('N8N: Workflow execution failed')
      }
      if (!gen.n8n_execution_id) {
        gen.issues.push('N8N: Missing execution ID')
      }
      if (gen.original_image_url && gen.original_image_url.includes('undefined')) {
        gen.issues.push('N8N: Malformed original image URL')
      }
    })

    // Summary statistics
    const summary = {
      total: analysis.length,
      completed: analysis.filter(g => g.status === 'completed').length,
      failed: analysis.filter(g => g.status === 'failed').length,
      pending: analysis.filter(g => g.status === 'pending').length,
      withN8nIssues: analysis.filter(g => g.issues.length > 0).length,
      missingGeneratedImages: analysis.filter(g => g.status === 'completed' && !g.generated_image_url).length,
      truncatedUrls: analysis.filter(g => g.status === 'completed' && g.generated_image_url && g.generated_image_url.endsWith('/')).length,
      n8nExecutionIds: analysis.filter(g => g.n8n_execution_id).length
    }

    console.log('N8N Analysis summary:', summary)

    return NextResponse.json({
      summary,
      generations: analysis,
      recommendations: [
        'Check N8N workflow is running and accessible',
        'Verify N8N webhook URL is correct (http://host.docker.internal:3000/api/callback)',
        'Check N8N workflow logs for image generation errors',
        'Verify OpenRouter API key is valid and has credits',
        'Check if N8N workflow is properly uploading to Supabase',
        'Verify N8N Docker container has internet access'
      ],
      n8nChecklist: [
        'N8N container is running: docker ps | grep n8n',
        'N8N can reach host: docker exec n8n-n8n-1 wget -qO- http://host.docker.internal:3000/api/check-storage',
        'Workflow is active and not paused',
        'Webhook trigger is configured correctly',
        'Image generation nodes have valid API keys',
        'Supabase upload node is configured properly'
      ]
    })

  } catch (error) {
    console.error('N8N debug error:', error)
    return NextResponse.json({
      error: 'N8N debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
