import { isSameDay } from 'date-fns';

export default class TasksManager {
  constructor() {
    this.allTasks = [];
    this.tasksForType = [];
    this.currentTaskId = 0;
  }

  appendTask(name, importance, date) {
    this.allTasks.push({
      id: this.currentTaskId++,
      name,
      importance,
      date,
      type: isSameDay(date, new Date()) ? 'Today' : 'Planned'
    });
  }

  deleteTask(id) {
    this.allTasks = this.allTasks.filter(task => task.id !== id);
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
      default:
        break;
    }
  }
}
