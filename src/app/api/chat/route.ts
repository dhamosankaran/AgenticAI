import { NextResponse } from 'next/server'
import { analyzeMarket } from '@/lib/api-client'
import { ResearchRequest, ResearchResponse } from '@/types/research'

export async function POST(req: Request) {
  try {
    let body;

    try {
      body = await req.json()
      console.log('API Route - Received request body:', body)
    } catch (jsonError) {
      console.error('API Route - JSON Parsing Error:', jsonError)
      return new NextResponse('Invalid request body', { status: 400 })
    }

    // Handle the prompt-wrapped format
    let request: ResearchRequest;
    try {
      if (typeof body.prompt === 'string') {
        const promptData = JSON.parse(body.prompt)
        request = {
          product_name: promptData.product_name || "",
          context: promptData.context || ''
        }
      } else {
        request = {
          product_name: body.product_name || "",
          context: body.context || ''
        }
      }
      console.log('API Route - Processed request:', request)
    } catch (parseError) {
      console.error('API Route - Prompt Parsing Error:', parseError)
      return new NextResponse('Invalid prompt format', { status: 400 })
    }

    // Validate required fields
    if (!request.product_name) {
      console.error('API Route - Missing product name')
      return new NextResponse('Product name is required', { status: 400 })
    }

    // Create a transform stream to handle the response
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start the analysis in the background
    analyzeMarket(request).then(async (response) => {
      try {
        // Send the response as a stream
        const data = `data: ${JSON.stringify(response)}\n\n`
        await writer.write(encoder.encode(data))
      } catch (error) {
        console.error('Error writing response:', error)
      } finally {
        writer.close()
      }
    }).catch(async (error) => {
      console.error('API Route - Analysis Error:', error)
      const errorResponse: ResearchResponse = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          status: 'error'
        },
        results: {
          manager: {
            content: '',
            status: 'error',
            timestamp: new Date().toISOString()
          },
          market: {
            content: '',
            status: 'error',
            timestamp: new Date().toISOString()
          },
          consumer: {
            content: '',
            status: 'error',
            timestamp: new Date().toISOString()
          },
          industry: {
            content: '',
            status: 'error',
            timestamp: new Date().toISOString()
          }
        },
        errors: { 
          system_error: error.message || 'Unknown error'
        }
      }
      try {
        const data = `data: ${JSON.stringify(errorResponse)}\n\n`
        await writer.write(encoder.encode(data))
      } catch (writeError) {
        console.error('Error writing error response:', writeError)
      } finally {
        writer.close()
      }
    })

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('API Route - Unhandled Error:', error)
    const errorResponse: ResearchResponse = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.0',
        status: 'error'
      },
      results: {
        manager: {
          content: '',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        market: {
          content: '',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        consumer: {
          content: '',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        industry: {
          content: '',
          status: 'error',
          timestamp: new Date().toISOString()
        }
      },
      errors: { 
        system_error: error.message || 'Unknown error'
      }
    }

    return new NextResponse(
      JSON.stringify(errorResponse),
      { 
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}