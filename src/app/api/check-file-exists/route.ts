import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({
        error: 'Missing fileUrl parameter'
      }, { status: 400 })
    }

    console.log(`🔍 Checking file existence for: ${fileUrl}`)

    // Extract file path from URL
    let filePath = ''
    let bucketName = ''

    if (fileUrl.includes('/storage/v1/object/public/')) {
      const urlParts = fileUrl.split('/storage/v1/object/public/')
      if (urlParts.length > 1) {
        filePath = urlParts[1]
        bucketName = 'images' // Default bucket name
      }
    }

    if (!filePath) {
      return NextResponse.json({
        error: 'Invalid Supabase storage URL format',
        fileUrl,
        expectedFormat: 'https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]'
      }, { status: 400 })
    }

    console.log(`📁 Checking bucket: ${bucketName}, path: ${filePath}`)

    // Check if file exists in storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from(bucketName)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        limit: 100,
        search: filePath.split('/').pop()
      })

    if (fileError) {
      console.error('Storage error:', fileError)
      return NextResponse.json({
        error: 'Failed to check storage',
        details: fileError.message,
        fileUrl,
        filePath,
        bucketName
      }, { status: 500 })
    }

    const fileName = filePath.split('/').pop()
    const fileExists = fileData && fileData.some(file => file.name === fileName)

    // Get file metadata if it exists
    let fileMetadata = null
    if (fileExists) {
      try {
        const { data: metadata } = await supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        if (metadata) {
          fileMetadata = {
            publicUrl: metadata.publicUrl,
            size: fileData.find(f => f.name === fileName)?.metadata?.size,
            mimeType: fileData.find(f => f.name === fileName)?.metadata?.mimetype,
            lastModified: fileData.find(f => f.name === fileName)?.metadata?.lastModified
          }
        }
      } catch (metadataError) {
        console.error('Metadata error:', metadataError)
      }
    }

    // Test if the file is actually accessible
    let isAccessible = false
    let httpStatus = null
    let contentType = null

    if (fileExists) {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' })
        httpStatus = response.status
        contentType = response.headers.get('content-type')
        isAccessible = response.ok
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        isAccessible = false
      }
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      filePath,
      bucketName,
      fileExists,
      isAccessible,
      httpStatus,
      contentType,
      fileMetadata,
      storageData: fileData,
      recommendations: fileExists ? [
        'File exists in storage',
        'Check if file permissions are correct',
        'Verify RLS policies allow public access'
      ] : [
        'File does not exist in storage',
        'N8N workflow may have failed to upload',
        'Check N8N workflow logs for upload errors',
        'Verify Supabase storage bucket configuration'
      ]
    })

  } catch (error) {
    console.error('Check file exists error:', error)
    return NextResponse.json({
      error: 'Failed to check file existence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
