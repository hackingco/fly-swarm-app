import { langfuse, createSwarmTrace, createGeneration } from './langfuse'
import { LangfuseTraceClient } from 'langfuse'

export interface SwarmEvent {
  type: 'consensus' | 'task' | 'communication' | 'memory' | 'spawn'
  swarmId: string
  timestamp: Date
  data: any
}

export interface ConsensusEvent {
  topic: string
  votes: Record<string, any>
  result: any
  participants: string[]
}

export interface TaskEvent {
  taskId: string
  workerId: string
  status: 'assigned' | 'started' | 'completed' | 'failed'
  duration?: number
  error?: string
}

export class SwarmTracer {
  private swarmId: string
  private trace: LangfuseTraceClient | null = null

  constructor(swarmId: string) {
    this.swarmId = swarmId
  }

  // Initialize a new swarm session trace
  startSession(objective: string, queenType: string, workerCount: number) {
    this.trace = createSwarmTrace({
      swarmId: this.swarmId,
      operation: 'session-start',
      metadata: {
        objective,
        queenType,
        workerCount,
        startTime: new Date().toISOString(),
      },
    })
    return this.trace
  }

  // End the swarm session
  async endSession(results?: any) {
    if (this.trace) {
      this.trace.update({
        output: results,
        metadata: {
          endTime: new Date().toISOString(),
        },
      })
      await langfuse.flush()
    }
  }

  // Track consensus voting
  async traceConsensus(event: ConsensusEvent) {
    if (!this.trace) return

    const generation = createGeneration(
      this.trace,
      'consensus-vote',
      {
        topic: event.topic,
        participants: event.participants,
      },
      {
        votes: event.votes,
        result: event.result,
        timestamp: new Date().toISOString(),
      }
    )

    generation.end({
      output: event.result,
    })
  }

  // Track task execution
  async traceTask(event: TaskEvent) {
    if (!this.trace) return

    const generation = createGeneration(
      this.trace,
      'task-execution',
      {
        taskId: event.taskId,
        workerId: event.workerId,
        status: event.status,
      },
      {
        duration: event.duration,
        error: event.error,
        timestamp: new Date().toISOString(),
      }
    )

    generation.end({
      output: {
        status: event.status,
        success: event.status === 'completed',
      },
    })
  }

  // Track worker spawning
  async traceWorkerSpawn(workerType: string, workerId: string) {
    if (!this.trace) return

    const generation = createGeneration(
      this.trace,
      'worker-spawn',
      {
        workerType,
        workerId,
      },
      {
        timestamp: new Date().toISOString(),
      }
    )

    generation.end({
      output: {
        workerId,
        spawned: true,
      },
    })
  }

  // Track memory operations
  async traceMemoryOperation(operation: 'store' | 'retrieve', key: string, value?: any) {
    if (!this.trace) return

    const generation = createGeneration(
      this.trace,
      `memory-${operation}`,
      {
        key,
        value: operation === 'store' ? value : undefined,
      },
      {
        timestamp: new Date().toISOString(),
      }
    )

    generation.end({
      output: {
        key,
        operation,
        success: true,
      },
    })
  }

  // Track inter-agent communication
  async traceCommunication(fromAgent: string, toAgent: string, message: any) {
    if (!this.trace) return

    const generation = createGeneration(
      this.trace,
      'agent-communication',
      {
        from: fromAgent,
        to: toAgent,
        message,
      },
      {
        timestamp: new Date().toISOString(),
      }
    )

    generation.end({
      output: {
        delivered: true,
      },
    })
  }

  // Generic event tracking
  async trackEvent(event: SwarmEvent) {
    switch (event.type) {
      case 'consensus':
        await this.traceConsensus(event.data as ConsensusEvent)
        break
      case 'task':
        await this.traceTask(event.data as TaskEvent)
        break
      case 'spawn':
        await this.traceWorkerSpawn(event.data.workerType, event.data.workerId)
        break
      case 'memory':
        await this.traceMemoryOperation(
          event.data.operation,
          event.data.key,
          event.data.value
        )
        break
      case 'communication':
        await this.traceCommunication(
          event.data.from,
          event.data.to,
          event.data.message
        )
        break
    }
  }
}

// Global swarm tracer instance
let globalTracer: SwarmTracer | null = null

export function initializeSwarmTracer(swarmId: string): SwarmTracer {
  globalTracer = new SwarmTracer(swarmId)
  return globalTracer
}

export function getSwarmTracer(): SwarmTracer | null {
  return globalTracer
}