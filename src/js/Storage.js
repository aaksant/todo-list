export default class Storage {
  saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  }

  saveCurrentTaskId(id) {
    localStorage.setItem('currentTaskId', id.toString());
  }

  loadCurrentTaskId() {
    const storedId = localStorage.getItem('currentTaskId');
    return storedId ? parseInt(storedId, 10) : 0;
  }

  saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  loadProjects() {
    const storedProjects = localStorage.getItem('projects');
    return storedProjects ? JSON.parse(storedProjects) : [];
  }

  clearAll() {
    localStorage.removeItem('tasks');
    localStorage.removeItem('currentTaskId');
    localStorage.removeItem('projects');
  }
}
