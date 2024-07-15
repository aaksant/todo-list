// Too lazy to implement edit feature
import { format } from 'date-fns';
import _ from 'lodash';

import editSvg from '../assets/edit.svg';
import trashSvg from '../assets/trash.svg';
import xmarkSvg from '../assets/xmark.svg';
import TasksManager from './TasksManager';

export default class UI {
  constructor() {
    this.tasksManager = new TasksManager();

    this.setupEventListeners();
    this.renderInitialTasks();
    this.renderInitialProjects();
    this.checkTasksAvailability();
    this.updateAllTaskCount();
  }

  #getSelectedOption(option) {
    return option.options[option.selectedIndex].text;
  }

  renderInitialTasks() {
    this.tasksManager.allTasks.forEach(task => {
      const importanceClass = this.getImportanceClass(task.importance);
      this.prepareNewTaskRow('inbox', task, importanceClass);

      if (task.type === 'Today') {
        this.prepareNewTaskRow('today', task, importanceClass);
      } else if (task.type === 'Planned') {
        this.prepareNewTaskRow('planned', task, importanceClass);
      }

      if (task.projectId) {
        this.prepareNewTaskRow(task.projectId, task, importanceClass);
      }
    });
  }

  renderInitialProjects() {
    this.tasksManager
      .getAllProjects()
      .forEach(project => this.addProject(project));

    this.updateProjectSelect();
  }

  setupEventListeners() {
    const btnAddTask = document.querySelector('.btn-add-task');
    const btnCloseTaskModal = document.querySelector(
      '.modal-new-task .btn-close-modal'
    );
    const btnCloseProjectModal = document.querySelector(
      '.modal-new-project .btn-close-modal'
    );
    const btnConfirmAdd = document.querySelector('.btn-confirm-add');
    const btnAddProject = document.querySelector('.btn-add-project');
    const btnConfirmAddProject = document.querySelector(
      '.btn-confirm-add-project'
    );
    const overlay = document.querySelector('.overlay');
    const taskWrappers = document.querySelectorAll('.task-wrapper');
    const sidebar = document.querySelector('.sidebar');

    btnAddTask.addEventListener(
      'click',
      this.toggleModal.bind(this, true, 'task')
    );
    btnConfirmAdd.addEventListener('click', this.handleAddTask.bind(this));

    btnAddProject.addEventListener(
      'click',
      this.toggleModal.bind(this, true, 'project')
    );
    btnConfirmAddProject.addEventListener(
      'click',
      this.handleAddProject.bind(this)
    );

    btnCloseTaskModal.addEventListener(
      'click',
      this.toggleModal.bind(this, false, 'task')
    );
    btnCloseProjectModal.addEventListener(
      'click',
      this.toggleModal.bind(this, false, 'project')
    );

    // Escape keydown support
    document.addEventListener('keydown', this.handleKeyboardInput.bind(this));

    // Overlay click
    overlay.addEventListener('click', this.toggleModal.bind(this, false));

    document
      .querySelector('.main')
      .addEventListener('click', this.handleTaskFunctions.bind(this));

    sidebar.addEventListener('click', this.handleNavSwitch.bind(this));

    document
      .querySelector('.nav.project-task')
      .addEventListener('click', this.handleProjectActions.bind(this));
  }

  toggleModal(isVisible, modalType) {
    const taskModal = document.querySelector('.modal-new-task');
    const projectModal = document.querySelector('.modal-new-project');
    const overlay = document.querySelector('.overlay');

    if (isVisible) {
      if (modalType === 'task') {
        taskModal.classList.remove('hidden');
      } else if (modalType === 'project') {
        projectModal.classList.remove('hidden');
      }
      overlay.classList.remove('hidden');
    } else {
      taskModal.classList.add('hidden');
      projectModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  }

  toggleNoTasksMessage(typeContainer) {
    const noTasksMessage = typeContainer.querySelector('.no-tasks-message');

    if (this.tasksManager.tasksForType.length !== 0) {
      noTasksMessage.style.display = 'none';
    } else {
      noTasksMessage.style.display = 'block';
    }
  }

  handleAddProject() {
    const projectName = document.getElementById('newProjectName').value.trim();

    if (projectName) {
      const newProject = this.tasksManager.addProject(projectName);
      if (newProject) {
        this.addProject(newProject);
        this.toggleModal(false, 'project');
        this.clearProjectModal();
        this.updateProjectSelect();
      } else {
        alert('A project with this name already exists.');
      }
    } else {
      alert('Please enter a project name.');
    }
  }

  handleKeyboardInput(e) {
    if (e.key === 'Escape') this.toggleModal(false);
  }

  handleTaskFunctions(e) {
    const taskRow = e.target.closest('.task-row');
    if (!taskRow) return;

    if (e.target.closest('.delete')) {
      this.handleDeleteTask(e);
    }
  }

  handleAddTask() {
    if (this.getModalInput()) {
      const { name, importance, date, projectId } = this.getModalInput();

      this.tasksManager.appendTask(name, importance, date, projectId);
      this.renderNewTaskRow();

      this.toggleModal(false);
      this.clearModal();
      this.updateAllTaskCount();
    }
  }

  handleProjectActions(e) {
    if (e.target.classList.contains('btn-delete-project')) {
      const projectId = e.target.closest('.btn-nav').id;
      this.deleteProject(projectId);
    }
  }

  handleDeleteTask(e) {
    const taskRow = e.target.closest('.task-row');
    const taskId = +taskRow.dataset.taskId;

    const deletedTask = this.tasksManager.deleteTask(taskId);

    if (deletedTask) {
      document
        .querySelectorAll(`.task-row[data-task-id="${taskId}"]`)
        .forEach(row => row.remove());

      this.checkTasksAvailability();
      this.updateAllTaskCount();

      if (deletedTask.projectId) {
        this.updateTaskCount(
          deletedTask.projectId,
          this.tasksManager.getTaskCount(deletedTask.projectId)
        );
      }
    }
  }

  handleNavSwitch(e) {
    const navBtn = e.target.closest('.btn-nav');
    if (!navBtn) return;

    const type = navBtn.id;
    const selectedContainer = document.querySelector(`.${type}`);

    document
      .querySelectorAll('.btn-nav')
      .forEach(btn => btn.classList.remove('nav-active'));

    navBtn.classList.add('nav-active');

    document
      .querySelectorAll('.type-container')
      .forEach(typeSection => typeSection.classList.add('hidden'));

    if (selectedContainer) {
      selectedContainer.classList.remove('hidden');
    } else {
      const inboxContainer = document.querySelector('.inbox');

      if (inboxContainer) {
        inboxContainer.classList.remove('hidden');

        const inboxBtn = document.querySelector('#inbox.btn-nav');
        if (inboxBtn) inboxBtn.classList.add('nav-active');
      }
    }
    this.checkTasksAvailability();
  }

  addProject(project) {
    const projectsHeading = document.querySelector('.nav.project-task h2');
    const mainContainer = document.querySelector('.main');

    const projectNav = `
      <button id="${project.id}" class="btn btn-nav">
        ${project.name} 
        <span class="task-count">0</span>
        <img src="${xmarkSvg}" class="btn-delete-project" alt="X mark"/>
      </button>`;

    const projectContainer = `
      <div class="type-container ${project.id} hidden">
        <h1 class="type-title">${project.name}</h1>
        <div class="task-wrapper">
          <p class="no-tasks-message">You have no tasks to do.</p>
        </div>
      </div>`;

    projectsHeading.insertAdjacentHTML('afterend', projectNav);
    mainContainer.insertAdjacentHTML('beforeend', projectContainer);

    this.updateTaskCount(project.id, 0);
  }

  updateProjectSelect() {
    const projectSelect = document.getElementById('projectName');
    projectSelect.innerHTML = '<option value="">Default task</option>';

    this.tasksManager.getAllProjects().forEach(project => {
      projectSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;
    });
  }

  clearProjectModal() {
    document.getElementById('newProjectName').value = '';
  }

  getModalInput() {
    const taskName = document.getElementById('taskName');
    const importanceSelect = document.getElementById('importance');
    const dateInput = document.getElementById('date');
    const projectSelect = document.getElementById('projectName');

    if (taskName.value) {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today || !dateInput.value) {
        return {
          name: _.capitalize(taskName.value.trim()),
          importance: this.#getSelectedOption(importanceSelect),
          date: dateInput.value || new Date(),
          projectId: projectSelect.value
        };
      } else {
        alert('Cannot set date to past.');
        return;
      }
    } else {
      alert('Invalid task name.');
      return;
    }
  }

  clearModal() {
    document.getElementById('taskName').value = '';
    document.getElementById('importance').selectedIndex = 0;
    document.getElementById('date').value = '';
  }

  getTypes() {
    const types = [];

    document.querySelectorAll('.type-container').forEach(container => {
      const classes = container.classList;
      types.push(classes[1]);
    });

    return types;
  }

  getImportanceClass(importance) {
    switch (importance) {
      case 'High':
        return 'importance-high';
      case 'Medium':
        return 'importance-medium';
      case 'Low':
        return 'importance-low';
      default:
        return '';
    }
  }

  getFormattedDate(date) {
    if (date) {
      return format(date, 'dd/MM/yyyy');
    } else {
      return format(new Date(), 'dd/MM/yyyy');
    }
  }

  renderNewTaskRow() {
    const newTask = _.last(this.tasksManager.allTasks);
    const importanceClass = this.getImportanceClass(newTask.importance);

    // Always show tasks in Inbox
    this.prepareNewTaskRow('inbox', newTask, importanceClass);

    if (newTask.type === 'Today') {
      this.prepareNewTaskRow('today', newTask, importanceClass);
    } else if (newTask.type === 'Planned') {
      this.prepareNewTaskRow('planned', newTask, importanceClass);
    }

    if (newTask.projectId) {
      this.prepareNewTaskRow(newTask.projectId, newTask, importanceClass);
    }

    this.checkTasksAvailability();
  }

  prepareNewTaskRow(containerType, task, importanceClass) {
    const taskWrapper = document.querySelector(
      `.${containerType} .task-wrapper`
    );

    const taskRow = `
      <div class="task-row ${importanceClass}" data-task-id="${
      task.taskId
    }" data-project-id="${task.projectId || ''}">
          <div class="task-name-container">
              <p class="task-name">${task.name}</p>
              <span class="task-type">${_.capitalize(task.type)}</span>
              <span class="task-importance">${
                importanceClass.split('-')[1]
              }</span>
          </div>
          <div class="task-function">
              <p class="task-date">${this.getFormattedDate(task.date)}</p>
              <div class="btn btn-task edit">
                <img src="${editSvg}" class="icon" alt="Edit"/>
              </div>
              <div class="btn btn-task delete">
                <img src="${trashSvg}" class="icon" alt="Trash"/>
              </div>
          </div>
      </div>`;

    taskWrapper.insertAdjacentHTML('beforeend', taskRow);
  }

  deleteProject(projectId) {
    if (
      confirm(
        'Are you sure you want to delete this project? All associated tasks will be deleted.'
      )
    ) {
      this.tasksManager.deleteProject(projectId);

      const projectNav = document.getElementById(projectId);
      if (projectNav) projectNav.remove();

      const projectContainer = document.querySelector(
        `.type-container.${projectId}`
      );
      if (projectContainer) projectContainer.remove();

      const taskRows = document.querySelectorAll(
        `.task-row[data-project-id="${projectId}"]`
      );
      taskRows.forEach(row => row.remove());

      this.updateProjectSelect();
      this.updateAllTaskCount();
      this.checkTasksAvailability();
    }
  }

  checkTasksAvailability() {
    const typeContainers = document.querySelectorAll('.type-container');
    const types = this.getTypes();

    typeContainers.forEach(typeContainer => {
      const type = [...typeContainer.classList].find(typeClass =>
        types.includes(typeClass)
      );

      this.tasksManager.getTasks(type);
      this.toggleNoTasksMessage(typeContainer);
    });
  }

  updateAllTaskCount() {
    const counts = this.tasksManager.getAllTaskCounts();
  
    for (const [type, count] of Object.entries(counts)) {
      this.updateTaskCount(type, count);
    }
  }

  updateTaskCount(type, count) {
    const navBtn = document.querySelector(`#${type}.btn-nav`);

    if (navBtn) {
      const countSpan = navBtn.querySelector('.task-count');
      countSpan.textContent = count;
    }
  }
}
