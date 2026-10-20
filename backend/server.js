
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((error) => console.error('MongoDB connection failed:', error.message));

// Task structure stored in MongoDB
const Task = mongoose.model(
  'Task',
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }),
  'tasks'
);

// Home route
app.get('/', (req, res) => {
  res.send('Student Task Manager backend is running!');
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ _id: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch tasks' });
  }
});

// Add a task
app.post('/api/tasks', async (req, res) => {
  try {
    const title = req.body.title;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      completed: false
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Could not add task' });
  }
});

// Mark a task complete or incomplete
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: Boolean(req.body.completed) },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Could not update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete task' });
  }
});

// Start the backend
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
