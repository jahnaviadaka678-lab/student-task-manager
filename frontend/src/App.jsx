

import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5001/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tasks from the backend
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error('Failed to load tasks');
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError('Cannot connect to backend. Check that it is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // Add a task
  async function addTask(event) {
    event.preventDefault();

    const title = task.trim();
    if (!title) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [...currentTasks, newTask]);
      setTask('');
      setError('');
    } catch (err) {
      setError('Could not add task. Please check the backend.');
    }
  }

  // Complete or uncomplete a task
  async function toggleTask(item) {
    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !item.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((current) =>
          current.id === item.id ? updatedTask : current
        )
      );

      setError('');
    } catch (err) {
      setError('Could not update task. Please check the backend.');
    }
  }

  // Delete a task
  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== id)
      );

      setError('');
    } catch (err) {
      setError('Could not delete task. Please check the backend.');
    }
  }

  const completedCount = tasks.filter(
    (item) => item.completed
  ).length;

  return (
    <main className="app">
      <header>
        <p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
        <h1>Student Task Manager</h1>
        <p>Plan your day. Finish your goals. Stay on track.</p>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>

        <div className="stat-card">
          <span>Remaining</span>
          <strong>{tasks.length - completedCount}</strong>
        </div>
      </section>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <form onSubmit={addTask} className="task-form">
        <input
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Enter an assignment or task..."
          aria-label="New task"
        />

        <button type="submit">+ Add Task</button>
      </form>

      <section className="task-list">
        <h2>My Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">
            No tasks yet. Add your first task above!
          </p>
        ) : (
          tasks.map((item) => (
            <article className="task" key={item.id}>
              <label className={item.completed ? 'done' : ''}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleTask(item)}
                />
                <span>{item.title}</span>
              </label>

              <button
                type="button"
                className="delete"
                onClick={() => deleteTask(item.id)}
              >
                Delete
              </button>
            </article>
          ))
        )}
      </section>

      <footer>
        Small steps every day lead to big achievements.
      </footer>
    </main>
  );
}

export default App;
