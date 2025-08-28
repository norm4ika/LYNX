import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const prompt = formData.get('prompt') as string

    if (!file || !prompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 })
    }

    // Upload image to Supabase Storage with detailed error handling
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    console.log('Attempting to upload file:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    })

    // Use supabaseAdmin for storage operations to bypass RLS
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', {
        error: uploadError,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        message: uploadError.message
      })

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
      webhookUrl: n8nWebhookUrl ? 'configured' : 'not configured'
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
