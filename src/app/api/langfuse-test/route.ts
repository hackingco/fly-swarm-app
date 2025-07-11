import { NextResponse } from 'next/server'
import { langfuse } from '@/lib/langfuse'

export async function GET() {
  try {
    // Check if environment variables are set
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY
    const secretKey = process.env.LANGFUSE_SECRET_KEY
    const host = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
    
    // Debug: Check all environment variables starting with LANG
    const langEnvVars = Object.keys(process.env)
      .filter(key => key.startsWith('LANG'))
      .reduce((acc, key) => {
        acc[key] = key.includes('SECRET') ? `***${process.env[key]?.slice(-4) || ''}` : process.env[key]
        return acc
      }, {} as Record<string, any>)
    
    const config = {
      publicKeySet: !!publicKey,
      secretKeySet: !!secretKey,
      publicKeyLength: publicKey?.length || 0,
      secretKeyLength: secretKey?.length || 0,
      host: host,
      isProduction: process.env.NODE_ENV === 'production',
      flyRegion: process.env.FLY_REGION || 'not-on-fly',
      flyAllocId: process.env.FLY_ALLOC_ID || 'not-on-fly',
      langEnvVars: langEnvVars
    }
    
    // Create a test trace
    const trace = langfuse.trace({
      name: 'langfuse-connectivity-test',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        ...config
      },
      tags: ['test', 'connectivity']
    })
    
    // Update the trace with success
    trace.update({
      output: 'Test completed successfully',
      metadata: {
        ...config,
        success: true
      }
    })
    
    // Ensure the trace is sent
    await langfuse.flush()
    
    return NextResponse.json({
      status: 'success',
      message: 'Langfuse test trace created',
      config,
      traceUrl: `${host}/trace/${trace.id}`
    })
  } catch (error) {
    console.error('Langfuse test error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 })
  }
}