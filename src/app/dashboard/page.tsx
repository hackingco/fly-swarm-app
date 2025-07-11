'use client'

import { useEffect, useState } from 'react'

interface Worker {
  id: string
  type: string
  status: string
  currentTask?: string
  performance: {
    tasksCompleted: number
    averageTime: number
    successRate: number
  }
}

interface SwarmData {
  swarmId: string
  name: string
  status: string
  workers: Worker[]
  metrics: {
    totalTasks: number
    completedTasks: number
    activeTasks: number
    queuedTasks: number
    efficiency: number
  }
  consensusProposals: Array<{
    id: string
    topic: string
    status: string
    votes: any
  }>
}

export default function Dashboard() {
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    const fetchSwarmData = async () => {
      try {
        const response = await fetch('/api/swarm')
        const data = await response.json()
        setSwarmData(data)
      } catch (error) {
        console.error('Failed to fetch swarm data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSwarmData()
    const interval = setInterval(fetchSwarmData, 2000)
    return () => clearInterval(interval)
  }, [])

  const activateSwarm = async () => {
    setActivating(true)
    try {
      const response = await fetch('/api/swarm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await response.json()
      console.log('Swarm activated:', data)
    } catch (error) {
      console.error('Failed to activate swarm:', error)
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading swarm data...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Swarm Dashboard</h1>
        <button
          onClick={activateSwarm}
          disabled={activating}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {activating ? 'Activating...' : 'Activate Swarm'}
        </button>
      </div>
      
      {swarmData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Swarm Status</h2>
              <p className="text-sm">ID: {swarmData.swarmId.slice(0, 16)}...</p>
              <p>Status: <span className="text-green-500 font-bold">{swarmData.status}</span></p>
              <p>Workers: {swarmData.workers.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Task Metrics</h2>
              <p>Total: {swarmData.metrics.totalTasks}</p>
              <p>Active: <span className="text-yellow-500">{swarmData.metrics.activeTasks}</span></p>
              <p>Queued: <span className="text-blue-500">{swarmData.metrics.queuedTasks}</span></p>
              <p>Completed: <span className="text-green-500">{swarmData.metrics.completedTasks}</span></p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Performance</h2>
              <p>Efficiency: <span className="text-2xl font-bold">{swarmData.metrics.efficiency.toFixed(1)}%</span></p>
              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${swarmData.metrics.efficiency}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Consensus</h2>
              <p>Active Proposals: {swarmData.consensusProposals.filter(p => p.status === 'open').length}</p>
              <p>Approved: {swarmData.consensusProposals.filter(p => p.status === 'approved').length}</p>
              <p>Rejected: {swarmData.consensusProposals.filter(p => p.status === 'rejected').length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Worker Status</h2>
              <div className="space-y-3">
                {swarmData.workers.map(worker => (
                  <div key={worker.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold capitalize">{worker.type}</span>
                        <span className="text-sm text-gray-500 ml-2">({worker.id})</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        worker.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        worker.status === 'idle' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {worker.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Completed: {worker.performance.tasksCompleted}</p>
                      <p>Success Rate: {worker.performance.successRate.toFixed(1)}%</p>
                      {worker.currentTask && <p className="text-blue-600">Working on: {worker.currentTask}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Consensus Proposals</h2>
              <div className="space-y-3">
                {swarmData.consensusProposals.slice(-5).reverse().map(proposal => (
                  <div key={proposal.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{proposal.topic}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}