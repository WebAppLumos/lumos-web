import AssignmentItem from './AssignmentItem';

export default function AssignmentList({ tasks, onDelete, onUpdate }) {
  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div>
          현재 등록된 과제가 없습니다.
        </div>
      ) : (
        tasks.map((task) => (
          <AssignmentItem key={task.id} task={task} onDelete={onDelete} onUpdate={onUpdate} />)))}
    </div>
  );
}