import React, { useEffect, useState } from 'react';
import { api } from '../ultils/api';

export default function TaskList({ boardId, cardId, token }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: '' });
  const [error, setError] = useState('');
  const [githubType, setGithubType] = useState('');
  const [githubNumber, setGithubNumber] = useState('');
  const [githubAttachments, setGithubAttachments] = useState({});

  const fetchTasks = async () => {
    const res = await api.get(`/boards/${boardId}/cards/${cardId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
    // Fetch GitHub attachments for all tasks
    const attachments = {};
    for (const task of res.data) {
      try {
        const attRes = await api.get(`/boards/${boardId}/cards/${cardId}/tasks/${task.id}/github-attachments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        attachments[task.id] = attRes.data;
      } catch {}
    }
    setGithubAttachments(attachments);
  };

  useEffect(() => {
    fetchTasks();
  }, [boardId, cardId, token]);

  const handleCreateTask = async () => {
    setError('');
    try {
      await api.post(`/boards/${boardId}/cards/${cardId}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', description: '', status: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks();
  };

  const handleAttachGithub = async (taskId) => {
    if (!githubType || !githubNumber) return;
    await api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attach`, {
      type: githubType,
      number: githubNumber
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGithubType('');
    setGithubNumber('');
    fetchTasks();
  };

  const handleRemoveGithubAttachment = async (taskId, attachmentId) => {
    await api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks();
  };

  return (
    <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
      <h4>Tasks</h4>
      {error && <div style={{ color: 'red', marginBottom: 4 }}>{error}</div>}
      <input
        value={newTask.title}
        onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
        placeholder="Task title"
        style={{ marginRight: 4 }}
      />
      <input
        value={newTask.description}
        onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
        placeholder="Task description"
        style={{ marginRight: 4 }}
      />
      <input
        value={newTask.status}
        onChange={e => setNewTask(t => ({ ...t, status: e.target.value }))}
        placeholder="Task status"
        style={{ marginRight: 4 }}
      />
      <button onClick={handleCreateTask}>Add Task</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ marginTop: 4 }}>
            <b>{task.title}</b> - {task.description} [{task.status}]
            <button onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: 8 }}>Delete</button>
            <div style={{ marginTop: 4 }}>
              <input
                value={githubType}
                onChange={e => setGithubType(e.target.value)}
                placeholder="GitHub type (PR/commit/issue)"
                style={{ marginRight: 4 }}
              />
              <input
                value={githubNumber}
                onChange={e => setGithubNumber(e.target.value)}
                placeholder="GitHub number/id"
                style={{ marginRight: 4 }}
              />
              <button onClick={() => handleAttachGithub(task.id)}>Attach GitHub</button>
            </div>
            {githubAttachments[task.id] && githubAttachments[task.id].length > 0 && (
              <ul style={{ marginTop: 4, background: '#f9f9f9', padding: 4 }}>
                {githubAttachments[task.id].map(att => (
                  <li key={att.attachmentId}>
                    {att.type}: {att.number}
                    <button onClick={() => handleRemoveGithubAttachment(task.id, att.attachmentId)} style={{ marginLeft: 8 }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
