const DAY_IN_MS = 1000 * 60 * 60 * 24

export function getDaysUntilDeadline(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)

  return Math.round((deadlineDate.getTime() - today.getTime()) / DAY_IN_MS)
}

export function getAssignmentNotificationId(task) {
  return `${task.id}-${task.deadline}`
}

export function getImminentAssignments(tasks) {
  return tasks
    .filter((task) => !task.isCompleted)
    .map((task) => ({
      ...task,
      diffDays: getDaysUntilDeadline(task.deadline),
      notificationId: getAssignmentNotificationId(task),
    }))
    .filter((task) => task.diffDays >= 0 && task.diffDays <= 1)
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
}

export function getDeadlineLabel(diffDays) {
  if (diffDays === 0) return 'D-Day'
  return `D-${diffDays}`
}
