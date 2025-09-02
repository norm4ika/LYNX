import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    console.log('🔍 N8N Workflow Validation Requested:', action)

    let results = {}

    switch (action) {
      case 'test-callback':
        // Test if N8N can reach our callback endpoint
        try {
          const testPayload = {
            generationId: 'test-' + Date.now(),
            status: 'test',
            generatedImageUrl: 'https://example.com/test.png',
            n8nExecutionId: 'test-execution-' + Date.now()
          }

          const response = await fetch('http://localhost:3000/api/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
          })

          const data = await response.json()
          
          results = {
            success: response.ok,
            status: response.status,
            response: data,
            message: response.ok ? 'Callback endpoint is accessible' : 'Callback endpoint returned error'
          }
        } catch (error) {
          results = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to test callback endpoint'
          }
        }
        break

      case 'test-storage':
        // Test Supabase storage connectivity
        try {
          const response = await fetch('http://localhost:3000/api/check-storage')
          const data = await response.json()
          
          results = {
            success: response.ok,
            status: response.status,
            response: data,
            message: response.ok ? 'Storage check successful' : 'Storage check failed'
          }
        } catch (error) {
          results = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to test storage connectivity'
          }
        }
        break

      case 'test-generation':
        // Test complete generation flow
        try {
          const testPayload = {
            prompt: 'Test generation for N8N validation',
            originalImageUrl: 'https://example.com/test-original.jpg'
          }

          const response = await fetch('http://localhost:3000/api/test-generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
          })

          const data = await response.json()
          
          results = {
            success: response.ok,
            status: response.status,
            response: data,
            message: response.ok ? 'Test generation successful' : 'Test generation failed'
          }
        } catch (error) {
          results = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to test generation flow'
          }
        }
        break

      default:
        results = {
          success: false,
          error: 'Invalid action',
          message: 'Supported actions: test-callback, test-storage, test-generation'
        }
    }

    console.log('N8N validation results:', results)

    return NextResponse.json({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check N8N workflow webhook configuration',
        'Verify N8N can reach host.docker.internal:3000',
        'Check N8N workflow Supabase Upload node',
        'Verify API keys and permissions',
        'Check N8N workflow execution logs'
      ]
    })

  } catch (error) {
    console.error('N8N validation error:', error)
    return NextResponse.json({
      error: 'N8N validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
