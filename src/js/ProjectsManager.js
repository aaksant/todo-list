export default class ProjectsManager {
  constructor() {
    this.projects = [];
  }

  getAllProjects() {
    return this.projects;
  }

  getProject(id) {
    return this.projects.find(project => project.id === id);
  }

  addProject(name) {
    const project = {
      id: 'project-' + Date.now().toString(),
      name,
      tasks: []
    };

    this.projects.push(project);
    return project;
  }

  deleteProject(id) {
    const deletedProject = this.getProject(id);

    if (deletedProject) {
      this.projects = this.projects.filter(
        project => project !== deletedProject
      );
      
      return deletedProject;
    }
  }

  addTask(projectId, taskId) {
    const project = this.getProject(projectId);

    if (project) {
      project.tasks.push(taskId);
    }
  }

  removeTask(projectId, taskId) {
    const project = this.getProject(projectId);

    if (project) {
      project.tasks = project.tasks.filter(id => id !== taskId);
    }
  }
}
