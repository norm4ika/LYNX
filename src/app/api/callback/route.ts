import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Callback received from N8N:', body)

    const {
      generationId,
      generatedImageUrl,
      status,
      errorMessage,
      workflowData,
      processingTime,
      qualityScore,
      commercialStyle,
      targetAudience,
      brandGuidelines,
      n8nExecutionId,
      workflowVersion
    } = body

    if (!generationId) {
      console.error('Missing generationId in callback')
      return NextResponse.json({ error: 'Missing generationId' }, { status: 400 })
    }

    console.log(`Updating generation ${generationId} with status: ${status}`)

    // Update generation record with advanced data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (generatedImageUrl) {
      updateData.generated_image_url = generatedImageUrl
      console.log(`Generated image URL: ${generatedImageUrl}`)
    }

    if (status) {
      updateData.status = status
    }

    if (errorMessage) {
      updateData.error_message = errorMessage
      console.error(`Generation error: ${errorMessage}`)
    }

    // Add advanced metadata
    if (workflowData) {
      updateData.workflow_metadata = workflowData
    }

    if (processingTime) {
      updateData.processing_time = processingTime
      console.log(`Processing time: ${processingTime}ms`)
    }

    if (qualityScore) {
      updateData.quality_score = qualityScore
      console.log(`Quality score: ${qualityScore}`)
    }

    if (commercialStyle) {
      updateData.commercial_style = commercialStyle
    }

    if (targetAudience) {
      updateData.target_audience = targetAudience
    }

    if (brandGuidelines) {
      updateData.brand_guidelines = brandGuidelines
    }

    // Add N8N specific metadata
    if (n8nExecutionId) {
      updateData.n8n_execution_id = n8nExecutionId
    }

    if (workflowVersion) {
      updateData.workflow_version = workflowVersion
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('id', generationId)

    if (error) {
      console.error('Failed to update generation:', error)
      return NextResponse.json({ error: 'Failed to update generation' }, { status: 500 })
    }

    console.log(`Successfully updated generation ${generationId}`)

    return NextResponse.json({
      success: true,
      message: 'Ultra-realistic generation updated successfully',
      data: {
        generationId,
        status,
        qualityScore,
        commercialStyle,
        processingTime,
        n8nExecutionId
      }
    })

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
