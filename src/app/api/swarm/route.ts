import { NextResponse } from 'next/server'
import { withLangfuseTrace } from '@/lib/langfuse'
import { SwarmManager } from '@/lib/swarm-manager'

export async function GET() {
  return withLangfuseTrace(
    async (trace) => {
      const swarmManager = SwarmManager.getInstance()
      const status = swarmManager.getSwarmStatus()
      
      const swarmData = {
        swarmId: status.swarmId,
        name: 'fly-swarm-app',
        status: 'active',
        queen: {
          type: 'strategic',
          status: 'coordinating',
          lastUpdate: new Date().toISOString()
        },
        workers: status.workers.map(w => ({
          id: w.id,
          type: w.type,
          status: w.status,
          currentTask: w.currentTask,
          performance: w.performance
        })),
        metrics: {
          totalTasks: status.completedTasks + status.activeTasks + status.queuedTasks,
          completedTasks: status.completedTasks,
          activeTasks: status.activeTasks,
          queuedTasks: status.queuedTasks,
          consensusAlgorithm: 'majority',
          efficiency: status.workers.reduce((acc, w) => acc + w.performance.successRate, 0) / status.workers.length
        },
        consensusProposals: status.consensusProposals,
        region: process.env.FLY_REGION || 'local',
        instance: process.env.FLY_ALLOC_ID || 'local-dev'
      }

      trace.update({
        metadata: {
          swarmId: swarmData.swarmId,
          workerCount: swarmData.workers.length,
          region: swarmData.region,
          activeTasks: swarmData.metrics.activeTasks,
          queuedTasks: swarmData.metrics.queuedTasks
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
      const swarmManager = SwarmManager.getInstance()
      
      let response: any = {
        timestamp: new Date().toISOString(),
      }

      try {
        switch (body.command) {
          case 'create-task':
            const task = await swarmManager.createTask(
              body.taskType || 'general',
              body.data || {},
              body.priority || 'medium'
            )
            response = {
              ...response,
              message: 'Task created successfully',
              task
            }
            break

          case 'propose-consensus':
            const proposal = await swarmManager.proposeConsensus(
              body.topic || 'general-decision',
              body.proposer || 'api-client',
              body.threshold || 0.5
            )
            response = {
              ...response,
              message: 'Consensus proposal created',
              proposal
            }
            break

          case 'scale-workers':
            await swarmManager.scaleWorkers(
              body.workerType || 'researcher',
              body.count || 1
            )
            response = {
              ...response,
              message: `Scaled ${body.workerType} workers to ${body.count}`,
              newStatus: swarmManager.getSwarmStatus()
            }
            break

          default:
            response = {
              ...response,
              message: 'Unknown command',
              command: body.command,
              availableCommands: ['create-task', 'propose-consensus', 'scale-workers']
            }
        }

        trace.update({
          metadata: {
            command: body.command,
            success: true,
            ...body
          }
        })

      } catch (error) {
        response = {
          ...response,
          error: error instanceof Error ? error.message : 'Unknown error',
          command: body.command
        }
        
        trace.update({
          metadata: {
            command: body.command,
            success: false,
            error: response.error
          }
        })
      }

      return NextResponse.json(response)
    },
    'swarm-command',
    { endpoint: '/api/swarm', method: 'POST' }
  )
}