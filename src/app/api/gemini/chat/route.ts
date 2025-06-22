import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new NextResponse('Missing prompt', { status: 400 })
    }

    console.log('Starting analysis with prompt length:', prompt.length)

    // Extract product name and context from the prompt
    const productMatch = prompt.match(/Product\/Service:\s*([^\n]+)/)
    const contextMatch = prompt.match(/Context:\s*([^\n]+)/)

    if (!productMatch || !contextMatch) {
      throw new Error('Invalid prompt format')
    }

    const productName = productMatch[1].trim()
    const context = contextMatch[1].trim()

    console.log('Sending to backend:', { productName, context })

    // Call backend service with increased timeout and retry logic
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minute timeout

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: productName,
          context: context
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error response:', errorData)
        throw new Error(`Backend service error: ${errorData}`)
      }

      // Create a ReadableStream to stream the response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No reader available')

            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
          } catch (error) {
            console.error('Streaming error:', error)
            controller.error(error)
          } finally {
            controller.close()
          }
        }
      })

      console.log('Analysis completed in:', Date.now() - startTime, 'ms')
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 10 minutes')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      responseTime: Date.now() - startTime,
      stack: error.stack
    })
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'An error occurred during analysis',
        details: error.message 
      }), 
      { status: 500 }
    )
  }
}
