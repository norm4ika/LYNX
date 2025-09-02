import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 URL Repair Requested')

    // Get all generations with truncated or malformed URLs
    const { data: generations, error: dbError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .or('generated_image_url.like.*undefined*,generated_image_url.like.*/%')
      .eq('status', 'completed')

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to fetch generations',
        details: dbError.message
      }, { status: 500 })
    }

    console.log(`Found ${generations?.length || 0} generations with URL issues`)

    const repairResults: any[] = []
    let repairedCount = 0
    let skippedCount = 0

    for (const gen of generations || []) {
      const originalUrl = gen.generated_image_url
      let newUrl = originalUrl
      let repairAction = ''
      let skipReason = ''

      // Skip if no original URL to work with
      if (!originalUrl) {
        skipReason = 'No URL to repair'
        repairResults.push({
          id: gen.id,
          originalUrl,
          newUrl,
          success: false,
          error: skipReason,
          action: 'skipped'
        })
        skippedCount++
        continue
      }

      // Check if the original URL actually points to a real file
      let fileExists = false
      let actualFilePath = ''

      try {
        // Extract file path from URL
        if (originalUrl.includes('/storage/v1/object/public/')) {
          const urlParts = originalUrl.split('/storage/v1/object/public/')
          if (urlParts.length > 1) {
            actualFilePath = urlParts[1]

            // Check if file exists in storage
            const { data: fileData, error: fileError } = await supabaseAdmin.storage
              .from('images')
              .list(actualFilePath.split('/').slice(0, -1).join('/'), {
                limit: 100,
                search: actualFilePath.split('/').pop()
              })

            if (!fileError && fileData && fileData.length > 0) {
              fileExists = true
              console.log(`✅ File exists: ${actualFilePath}`)
            } else {
              console.log(`❌ File not found: ${actualFilePath}`)
            }
          }
        }
      } catch (checkError) {
        console.error(`Error checking file existence for ${gen.id}:`, checkError)
      }

      // Only attempt repair if we have a real file or if the URL is clearly malformed
      if (fileExists) {
        // File exists, try to fix the URL format
        if (originalUrl.includes('undefined')) {
          newUrl = originalUrl.replace(/undefined/g, '')
          repairAction = 'Removed undefined from URL'
        }
      } else {
        // File doesn't exist, mark as failed and suggest investigation
        skipReason = 'File does not exist in storage - N8N upload may have failed'
        repairResults.push({
          id: gen.id,
          originalUrl,
          newUrl,
          success: false,
          error: skipReason,
          action: 'skipped',
          fileExists: false,
          actualFilePath
        })
        skippedCount++
        continue
      }

      // If URL was repaired, update the database
      if (newUrl !== originalUrl && newUrl) {
        try {
          const { error: updateError } = await supabaseAdmin
            .from('generations')
            .update({
              generated_image_url: newUrl,
              updated_at: new Date().toISOString(),
              error_message: `URL repaired: ${repairAction}. Original: ${originalUrl}`
            })
            .eq('id', gen.id)

          if (updateError) {
            console.error(`Failed to update generation ${gen.id}:`, updateError)
            repairResults.push({
              id: gen.id,
              originalUrl,
              newUrl,
              success: false,
              error: updateError.message,
              action: 'failed_update'
            })
          } else {
            console.log(`✅ Repaired URL for generation ${gen.id}: ${originalUrl} → ${newUrl}`)
            repairResults.push({
              id: gen.id,
              originalUrl,
              newUrl,
              success: true,
              repairAction,
              action: 'repaired',
              fileExists: true
            })
            repairedCount++
          }
        } catch (updateError) {
          console.error(`Error updating generation ${gen.id}:`, updateError)
          repairResults.push({
            id: gen.id,
            originalUrl,
            newUrl,
            success: false,
            error: updateError instanceof Error ? updateError.message : 'Unknown error',
            action: 'failed_update'
          })
        }
      } else {
        // No repair needed
        repairResults.push({
          id: gen.id,
          originalUrl,
          newUrl,
          success: false,
          error: 'No repair needed',
          action: 'no_repair_needed',
          fileExists
        })
      }
    }

    console.log(`URL repair completed. Repaired: ${repairedCount}, Skipped: ${skippedCount}, Total: ${generations?.length || 0}`)

    return NextResponse.json({
      success: true,
      message: `URL repair completed. Repaired ${repairedCount} out of ${generations?.length || 0} generations.`,
      summary: {
        total: generations?.length || 0,
        repaired: repairedCount,
        skipped: skippedCount,
        failed: (generations?.length || 0) - repairedCount - skippedCount
      },
      results: repairResults,
      recommendations: [
        'Most URLs cannot be repaired because the actual files are missing from storage',
        'This indicates N8N workflow is failing to upload images to Supabase',
        'Check N8N workflow Supabase Upload node configuration',
        'Verify file path construction in N8N workflow',
        'Check if N8N workflow is properly handling file uploads',
        'Verify Supabase storage bucket permissions',
        'Check N8N workflow logs for upload errors'
      ],
      criticalIssue: 'Files are missing from storage - N8N upload is failing'
    })

  } catch (error) {
    console.error('URL repair error:', error)
    return NextResponse.json({
      error: 'URL repair failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
