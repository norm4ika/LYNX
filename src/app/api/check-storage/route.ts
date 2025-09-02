import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        console.log('Storage check requested')

        // Check if we can access storage
        const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()

        if (bucketError) {
            console.error('Storage access error:', bucketError)
            return NextResponse.json({
                error: 'Storage access failed',
                details: bucketError.message,
                status: 'error'
            }, { status: 500 })
        }

        console.log('Available buckets:', buckets)

        // Check for images bucket
        const imagesBucket = buckets?.find(b => b.name === 'images')

        if (!imagesBucket) {
            console.error('Images bucket not found')
            return NextResponse.json({
                error: 'Images bucket not found',
                details: 'The "images" bucket does not exist in Supabase Storage',
                status: 'missing_bucket',
                availableBuckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
                instructions: [
                    '1. Go to your Supabase Dashboard',
                    '2. Navigate to Storage section',
                    '3. Create a new bucket named "images"',
                    '4. Set it as public',
                    '5. Set file size limit to 15MB',
                    '6. Add allowed MIME types: image/jpeg, image/png, image/webp, image/heic, image/heif'
                ]
            }, { status: 404 })
        }

        // Check bucket configuration
        const bucketConfig = {
            id: imagesBucket.id,
            name: imagesBucket.name,
            public: imagesBucket.public,
            fileSizeLimit: imagesBucket.file_size_limit,
            allowedMimeTypes: imagesBucket.allowed_mime_types,
            createdAt: imagesBucket.created_at,
            updatedAt: imagesBucket.updated_at
        }

        console.log('Images bucket configuration:', bucketConfig)

        // Check if bucket has files
        const { data: files, error: filesError } = await supabaseAdmin.storage
            .from('images')
            .list('', { limit: 10 })

        if (filesError) {
            console.error('Files listing error:', filesError)
            return NextResponse.json({
                error: 'Files listing failed',
                details: filesError.message,
                status: 'error',
                bucket: bucketConfig
            }, { status: 500 })
        }

        // Check RLS policies
        const { data: policies, error: policiesError } = await supabaseAdmin
            .from('information_schema.policies')
            .select('*')
            .eq('table_name', 'objects')
            .eq('table_schema', 'storage')

        const storageStatus = {
            status: 'healthy',
            bucket: bucketConfig,
            fileCount: files?.length || 0,
            sampleFiles: files?.slice(0, 5) || [],
            policies: policies || [],
            recommendations: [] as string[]
        }

        // Add recommendations based on configuration
        if (!imagesBucket.public) {
            storageStatus.recommendations.push('Bucket should be public for image access')
        }

        if (!imagesBucket.file_size_limit || imagesBucket.file_size_limit < 15728640) {
            storageStatus.recommendations.push('File size limit should be at least 15MB')
        }

        if (!imagesBucket.allowed_mime_types || imagesBucket.allowed_mime_types.length === 0) {
            storageStatus.recommendations.push('Add allowed MIME types for images')
        }

        if (policies?.length === 0) {
            storageStatus.recommendations.push('No RLS policies found - consider adding access policies')
        }

        console.log('Storage status:', storageStatus)

        return NextResponse.json(storageStatus)

    } catch (error) {
        console.error('Storage check error:', error)
        return NextResponse.json({
            error: 'Storage check failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
        }, { status: 500 })
    }
}
