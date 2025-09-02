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

// Helper function to validate and clean URLs
function validateAndCleanUrl(url: any): string | null {
  if (!url || typeof url !== 'string') return null

  // Remove any undefined values from URL
  const cleanedUrl = url.replace(/undefined/g, '')

  // Check if URL is valid
  try {
    new URL(cleanedUrl)
    return cleanedUrl
  } catch {
    console.error('Invalid URL format:', url)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔄 Callback received from N8N:', JSON.stringify(body, null, 2))

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
      workflowVersion,
      // Additional fields that might come from Quality Master
      realismScore,
      commercialAppeal,
      technicalQuality,
      overallScore,
      analysisText,
      // Processing metadata
      comfyuiWorkflow,
      executionTime,
      timestamp,
      // NEW: Supabase Storage metadata
      supabaseStoragePath,
      imageSize
    } = body

    // Validate required fields
    if (!generationId) {
      console.error('❌ Missing generationId in callback')
      return NextResponse.json({
        error: 'Missing generationId',
        received_fields: Object.keys(body),
        received_data: body
      }, { status: 400 })
    }

    console.log(`🔄 Updating generation ${generationId} with status: ${status}`)

    // Build update data with comprehensive error handling
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Core fields - prioritize generatedImageUrl with validation
    if (generatedImageUrl) {
      const validatedUrl = validateAndCleanUrl(generatedImageUrl)
      if (validatedUrl) {
        updateData.generated_image_url = validatedUrl
        console.log(`✅ Generated image URL validated: ${validatedUrl}`)
      } else {
        console.error('❌ Invalid generatedImageUrl:', generatedImageUrl)
        updateData.error_message = `Invalid generated image URL: ${generatedImageUrl}`
        updateData.status = 'failed'
      }
    } else if (status === 'completed') {
      console.error('❌ Status completed but no generatedImageUrl provided')
      updateData.error_message = 'Generation completed but no image URL provided'
      updateData.status = 'failed'
    }

    if (status) {
      updateData.status = status
      console.log(`✅ Status: ${status}`)
    }

    if (errorMessage) {
      updateData.error_message = errorMessage
      console.error(`❌ Generation error: ${errorMessage}`)
    }

    // Advanced metadata with robust parsing
    if (workflowData || comfyuiWorkflow) {
      updateData.workflow_metadata = workflowData || comfyuiWorkflow
      console.log(`✅ Workflow metadata added`)
    }

    // Processing time with multiple possible field names
    const processingTimeValue = processingTime || executionTime
    if (processingTimeValue) {
      updateData.processing_time = safeParseInt(processingTimeValue)
      console.log(`✅ Processing time: ${updateData.processing_time}ms`)
    }

    // Quality scores with comprehensive handling
    let finalQualityScore = null
    if (qualityScore) {
      finalQualityScore = safeParseFloat(qualityScore)
    } else if (overallScore) {
      finalQualityScore = safeParseFloat(overallScore)
    } else if (realismScore && commercialAppeal) {
      // Calculate average if individual scores are provided
      const realism = safeParseFloat(realismScore) || 0
      const commercial = safeParseFloat(commercialAppeal) || 0
      finalQualityScore = (realism + commercial) / 2
      console.log(`🔢 Calculated quality score from realism (${realism}) and commercial appeal (${commercial})`)
    }

    if (finalQualityScore !== null) {
      updateData.quality_score = finalQualityScore
      console.log(`✅ Quality score: ${updateData.quality_score}`)
    }

    // Commercial analysis fields
    if (commercialStyle) {
      updateData.commercial_style = commercialStyle
      console.log(`✅ Commercial style: ${commercialStyle}`)
    }

    if (targetAudience) {
      updateData.target_audience = targetAudience
      console.log(`✅ Target audience: ${targetAudience}`)
    }

    if (brandGuidelines) {
      updateData.brand_guidelines = brandGuidelines
      console.log(`✅ Brand guidelines added`)
    }

    // N8N execution metadata
    if (n8nExecutionId) {
      updateData.n8n_execution_id = n8nExecutionId
      console.log(`✅ N8N execution ID: ${n8nExecutionId}`)
    }

    if (workflowVersion) {
      updateData.workflow_version = workflowVersion
      console.log(`✅ Workflow version: ${workflowVersion}`)
    }

    // NEW: Add Supabase Storage metadata
    if (supabaseStoragePath) {
      updateData.supabase_storage_path = supabaseStoragePath
      console.log(`✅ Supabase storage path: ${supabaseStoragePath}`)
    }

    if (imageSize) {
      updateData.image_size = safeParseInt(imageSize)
      console.log(`✅ Image size: ${updateData.image_size} bytes`)
    }

    console.log('📝 Final update data:', JSON.stringify(updateData, null, 2))

    // Execute the database update with comprehensive error handling
    console.log(`🔄 Executing Supabase update for generation ${generationId}...`)

    const { data, error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('id', generationId)
      .select()

    if (error) {
      console.error('❌ Failed to update generation:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        generationId,
        updateData,
        supabaseConfig: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
        }
      })

      return NextResponse.json({
        error: 'Failed to update generation',
        details: error.message,
        code: error.code,
        generationId,
        debug: {
          updateFields: Object.keys(updateData),
          errorCode: error.code,
          errorHint: error.hint
        }
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error('❌ No generation found with ID:', generationId)
      return NextResponse.json({
        error: 'Generation not found',
        generationId,
        debug: {
          queryExecuted: true,
          noRowsReturned: true
        }
      }, { status: 404 })
    }

    console.log(`✅ Successfully updated generation ${generationId}`)
    console.log('📊 Updated record:', JSON.stringify(data[0], null, 2))

    // Return success response immediately to avoid timeout
    const response = NextResponse.json({
      success: true,
      message: 'Ultra-realistic generation updated successfully',
      data: {
        generationId,
        status: updateData.status || status,
        generatedImageUrl: updateData.generated_image_url,
        qualityScore: finalQualityScore,
        commercialStyle,
        processingTime: updateData.processing_time,
        n8nExecutionId,
        workflowVersion,
        updatedAt: updateData.updated_at,
        recordData: data[0]
      }
    })

    // Set response headers to prevent timeout
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Cache-Control', 'no-cache')

    return response

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
