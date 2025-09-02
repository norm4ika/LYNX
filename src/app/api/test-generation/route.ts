import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { prompt, originalImageUrl } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({
        error: 'No prompt provided'
      }, { status: 400 })
    }

    console.log('🧪 Testing image generation with:', { prompt, originalImageUrl })

    // Create a test generation record
    const testGeneration = {
      user_id: 'test-user-id',
      prompt_text: prompt,
      original_image_url: originalImageUrl || 'https://example.com/test-image.jpg',
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Insert test generation
    const { data: generation, error: insertError } = await supabaseAdmin
      .from('generations')
      .insert(testGeneration)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create test generation:', insertError)
      return NextResponse.json({
        error: 'Failed to create test generation',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('✅ Test generation created:', generation.id)

    // Simulate N8N webhook call
    const n8nPayload = {
      generationId: generation.id,
      status: 'completed',
      generatedImageUrl: 'https://mcxqkpcknmriwwzwpetp.supabase.co/storage/v1/object/public/images/test_generated_image.png',
      workflowData: {
        test: true,
        prompt,
        timestamp: new Date().toISOString()
      },
      n8nExecutionId: 'test-execution-' + Date.now(),
      workflowVersion: '1.0.0'
    }

    console.log('🔄 Simulating N8N callback with payload:', n8nPayload)

    // Call the callback endpoint
    try {
      const callbackResponse = await fetch('http://localhost:3000/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      })

      const callbackData = await callbackResponse.json()
      
      if (callbackResponse.ok) {
        console.log('✅ N8N callback simulation successful:', callbackData)
        
        return NextResponse.json({
          success: true,
          message: 'Test generation and callback completed successfully',
          generationId: generation.id,
          callbackResponse: callbackData,
          testData: {
            originalPrompt: prompt,
            originalImageUrl,
            generatedImageUrl: n8nPayload.generatedImageUrl,
            n8nExecutionId: n8nPayload.n8nExecutionId
          }
        })
      } else {
        console.error('❌ N8N callback simulation failed:', callbackData)
        
        return NextResponse.json({
          success: false,
          message: 'Test generation created but callback failed',
          generationId: generation.id,
          callbackError: callbackData,
          testData: {
            originalPrompt: prompt,
            originalImageUrl,
            expectedGeneratedImageUrl: n8nPayload.generatedImageUrl
          }
        })
      }
    } catch (callbackError) {
      console.error('❌ Failed to simulate N8N callback:', callbackError)
      
      return NextResponse.json({
        success: false,
        message: 'Test generation created but callback simulation failed',
        generationId: generation.id,
        callbackError: callbackError instanceof Error ? callbackError.message : 'Unknown error',
        testData: {
          originalPrompt: prompt,
          originalImageUrl,
          expectedGeneratedImageUrl: n8nPayload.generatedImageUrl
        }
      })
    }

  } catch (error) {
    console.error('Test generation error:', error)
    return NextResponse.json({
      error: 'Test generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
