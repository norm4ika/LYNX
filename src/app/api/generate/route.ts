import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { validateImageFile, validateImageFileServerSafe, getFileExtension } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Missing or invalid authorization header'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify the token and get user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid token'
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const prompt = formData.get('prompt') as string

    if (!file || !prompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 })
    }

    console.log('File validation started:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    })

    // Enhanced file validation (server-safe)
    try {
      // Basic validation
      validateImageFile(file)

      // Server-safe content validation (no FileReader)
      const isValidContent = validateImageFileServerSafe(file)
      if (!isValidContent) {
        return NextResponse.json({
          error: 'Invalid image file',
          details: 'The uploaded file does not appear to be a valid image. Please try a different file.'
        }, { status: 400 })
      }
    } catch (validationError: any) {
      console.error('File validation failed:', validationError)
      return NextResponse.json({
        error: 'File validation failed',
        details: validationError.message
      }, { status: 400 })
    }

    // Enhanced file naming with better extension handling
    const fileExtension = getFileExtension(file.name) || 'jpg'
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`

    console.log('Attempting to upload file:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      fileExtension,
      userId: user.id
    })

    // First, ensure the storage bucket exists and user has access
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()
      if (bucketError) {
        console.error('Bucket listing error:', bucketError)
        return NextResponse.json({
          error: 'Storage configuration error',
          details: 'Unable to access storage buckets. Please check Supabase configuration.'
        }, { status: 500 })
      }

      console.log('Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })))

      const imagesBucket = buckets?.find(b => b.name === 'images')
      if (!imagesBucket) {
        console.error('Images bucket not found. Available buckets:', buckets?.map(b => b.name))
        return NextResponse.json({
          error: 'Storage bucket not configured',
          details: 'The "images" bucket does not exist in Supabase Storage. Please run the storage setup script.'
        }, { status: 500 })
      }

      console.log('Images bucket found:', {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public,
        fileSizeLimit: imagesBucket.file_size_limit
      })

      // Use supabaseAdmin for storage operations to bypass RLS
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || `image/${fileExtension}`
        })

      if (uploadError) {
        console.error('Upload error:', {
          error: uploadError,
          fileName,
          fileSize: file.size,
          fileType: file.type,
          message: uploadError.message,
          bucketName: 'images'
        })

        // Check if it's a bucket access issue
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          return NextResponse.json({
            error: 'Storage bucket not configured properly',
            details: 'Please ensure the "images" bucket exists in Supabase Storage and has proper permissions.'
          }, { status: 500 })
        }

        // Check if it's a file size issue
        if (uploadError.message.includes('too large') || uploadError.message.includes('size')) {
          return NextResponse.json({
            error: 'File too large for storage',
            details: 'The file size exceeds the storage limit. Please try a smaller image.'
          }, { status: 400 })
        }

        return NextResponse.json({
          error: 'Failed to upload image',
          details: uploadError.message,
          code: uploadError.name || 'UPLOAD_ERROR'
        }, { status: 500 })
      }

      console.log('Successfully uploaded file:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(fileName)

      console.log('Generated public URL:', publicUrl)

      // Ensure user exists in public.users table
      const { data: existingUser, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist in public.users, create them
        console.log('Creating user in public.users table:', user.id)
        const { error: userCreateError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (userCreateError) {
          console.error('Failed to create user:', userCreateError)
          return NextResponse.json({
            error: 'Failed to create user record',
            details: userCreateError.message
          }, { status: 500 })
        }
      } else if (userCheckError) {
        console.error('User check error:', userCheckError)
        return NextResponse.json({
          error: 'Failed to verify user',
          details: userCheckError.message
        }, { status: 500 })
      }

      // Create generation record using supabaseAdmin
      const { data: generation, error: dbError } = await supabaseAdmin
        .from('generations')
        .insert({
          user_id: user.id,
          original_image_url: publicUrl,
          prompt_text: prompt,
          status: 'pending',
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
      }

      console.log('Generation record created:', generation.id)

      // Trigger N8N workflow with improved error handling
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
      if (n8nWebhookUrl) {
        try {
          console.log('Triggering N8N workflow:', n8nWebhookUrl)

          const webhookPayload = {
            generationId: generation.id,
            userId: user.id,
            imageUrl: publicUrl,
            promptText: prompt,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/callback`,
            timestamp: new Date().toISOString(),
            userEmail: user.email,
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
              extension: fileExtension
            }
          }

          console.log('Webhook payload:', webhookPayload)

          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Normchikas-Saagento/1.0',
            },
            body: JSON.stringify(webhookPayload),
          })

          console.log('N8N response status:', n8nResponse.status)
          console.log('N8N response headers:', Object.fromEntries(n8nResponse.headers.entries()))

          if (n8nResponse.ok) {
            const responseText = await n8nResponse.text()
            console.log('N8N response body:', responseText)
          } else {
            const errorText = await n8nResponse.text()
            console.error('N8N webhook failed:', {
              status: n8nResponse.status,
              statusText: n8nResponse.statusText,
              body: errorText
            })

            // Update generation status to failed
            await supabaseAdmin
              .from('generations')
              .update({
                status: 'failed',
                error_message: `N8N webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`
              })
              .eq('id', generation.id)
          }
        } catch (n8nError) {
          console.error('N8N webhook error:', n8nError)

          // Update generation status to failed
          await supabaseAdmin
            .from('generations')
            .update({
              status: 'failed',
              error_message: `N8N webhook error: ${n8nError instanceof Error ? n8nError.message : 'Unknown error'}`
            })
            .eq('id', generation.id)
        }
      } else {
        console.warn('N8N_WEBHOOK_URL not configured')
      }

      return NextResponse.json({
        generationId: generation.id,
        status: 'pending',
        message: 'Ultra-realistic generation started successfully',
        webhookUrl: n8nWebhookUrl ? 'configured' : 'not configured',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: fileExtension
        }
      })

    } catch (storageError) {
      console.error('Storage operation error:', storageError)
      return NextResponse.json({
        error: 'Storage operation failed',
        details: storageError instanceof Error ? storageError.message : 'Unknown storage error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
