import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({
        error: 'No image URL provided'
      }, { status: 400 })
    }

    console.log('Testing image URL:', imageUrl)

    try {
      // Test if the image URL is accessible
      const response = await fetch(imageUrl, {
        method: 'HEAD', // Only fetch headers, not the full image
        timeout: 5000
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        
        console.log('✅ Image accessible:', {
          url: imageUrl,
          status: response.status,
          contentType,
          contentLength
        })

        return NextResponse.json({
          success: true,
          accessible: true,
          status: response.status,
          contentType,
          contentLength,
          headers: Object.fromEntries(response.headers.entries())
        })
      } else {
        console.error('❌ Image not accessible:', {
          url: imageUrl,
          status: response.status,
          statusText: response.statusText
        })

        return NextResponse.json({
          success: false,
          accessible: false,
          status: response.status,
          statusText: response.statusText,
          error: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError)
      
      return NextResponse.json({
        success: false,
        accessible: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        details: 'Failed to fetch image URL'
      })
    }

  } catch (error) {
    console.error('Test image error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
