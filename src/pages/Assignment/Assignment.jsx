import { useState, useRef } from 'react';
import AssignmentCount from '../../components/Assignment/AssignmentCount.jsx';
import AssignmentAdd from '../../components/Assignment/AssignmentAdd.jsx';
import AssignmentList from '../../components/Assignment/AssignmentList.jsx';
import { initialAssignmentTasks } from '../../data/assignmentTasks';
import './Assignment.css';

export default function Assignment() {
  const [tasks, setTasks] = useState(initialAssignmentTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nextId = useRef(3);

  const getImminentTask = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingTasks = tasks
      .filter(task => !task.isCompleted)
      .map(task => {
        const deadlineDate = new Date(task.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return { ...task, diffDays };
      })
      .filter(task => task.diffDays >= 0);

    let closestTask = null;
    if (upcomingTasks.length > 0) {
      closestTask = upcomingTasks[0];
      for (let i = 1; i < upcomingTasks.length; i++) {
        if (upcomingTasks[i].diffDays < closestTask.diffDays) {
          closestTask = upcomingTasks[i];
        }
      }
    }
    return (closestTask && closestTask.diffDays <= 1) ? closestTask : null;
  };

  const imminentTask = getImminentTask();

  const handleAddTask = (newTask) => {
    const newTaskData = {
      ...newTask,
      id: nextId.current,
      isCompleted: false,
      statusClass: "d-day-info"
    };
    setTasks([...tasks, newTaskData]);
    nextId.current += 1;
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleUpdateTask = (id, updatedData) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updatedData } : task));
  };

  return (
    <div className="assignmentPage">
      <div className="page-container">
        <main className="main-content">
          <div className="layout-wrapper">
            <div className="header-box">
              <h1 className="header-title">과제 알림</h1>
              <button className="add-btn" onClick={() => setIsModalOpen(true)}>과제 등록</button>
            </div>
            <div className="count-box">
              <AssignmentCount tasks={tasks} className="component-label label-green"/>
            </div>
            {imminentTask && (
              <div className="imminent-box">
                <h3 className="imminent-title">마감 임박 과제(D-{imminentTask.diffDays === 0 ? 'Day' : imminentTask.diffDays})</h3>
                <div className="task-card imminent-card">
                  <div className="task-info">
                    <div className="task-course">{imminentTask.course}</div>
                    <div className="task-title">{imminentTask.title}</div>
                    <div className="task-meta">마감일: {imminentTask.deadline}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="list-box">
              <AssignmentList tasks={tasks} onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask} className="component-label label-red"/>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">새 과제 추가</h2>
            <div className="add-box">
              <AssignmentAdd onAdd={handleAddTask} onCancel={() => setIsModalOpen(false)}
                className="component-label label-orange"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
