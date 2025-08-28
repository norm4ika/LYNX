import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generationId, generatedImageUrl, status, errorMessage } = body

    if (!generationId) {
      return NextResponse.json({ error: 'Missing generationId' }, { status: 400 })
    }

    // Update generation record
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (generatedImageUrl) {
      updateData.generated_image_url = generatedImageUrl
    }

    if (status) {
      updateData.status = status
    }

    if (errorMessage) {
      updateData.error_message = errorMessage
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('id', generationId)

    if (error) {
      console.error('Failed to update generation:', error)
      return NextResponse.json({ error: 'Failed to update generation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Generation updated successfully' 
    })

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
