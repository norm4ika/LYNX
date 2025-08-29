import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Helper function to safely convert string to number
function safeParseFloat(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

// Helper function to safely convert string to integer
function safeParseInt(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

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
      updateData.processing_time = safeParseInt(processingTime)
      console.log(`Processing time: ${updateData.processing_time}ms`)
    }

    if (qualityScore) {
      updateData.quality_score = safeParseFloat(qualityScore)
      console.log(`Quality score: ${updateData.quality_score}`)
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

    console.log('Update data:', JSON.stringify(updateData, null, 2))

    const { data, error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('id', generationId)
      .select()

    if (error) {
      console.error('Failed to update generation:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        generationId,
        updateData
      })
      return NextResponse.json({
        error: 'Failed to update generation',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error('No generation found with ID:', generationId)
      return NextResponse.json({
        error: 'Generation not found',
        generationId
      }, { status: 404 })
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
