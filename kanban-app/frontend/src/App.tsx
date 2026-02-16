import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Tasks {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

const API_URL = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState<Tasks>({
    todo: [],
    inProgress: [],
    done: []
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          status: 'todo'
        }),
      });

      if (response.ok) {
        setNewTaskTitle('');
        setNewTaskDescription('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: 'todo' | 'inProgress' | 'done') => {
    if (!draggedTask) return;

    try {
      const response = await fetch(`${API_URL}/tasks/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: draggedTask.id,
          newStatus: newStatus
        }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }

    setDraggedTask(null);
  };

  const renderColumn = (status: 'todo' | 'inProgress' | 'done', title: string) => {
    return (
      <div
        className="column"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(status)}
      >
        <h2>{title}</h2>
        <div className="task-count">{tasks[status].length} tasks</div>
        <div className="tasks-container">
          {tasks[status].map((task) => (
            <div
              key={task.id}
              className="task-card"
              draggable
              onDragStart={() => handleDragStart(task)}
            >
              <div className="task-header">
                <h3>{task.title}</h3>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete task"
                >
                  ×
                </button>
              </div>
              {task.description && <p>{task.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📋 My Kanban Board</h1>
        <p className="subtitle">Organize your life, one task at a time</p>
      </header>

      <div className="add-task-form">
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <input
          type="text"
          placeholder="Task description (optional)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <div className="board">
        {renderColumn('todo', '📝 To Do')}
        {renderColumn('inProgress', '🚀 In Progress')}
        {renderColumn('done', '✅ Done')}
      </div>
    </div>
  );
}

export default App;
