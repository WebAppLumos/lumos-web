import { useEffect, useState } from 'react'
import { fetchAssignments } from './assignmentApi'

const ASSIGNMENT_TASKS_STORAGE_KEY = 'lumos.assignmentTasks'

export function getStoredAssignmentTasks() {
  if (typeof window === 'undefined') return []
  try {
    const storedTasks = window.localStorage.getItem(ASSIGNMENT_TASKS_STORAGE_KEY)
    return storedTasks ? JSON.parse(storedTasks) : []
  } catch {
    return []
  }
}

function readStoredTasks() {
  return getStoredAssignmentTasks()
}

export function useAssignmentTasks({ enabled = true } = {}) {
  const [tasks, setTasks] = useState(readStoredTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ASSIGNMENT_TASKS_STORAGE_KEY, JSON.stringify(tasks))
    window.dispatchEvent(new CustomEvent('assignmentTasksChanged', { detail: tasks }))
  }, [tasks])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const syncTasks = (event) => {
      if (event.type === 'assignmentTasksChanged') {
        setTasks(event.detail)
        return
      }
      setTasks(readStoredTasks())
    }
    window.addEventListener('assignmentTasksChanged', syncTasks)
    window.addEventListener('storage', syncTasks)
    return () => {
      window.removeEventListener('assignmentTasksChanged', syncTasks)
      window.removeEventListener('storage', syncTasks)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    let isMounted = true
    setIsLoading(true)
    setError(null)
    fetchAssignments()
      .then((assignments) => {
        if (!isMounted) return
        setTasks(assignments)
      })
      .catch((fetchError) => {
        if (!isMounted) return
        setError(fetchError)
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [enabled])
  return [tasks, setTasks, { isLoading, error }]
}