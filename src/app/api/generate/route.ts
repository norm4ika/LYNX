import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Upload image to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    // Create generation record
    const { data: generation, error: dbError } = await supabase
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
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    // Trigger N8N workflow
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            generationId: generation.id,
            userId: user.id,
            imageUrl: publicUrl,
            promptText: prompt,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`,
          }),
        })

        if (!n8nResponse.ok) {
          console.error('N8N webhook failed:', await n8nResponse.text())
        }
      } catch (n8nError) {
        console.error('N8N webhook error:', n8nError)
        // Don't fail the request if N8N is not available
      }
    }

    return NextResponse.json({
      generationId: generation.id,
      status: 'pending',
      message: 'Generation started successfully',
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
