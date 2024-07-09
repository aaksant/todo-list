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

  getTaskCount(type) {
    switch (type) {
      case 'inbox':
        return this.allTasks.length;
      case 'today':
        return this.allTasks.filter(task => task.type === 'Today').length;
      case 'planned':
        return this.allTasks.filter(task => task.type === 'Planned').length;
      default:
        return this.allTasks.filter(task => task.project === type).length;
    }
  }

  getAllTaskCounts() {
    return {
      inbox: this.getTaskCount('inbox'),
      today: this.getTaskCount('today'),
      planned: this.getTaskCount('planned')
    };
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
