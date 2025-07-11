'use client'

import { useEffect, useState } from 'react'

interface Worker {
  id: string
  type: string
  status: string
  tasks: number
}

export default function Agents() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch('/api/swarm')
        const data = await response.json()
        setWorkers(data.workers)
      } catch (error) {
        console.error('Failed to fetch workers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkers()
  }, [])

  const handleCommand = async (workerId: string, command: string) => {
    try {
      await fetch('/api/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, workerId })
      })
    } catch (error) {
      console.error('Failed to send command:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading agents...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Swarm Agents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workers.map(worker => (
          <div key={worker.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 capitalize">{worker.type}</h2>
            <p className="mb-2">ID: {worker.id}</p>
            <p className="mb-2">Status: <span className={worker.status === 'idle' ? 'text-yellow-500' : 'text-green-500'}>{worker.status}</span></p>
            <p className="mb-4">Active Tasks: {worker.tasks}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleCommand(worker.id, 'start')}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Start Task
              </button>
              <button
                onClick={() => handleCommand(worker.id, 'stop')}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}