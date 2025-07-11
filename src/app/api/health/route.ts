import { NextResponse } from 'next/server'

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    region: process.env.FLY_REGION || 'unknown',
    instance: process.env.FLY_ALLOC_ID || 'local',
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
      unit: 'MB'
    }
  }

  return NextResponse.json(healthData)
}