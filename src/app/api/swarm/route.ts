import { NextResponse } from 'next/server'
import { withLangfuseTrace } from '@/lib/langfuse'
import { initializeSwarmTracer, getSwarmTracer } from '@/lib/swarm-tracer'

// Initialize swarm ID for this instance
const SWARM_ID = `swarm-${Date.now()}`

export async function GET() {
  return withLangfuseTrace(
    async (trace) => {
      const swarmData = {
        swarmId: SWARM_ID,
        name: 'fly-swarm-app',
        status: 'active',
        queen: {
          type: 'strategic',
          status: 'coordinating',
          lastUpdate: new Date().toISOString()
        },
        workers: [
          { id: 'worker-1', type: 'researcher', status: 'idle', tasks: 0 },
          { id: 'worker-2', type: 'coder', status: 'idle', tasks: 0 },
          { id: 'worker-3', type: 'analyst', status: 'idle', tasks: 0 },
          { id: 'worker-4', type: 'tester', status: 'idle', tasks: 0 }
        ],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
          consensusAlgorithm: 'majority',
          efficiency: 100
        },
        region: process.env.FLY_REGION || 'local',
        instance: process.env.FLY_ALLOC_ID || 'local-dev'
      }

      trace.update({
        metadata: {
          swarmId: swarmData.swarmId,
          workerCount: swarmData.workers.length,
          region: swarmData.region,
        }
      })

      return NextResponse.json(swarmData)
    },
    'swarm-status',
    { endpoint: '/api/swarm' }
  )
}

export async function POST(request: Request) {
  return withLangfuseTrace(
    async (trace) => {
      const body = await request.json()
      
      // Initialize swarm tracer if not already done
      let tracer = getSwarmTracer()
      if (!tracer) {
        tracer = initializeSwarmTracer(SWARM_ID)
        tracer.startSession('Fly.io Swarm Application', 'strategic', 4)
      }

      // Track the command as a swarm event
      if (body.command === 'start' && body.workerId) {
        await tracer.traceTask({
          taskId: `task-${Date.now()}`,
          workerId: body.workerId,
          status: 'assigned',
        })
      }

      const response = {
        message: 'Swarm command received',
        command: body.command || 'unknown',
        workerId: body.workerId,
        timestamp: new Date().toISOString(),
        result: 'Command queued for processing'
      }

      trace.update({
        metadata: {
          command: body.command,
          workerId: body.workerId,
        }
      })

      return NextResponse.json(response)
    },
    'swarm-command',
    { endpoint: '/api/swarm', method: 'POST' }
  )
}