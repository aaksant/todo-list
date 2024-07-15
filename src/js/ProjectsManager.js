import Storage from './Storage';

export default class ProjectsManager {
  constructor() {
    this.storage = new Storage();
    this.projects = this.storage.loadProjects();
  }

  getAllProjects() {
    return this.projects;
  }

  getProject(id) {
    return this.projects.find(project => project.id === id);
  }

  addProject(name) {
    if (this.projects.some(project => project.name === name)) return null;

    const project = {
      id: `project-${Date.now().toString()}`,
      name,
      tasks: []
    };

    this.projects.push(project);
    this.storage.saveProjects(this.projects);
    return project;
  }

  deleteProject(id) {
    const deletedProject = this.getProject(id);

    if (deletedProject) {
      this.projects = this.projects.filter(
        project => project !== deletedProject
      );

      this.storage.saveProjects(this.projects);
      return deletedProject;
    }
  }

  addTask(projectId, taskId) {
    const project = this.getProject(projectId);

    if (project) {
      project.tasks.push(taskId);
    }

    this.storage.saveProjects(this.projects);
  }

  removeTask(projectId, taskId) {
    const project = this.getProject(projectId);

    if (project) {
      project.tasks = project.tasks.filter(id => id !== taskId);
      this.storage.saveProjects(this.projects);
    }
  }
}
