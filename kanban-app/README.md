# 📋 Kanban Board App

A beautiful, functional kanban board application to organize your life. Built with React, TypeScript, and Flask.

![Kanban Board](https://img.shields.io/badge/status-ready-brightgreen)

## ✨ Features

- 🎯 **Three Column Layout**: To Do, In Progress, and Done
- 🖱️ **Drag and Drop**: Easily move tasks between columns
- ➕ **Add Tasks**: Create new tasks with title and description
- 🗑️ **Delete Tasks**: Remove tasks you no longer need
- 💾 **Persistent Storage**: Tasks are saved to a JSON file on the backend
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- 📱 **Responsive**: Works great on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- Node.js 14+ and npm
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd kanban-app/backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd kanban-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will automatically open in your browser at `http://localhost:3000`

## 📖 Usage

### Adding Tasks

1. Enter a task title in the first input field
2. Optionally add a description in the second field
3. Click "Add Task" or press Enter
4. The task will appear in the "To Do" column

### Moving Tasks

- Simply drag any task card and drop it into a different column
- The task will automatically update its status

### Deleting Tasks

- Click the × button in the top-right corner of any task card to delete it

## 🏗️ Project Structure

```
kanban-app/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── tasks.json         # Data storage (auto-generated)
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Node dependencies
│   └── tsconfig.json      # TypeScript config
└── README.md              # This file
```

## 🔌 API Endpoints

### GET `/api/tasks`
Get all tasks organized by status

### POST `/api/tasks`
Create a new task
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo"
}
```

### PUT `/api/tasks/<task_id>`
Update an existing task

### DELETE `/api/tasks/<task_id>`
Delete a task

### POST `/api/tasks/move`
Move a task to a different status
```json
{
  "taskId": "task-id",
  "newStatus": "inProgress"
}
```

## 🎨 Customization

### Change Colors

Edit the gradient colors in `frontend/src/App.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Columns

1. Update the `Tasks` interface in `frontend/src/App.tsx`
2. Add the new status to the backend's initial data structure
3. Add a new `renderColumn()` call in the JSX

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, HTML5 Drag and Drop API
- **Backend**: Flask, Python 3
- **Storage**: JSON file (easily replaceable with a database)
- **Styling**: Pure CSS with modern features

## 📝 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork this project and make your own improvements!

## 💡 Tips

- Press Enter after typing in either input field to quickly add tasks
- Tasks persist between sessions thanks to the backend storage
- The app works offline once loaded (except for saving tasks)

---

**Built with ❤️ using React and Flask**
