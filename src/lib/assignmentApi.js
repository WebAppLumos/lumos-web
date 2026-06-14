import api from './api'

function toApiDeadline(deadline) {
  if (!deadline) return deadline
  const value = String(deadline)
  return value.includes('T') ? value : `${value}T23:59:00`
}

export function mapAssignment(assignment) {
  return {
    id: assignment.id,
    course: assignment.course ?? '',
    title: assignment.title ?? '',
    deadline: assignment.deadline ? String(assignment.deadline).slice(0, 10) : '',
    isCompleted: Boolean(assignment.isCompleted),
  }
}

function toApiPayload(task) {
  return {
    ...task,
    deadline: task.deadline ? toApiDeadline(task.deadline) : task.deadline,
  }
}

export async function fetchAssignments() {
  const { data } = await api.get('/api/assignments')
  return (data ?? []).map(mapAssignment)
}

export async function createAssignment(task) {
  const { data } = await api.post('/api/assignments', toApiPayload(task))
  return mapAssignment(data)
}

export async function updateAssignment(id, task) {
  const { data } = await api.patch(`/api/assignments/${id}`, toApiPayload(task))
  return mapAssignment(data)
}

export async function deleteAssignment(id) {
  await api.delete(`/api/assignments/${id}`)
}
