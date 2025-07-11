import { langfuse, traceWorkerOperation } from './langfuse'
import { initializeSwarmTracer, getSwarmTracer } from './swarm-tracer'

export interface Worker {
  id: string
  type: 'researcher' | 'coder' | 'analyst' | 'tester'
  status: 'idle' | 'busy' | 'offline'
  currentTask?: string
  capabilities: string[]
  performance: {
    tasksCompleted: number
    averageTime: number
    successRate: number
  }
}

export interface Task {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  data: any
  result?: any
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface ConsensusProposal {
  id: string
  topic: string
  proposer: string
  votes: Map<string, boolean>
  threshold: number
  deadline: Date
  status: 'open' | 'approved' | 'rejected'
}

export class SwarmManager {
  private static instance: SwarmManager
  private workers: Map<string, Worker> = new Map()
  private tasks: Map<string, Task> = new Map()
  private taskQueue: Task[] = []
  private consensusProposals: Map<string, ConsensusProposal> = new Map()
  private swarmId: string
  private tracer: ReturnType<typeof initializeSwarmTracer>

  private constructor() {
    this.swarmId = `swarm-${Date.now()}`
    this.tracer = initializeSwarmTracer(this.swarmId)
    this.tracer.startSession('Fly.io Enhanced Swarm', 'strategic', 4)
    this.initializeWorkers()
  }

  static getInstance(): SwarmManager {
    if (!SwarmManager.instance) {
      SwarmManager.instance = new SwarmManager()
    }
    return SwarmManager.instance
  }

  private initializeWorkers() {
    const workerTypes: Array<Worker['type']> = ['researcher', 'coder', 'analyst', 'tester']
    
    workerTypes.forEach((type, index) => {
      const worker: Worker = {
        id: `worker-${index + 1}`,
        type,
        status: 'idle',
        capabilities: this.getWorkerCapabilities(type),
        performance: {
          tasksCompleted: 0,
          averageTime: 0,
          successRate: 100
        }
      }
      this.workers.set(worker.id, worker)
      this.tracer.traceWorkerSpawn(type, worker.id)
    })
  }

  private getWorkerCapabilities(type: Worker['type']): string[] {
    switch (type) {
      case 'researcher':
        return ['search', 'analyze', 'summarize', 'extract']
      case 'coder':
        return ['implement', 'refactor', 'debug', 'optimize']
      case 'analyst':
        return ['evaluate', 'metrics', 'report', 'visualize']
      case 'tester':
        return ['test', 'validate', 'benchmark', 'verify']
    }
  }

  async createTask(type: string, data: any, priority: Task['priority'] = 'medium'): Promise<Task> {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      priority,
      status: 'pending',
      data,
      createdAt: new Date()
    }

    this.tasks.set(task.id, task)
    this.taskQueue.push(task)
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    await this.assignTasks()
    return task
  }

  private async assignTasks() {
    const availableWorkers = Array.from(this.workers.values()).filter(w => w.status === 'idle')
    
    while (this.taskQueue.length > 0 && availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!
      const worker = this.selectBestWorker(task, availableWorkers)
      
      if (worker) {
        await this.assignTaskToWorker(task, worker)
        availableWorkers.splice(availableWorkers.indexOf(worker), 1)
      } else {
        // No suitable worker, put task back
        this.taskQueue.unshift(task)
        break
      }
    }
  }

  private selectBestWorker(task: Task, availableWorkers: Worker[]): Worker | null {
    // Simple selection based on task type and worker capabilities
    const suitableWorkers = availableWorkers.filter(worker => {
      if (task.type.includes('search') || task.type.includes('analyze')) {
        return worker.type === 'researcher'
      }
      if (task.type.includes('implement') || task.type.includes('code')) {
        return worker.type === 'coder'
      }
      if (task.type.includes('test') || task.type.includes('validate')) {
        return worker.type === 'tester'
      }
      if (task.type.includes('metric') || task.type.includes('report')) {
        return worker.type === 'analyst'
      }
      return true
    })

    // Select worker with best performance
    return suitableWorkers.sort((a, b) => b.performance.successRate - a.performance.successRate)[0] || null
  }

  private async assignTaskToWorker(task: Task, worker: Worker) {
    task.assignedTo = worker.id
    task.status = 'assigned'
    task.startedAt = new Date()
    
    worker.status = 'busy'
    worker.currentTask = task.id

    await this.tracer.traceTask({
      taskId: task.id,
      workerId: worker.id,
      status: 'assigned'
    })

    // Simulate task execution
    this.executeTask(task, worker)
  }

  private async executeTask(task: Task, worker: Worker) {
    const startTime = Date.now()

    try {
      // Simulate processing with traced operation
      const result = await traceWorkerOperation(
        worker.id,
        worker.type,
        task.type,
        async () => {
          // Simulate work based on task type
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
          
          // Generate mock result
          return {
            success: true,
            data: `Task ${task.id} completed by ${worker.id}`,
            metrics: {
              processingTime: Date.now() - startTime,
              confidence: 0.85 + Math.random() * 0.15
            }
          }
        }
      )

      task.status = 'completed'
      task.result = result
      task.completedAt = new Date()

      // Update worker performance
      const duration = Date.now() - startTime
      worker.performance.tasksCompleted++
      worker.performance.averageTime = 
        (worker.performance.averageTime * (worker.performance.tasksCompleted - 1) + duration) / 
        worker.performance.tasksCompleted

      await this.tracer.traceTask({
        taskId: task.id,
        workerId: worker.id,
        status: 'completed',
        duration
      })

    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      
      worker.performance.successRate = 
        (worker.performance.successRate * worker.performance.tasksCompleted) / 
        (worker.performance.tasksCompleted + 1)

      await this.tracer.traceTask({
        taskId: task.id,
        workerId: worker.id,
        status: 'failed',
        error: task.error
      })
    } finally {
      worker.status = 'idle'
      worker.currentTask = undefined
      
      // Try to assign more tasks
      await this.assignTasks()
    }
  }

  async proposeConsensus(topic: string, proposer: string, threshold: number = 0.5): Promise<ConsensusProposal> {
    const proposal: ConsensusProposal = {
      id: `consensus-${Date.now()}`,
      topic,
      proposer,
      votes: new Map(),
      threshold,
      deadline: new Date(Date.now() + 30000), // 30 seconds
      status: 'open'
    }

    this.consensusProposals.set(proposal.id, proposal)

    // Simulate worker voting
    setTimeout(() => this.simulateVoting(proposal), 1000)

    return proposal
  }

  private async simulateVoting(proposal: ConsensusProposal) {
    const workers = Array.from(this.workers.values())
    
    for (const worker of workers) {
      // Simulate worker decision based on their type and the topic
      const vote = Math.random() > 0.3 // 70% approval rate
      proposal.votes.set(worker.id, vote)
      
      await this.tracer.traceCommunication(
        worker.id,
        'queen',
        { type: 'vote', proposalId: proposal.id, vote }
      )
    }

    // Check if consensus reached
    const approvals = Array.from(proposal.votes.values()).filter(v => v).length
    const totalVotes = proposal.votes.size
    const approvalRate = approvals / totalVotes

    proposal.status = approvalRate >= proposal.threshold ? 'approved' : 'rejected'

    await this.tracer.traceConsensus({
      topic: proposal.topic,
      votes: Object.fromEntries(proposal.votes),
      result: proposal.status,
      participants: Array.from(proposal.votes.keys())
    })
  }

  getSwarmStatus() {
    return {
      swarmId: this.swarmId,
      workers: Array.from(this.workers.values()),
      activeTasks: Array.from(this.tasks.values()).filter(t => 
        t.status === 'assigned' || t.status === 'in_progress'
      ).length,
      queuedTasks: this.taskQueue.length,
      completedTasks: Array.from(this.tasks.values()).filter(t => 
        t.status === 'completed'
      ).length,
      consensusProposals: Array.from(this.consensusProposals.values())
    }
  }

  async scaleWorkers(workerType: Worker['type'], count: number) {
    const currentCount = Array.from(this.workers.values())
      .filter(w => w.type === workerType).length
    
    if (count > currentCount) {
      // Add workers
      for (let i = 0; i < count - currentCount; i++) {
        const workerId = `worker-${this.workers.size + 1}`
        const worker: Worker = {
          id: workerId,
          type: workerType,
          status: 'idle',
          capabilities: this.getWorkerCapabilities(workerType),
          performance: {
            tasksCompleted: 0,
            averageTime: 0,
            successRate: 100
          }
        }
        this.workers.set(workerId, worker)
        await this.tracer.traceWorkerSpawn(workerType, workerId)
      }
    } else if (count < currentCount) {
      // Remove idle workers
      const workersToRemove = Array.from(this.workers.values())
        .filter(w => w.type === workerType && w.status === 'idle')
        .slice(0, currentCount - count)
      
      for (const worker of workersToRemove) {
        this.workers.delete(worker.id)
      }
    }

    // Reassign tasks if needed
    await this.assignTasks()
  }
}