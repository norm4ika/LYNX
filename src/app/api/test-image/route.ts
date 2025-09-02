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

    // Test if the image URL is accessible with timeout
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout | null = null

    try {
      timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(imageUrl, {
        method: 'HEAD', // Only fetch headers, not the full image
        signal: controller.signal
      })

      // Clear timeout since fetch succeeded
      if (timeoutId) clearTimeout(timeoutId)

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
      // Clear timeout in case of error
      if (timeoutId) clearTimeout(timeoutId)

      console.error('❌ Fetch error:', fetchError)

      // Check if it's an abort error (timeout)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          accessible: false,
          error: 'Request timeout',
          details: 'Image URL request timed out after 5 seconds'
        })
      }

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
