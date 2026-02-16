from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_FILE = 'tasks.json'

def load_tasks():
    """Load tasks from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        'todo': [],
        'inProgress': [],
        'done': []
    }

def save_tasks(tasks):
    """Save tasks to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.json
    tasks = load_tasks()
    
    new_task = {
        'id': datetime.now().isoformat(),
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'status': data.get('status', 'todo')
    }
    
    status = new_task['status']
    if status in tasks:
        tasks[status].append(new_task)
        save_tasks(tasks)
        return jsonify(new_task), 201
    
    return jsonify({'error': 'Invalid status'}), 400

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.json
    tasks = load_tasks()
    
    # Find and remove the task from its current location
    task_found = None
    old_status = None
    
    for status in tasks:
        for i, task in enumerate(tasks[status]):
            if task['id'] == task_id:
                task_found = tasks[status].pop(i)
                old_status = status
                break
        if task_found:
            break
    
    if not task_found:
        return jsonify({'error': 'Task not found'}), 404
    
    # Update task fields
    task_found['title'] = data.get('title', task_found['title'])
    task_found['description'] = data.get('description', task_found['description'])
    new_status = data.get('status', old_status)
    task_found['status'] = new_status
    
    # Add to new status
    if new_status in tasks:
        tasks[new_status].append(task_found)
        save_tasks(tasks)
        return jsonify(task_found)
    
    return jsonify({'error': 'Invalid status'}), 400

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    tasks = load_tasks()
    
    for status in tasks:
        for i, task in enumerate(tasks[status]):
            if task['id'] == task_id:
                tasks[status].pop(i)
                save_tasks(tasks)
                return jsonify({'message': 'Task deleted'})
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/move', methods=['POST'])
def move_task():
    """Move a task to a different status"""
    data = request.json
    task_id = data.get('taskId')
    new_status = data.get('newStatus')
    
    tasks = load_tasks()
    
    # Find and remove the task
    task_found = None
    for status in tasks:
        for i, task in enumerate(tasks[status]):
            if task['id'] == task_id:
                task_found = tasks[status].pop(i)
                break
        if task_found:
            break
    
    if not task_found:
        return jsonify({'error': 'Task not found'}), 404
    
    # Update status and add to new column
    task_found['status'] = new_status
    if new_status in tasks:
        tasks[new_status].append(task_found)
        save_tasks(tasks)
        return jsonify(task_found)
    
    return jsonify({'error': 'Invalid status'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
