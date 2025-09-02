import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        error: 'Failed to list buckets',
        details: bucketsError.message,
        code: bucketsError.name
      }, { status: 500 })
    }

    // Check if 'images' bucket exists
    const imagesBucket = buckets.find(bucket => bucket.name === 'images')
    
    if (!imagesBucket) {
      return NextResponse.json({
        error: 'Images bucket not found',
        availableBuckets: buckets.map(b => b.name),
        message: 'Please create an "images" bucket in Supabase Storage'
      }, { status: 404 })
    }

    // Test bucket permissions
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('images')
      .list('', { limit: 1 })

    if (filesError) {
      return NextResponse.json({
        error: 'Failed to access images bucket',
        details: filesError.message,
        code: filesError.name
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'Storage is properly configured',
      bucket: {
        name: imagesBucket.name,
        id: imagesBucket.id,
        public: imagesBucket.public,
        fileSizeLimit: imagesBucket.file_size_limit,
        allowedMimeTypes: imagesBucket.allowed_mime_types
      },
      files: files || [],
      message: 'Storage bucket is accessible and ready for uploads'
    })

  } catch (error) {
    console.error('Storage debug error:', error)
    return NextResponse.json({
      error: 'Storage debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
