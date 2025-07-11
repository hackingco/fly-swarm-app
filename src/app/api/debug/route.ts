import { NextResponse } from 'next/server'

export async function GET() {
  // Debug endpoint to check environment variables
  const envStatus = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      FLY_REGION: process.env.FLY_REGION,
      FLY_ALLOC_ID: process.env.FLY_ALLOC_ID,
      LANGFUSE_HOST: process.env.LANGFUSE_HOST,
      LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY ? 'Set' : 'Not set',
      LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY ? 'Set' : 'Not set',
    },
    runtime: {
      version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    }
  }

  return NextResponse.json(envStatus)
}