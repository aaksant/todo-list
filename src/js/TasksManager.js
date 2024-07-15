import { isSameDay } from 'date-fns';
import ProjectsManager from './ProjectsManager.js';
import Storage from './Storage.js';

export default class TasksManager {
  constructor() {
    this.projectsManager = new ProjectsManager();
    this.storage = new Storage();

    this.allTasks = this.storage.loadTasks();
    this.tasksForType = [];
    this.currentTaskId = this.storage.loadCurrentTaskId();
  }

  appendTask(name, importance, date, projectId = null) {
    const task = {
      taskId: this.currentTaskId++,
      name,
      importance,
      date,
      type: projectId
        ? `Project (${this.getProject(projectId).name})`
        : isSameDay(date, new Date())
        ? 'Today'
        : 'Planned',
      projectId
    };

    this.allTasks.push(task);
    if (projectId) this.projectsManager.addTask(projectId, task.id);

    this.storage.saveTasks(this.allTasks);
    this.storage.saveCurrentTaskId(this.currentTaskId);
  }

  deleteTask(id) {
    const taskIndex = this.allTasks.findIndex(task => task.taskId === id);
    if (taskIndex === -1) return null;

    const deletedTask = this.allTasks[taskIndex];

    if (deletedTask.projectId) {
      this.projectsManager.removeTask(deletedTask.projectId, id);
    }

    this.allTasks.splice(taskIndex, 1);
    this.storage.saveTasks(this.allTasks);

    return deletedTask;
  }

  getTaskCount(type) {
    switch (type) {
      case 'inbox':
        return this.allTasks.length;
      case 'today':
        return this.allTasks.filter(task => task.type === 'Today').length;
      case 'planned':
        return this.allTasks.filter(task => task.type === 'Planned').length;
      default:
        return this.projectsManager.getProject(type)?.tasks.length || 0;
    }
  }

  getProject(id) {
    return this.projectsManager.projects.find(project => project.id === id);
  }

  getAllTaskCounts() {
    const counts = {
      inbox: this.getTaskCount('inbox'),
      today: this.getTaskCount('today'),
      planned: this.getTaskCount('planned')
    };

    this.projectsManager.projects.forEach(project => {
      counts[project.id] = this.getTaskCount(project.id);
    });

    return counts;
  }

  getTasks(type) {
    switch (type) {
      case 'inbox':
        this.tasksForType = this.allTasks;
        break;
      case 'today':
        this.tasksForType = this.allTasks.filter(task => task.type === 'Today');
        break;
      case 'planned':
        this.tasksForType = this.allTasks.filter(
          task => task.type === 'Planned'
        );
        break;
      default:
        this.tasksForType = this.allTasks.filter(
          task => task.projectId === type
        );
        break;
    }
  }

  addProject(name) {
    return this.projectsManager.addProject(name);
  }

  deleteProject(id) {
    const deletedProject = this.projectsManager.deleteProject(id);

    if (deletedProject) {
      this.allTasks = this.allTasks.filter(task => task.projectId !== id);
    }
  }

  getAllProjects() {
    return this.projectsManager.projects;
  }
}
