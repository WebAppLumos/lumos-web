import { useState } from 'react'
import './App.css'

import Calendar from './schedule/components/Calendar'
import TodoList from './schedule/components/TodoList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="main-content-grid">
      {/* Left: Calendar */}
      <div className="calendar-section">
        <Calendar />
      </div>

      {/* Right: Todo */}
      <div className="side-section">
        <TodoList />
      </div>
    </div>
  )
}
export default App