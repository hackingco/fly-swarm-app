'use client'

import { useEffect, useState } from 'react'

interface SwarmData {
  swarmId: string
  name: string
  status: string
  workers: Array<{
    id: string
    type: string
    status: string
    tasks: number
  }>
  metrics: {
    totalTasks: number
    completedTasks: number
    activeTasks: number
    efficiency: number
  }
}

export default function Dashboard() {
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null)
  const [loading, setLoading] = useState(true)

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
    const interval = setInterval(fetchSwarmData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading swarm data...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Swarm Dashboard</h1>
      
      {swarmData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Swarm Status</h2>
            <p>ID: {swarmData.swarmId}</p>
            <p>Name: {swarmData.name}</p>
            <p>Status: <span className="text-green-500">{swarmData.status}</span></p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <p>Total Tasks: {swarmData.metrics.totalTasks}</p>
            <p>Completed: {swarmData.metrics.completedTasks}</p>
            <p>Active: {swarmData.metrics.activeTasks}</p>
            <p>Efficiency: {swarmData.metrics.efficiency}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Workers</h2>
            <ul className="space-y-2">
              {swarmData.workers.map(worker => (
                <li key={worker.id} className="text-sm">
                  {worker.type}: {worker.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}