import { NextResponse } from 'next/server'
import { withLangfuseTrace } from '@/lib/langfuse'
import { SwarmManager } from '@/lib/swarm-manager'

export async function POST(request: Request) {
  return withLangfuseTrace(
    async (trace) => {
      const body = await request.json()
      const swarmManager = SwarmManager.getInstance()
      
      // Create multiple tasks to demonstrate swarm activity
      const tasks = []
      
      // Research task
      tasks.push(await swarmManager.createTask(
        'search-analyze',
        { query: 'optimal swarm patterns', depth: 'comprehensive' },
        'high'
      ))
      
      // Coding task
      tasks.push(await swarmManager.createTask(
        'implement-feature',
        { feature: 'adaptive load balancing', complexity: 'medium' },
        'high'
      ))
      
      // Analysis task
      tasks.push(await swarmManager.createTask(
        'metrics-report',
        { metrics: ['performance', 'efficiency', 'throughput'], period: '24h' },
        'medium'
      ))
      
      // Testing task
      tasks.push(await swarmManager.createTask(
        'validate-system',
        { components: ['api', 'workers', 'consensus'], coverage: 0.8 },
        'medium'
      ))
      
      // Propose consensus for scaling decision
      const proposal = await swarmManager.proposeConsensus(
        'scale-up-workers',
        'auto-scaler',
        0.6
      )
      
      trace.update({
        metadata: {
          tasksCreated: tasks.length,
          consensusProposed: true
        }
      })
      
      return NextResponse.json({
        message: 'Swarm tasks initiated',
        tasks,
        consensusProposal: proposal,
        status: swarmManager.getSwarmStatus()
      })
    },
    'swarm-task-batch',
    { endpoint: '/api/swarm/tasks' }
  )
}