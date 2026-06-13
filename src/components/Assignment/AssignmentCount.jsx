import './AssignmentCount.css';

export default function AssignmentCount({ tasks }) {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(task => task.isCompleted).length;
  const remainingCount = totalCount - completedCount;
  return (
    <div className="assignmentCount summary-container">
      <div className="summary-item">
        <span className="label">총 과제 수</span>
        <span className="value">{totalCount}<span>개</span></span>
      </div>
      <div className="summary-item">
        <span className="label">남은 과제 수</span>
        <span className="value">{remainingCount}<span>개</span></span>
      </div>
      <div className="summary-item">
        <span className="label">제출 완료 수</span>
        <span className="value">{completedCount}<span>개</span></span>
      </div>
    </div>
  );
}