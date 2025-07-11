import { Langfuse } from 'langfuse'
import { LangfuseGenerationClient, LangfuseTraceClient } from 'langfuse'
import { getRuntimeConfig } from './get-runtime-config'

// Initialize Langfuse client with runtime configuration
const config = getRuntimeConfig()

// Debug logging
if (typeof window === 'undefined') {
  console.log('[Langfuse Init] Server-side configuration:', {
    hasPublicKey: !!config.langfuse.publicKey,
    hasSecretKey: !!config.langfuse.secretKey,
    host: config.langfuse.host,
    region: config.fly.region,
  })
}

export const langfuse = new Langfuse({
  publicKey: config.langfuse.publicKey,
  secretKey: config.langfuse.secretKey,
  baseUrl: config.langfuse.host,
  flushAt: 1,
  flushInterval: 1000,
})

// Trace types for swarm operations
export interface SwarmTrace {
  swarmId: string
  operation: string
  metadata?: Record<string, any>
}

// Create a new trace for swarm operations
export function createSwarmTrace(trace: SwarmTrace): LangfuseTraceClient {
  return langfuse.trace({
    name: `swarm-${trace.operation}`,
    metadata: {
      swarmId: trace.swarmId,
      ...trace.metadata,
    },
    tags: ['swarm', trace.operation],
  })
}

// Create a generation span within a trace
export function createGeneration(
  trace: LangfuseTraceClient,
  name: string,
  input: any,
  metadata?: Record<string, any>
): LangfuseGenerationClient {
  return trace.generation({
    name,
    input,
    metadata,
  })
}

// Utility to track worker operations
export async function traceWorkerOperation<T>(
  workerId: string,
  workerType: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const trace = langfuse.trace({
    name: `worker-${operation}`,
    metadata: {
      workerId,
      workerType,
      operation,
    },
    tags: ['worker', workerType, operation],
  })

  try {
    const start = Date.now()
    const result = await fn()
    const duration = Date.now() - start

    trace.update({
      output: result,
      metadata: {
        workerId,
        workerType,
        operation,
        duration,
        success: true,
      },
    })

    return result
  } catch (error) {
    trace.update({
      metadata: {
        workerId,
        workerType,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
    })
    throw error
  } finally {
    await langfuse.flush()
  }
}

// Middleware helper for API routes
export async function withLangfuseTrace<T>(
  handler: (trace: LangfuseTraceClient) => Promise<T>,
  name: string,
  metadata?: Record<string, any>
): Promise<T> {
  const trace = langfuse.trace({
    name,
    metadata,
    tags: ['api', name],
  })

  try {
    const result = await handler(trace)
    trace.update({
      output: result,
      metadata: {
        ...metadata,
        success: true,
      },
    })
    return result
  } catch (error) {
    trace.update({
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
    })
    throw error
  } finally {
    await langfuse.flush()
  }
}