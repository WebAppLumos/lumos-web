import AssignmentItem from './AssignmentItem';

export default function AssignmentList({ tasks, onDelete, onUpdate }) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });
  return (
    <div className="task-list">
      {sortedTasks.length === 0 ? (
        <div>
          현재 등록된 과제가 없습니다.
        </div>
      ) : (sortedTasks.map((task) => (
        <AssignmentItem key={task.id} task={task} onDelete={onDelete} onUpdate={onUpdate} />)))}
    </div>
  );
}
