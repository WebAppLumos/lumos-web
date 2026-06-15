import { useState } from 'react';
import DashboardNav from '../../components/Dashboard/DashboardNav.jsx';
import AssignmentCount from '../../components/Assignment/AssignmentCount.jsx';
import AssignmentAdd from '../../components/Assignment/AssignmentAdd.jsx';
import AssignmentList from '../../components/Assignment/AssignmentList.jsx';
import { getImminentAssignments } from '../../lib/assignmentNotifications';
import { createAssignment, deleteAssignment, updateAssignment } from '../../lib/assignmentApi';
import { useAssignmentTasks } from '../../lib/useAssignmentTasks';
import '../Dashboard/Dashboard.css';
import './Assignment.css';

export default function Assignment() {
  const [user, setUser] = useState({ id: 1, name: 'User' }); // 임시 유저 상태
  const [tasks, setTasks, { isLoading, error }] = useAssignmentTasks({ enabled: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const imminentTask = getImminentAssignments(tasks)[0];

  const handleAddTask = async (newTask) => {
    setIsSaving(true);
    try {
      const createdTask = await createAssignment({ ...newTask, isCompleted: false });
      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setIsModalOpen(false);
    } catch (addError) {
      alert(addError.response?.data?.error ?? '과제를 추가하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteAssignment(id);
      setTasks((currentTasks) => currentTasks.filter(task => task.id !== id));
    } catch (deleteError) {
      alert(deleteError.response?.data?.error ?? '과제를 삭제하지 못했습니다.');
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    try {
      const updatedTask = await updateAssignment(id, updatedData);
      setTasks((currentTasks) => currentTasks.map(task => task.id === id ? updatedTask : task));
    } catch (updateError) {
      alert(updateError.response?.data?.error ?? '과제를 수정하지 못했습니다.');
    }
  };

  return (
    <div className="assignmentPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
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
                isSaving={isSaving}
                className="component-label label-orange"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}