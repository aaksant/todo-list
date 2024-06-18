export default class TasksManager {
  #tasks = [];

  get tasks() {
    return this.#tasks;
  }

  appendTask(name, type, importance, date) {
    this.#tasks.push({
      id: Date.now(),
      name: name,
      type: type,
      importance: importance,
      date: date
    });
  }

  deleteTask(taskId) {
    this.#tasks = this.#tasks.filter(task => task.id !== taskId);
  }
}
