// TODO: Add task count
// TODO: Implement add task to custom project feature
// TODO: Enable close button in new project modal

import { format } from 'date-fns';
import _ from 'lodash';

import editSvg from '../assets/edit.svg';
import trashSvg from '../assets/trash.svg';
import TasksManager from './TasksManager';

const tasksManager = new TasksManager();

export default class UI {
  constructor() {
    this.setupEventListeners();
    this.checkTasksAvailability();
  }

  #getSelectedOption(option) {
    return option.options[option.selectedIndex].text;
  }

  setupEventListeners() {
    const btnAddTask = document.querySelector('.btn-add-task');
    const btnCloseModal = document.querySelector('.btn-close-modal');
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

    btnCloseModal.addEventListener('click', this.toggleModal.bind(this, false));

    // Escape keydown support
    document.addEventListener('keydown', this.handleKeyboardInput.bind(this));

    // Overlay click
    overlay.addEventListener('click', this.toggleModal.bind(this, false));

    taskWrappers.forEach(wrapper =>
      wrapper.addEventListener('click', this.handleTaskFunctions.bind(this))
    );

    sidebar.addEventListener('click', this.handleNavSwitch.bind(this));
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

    if (tasksManager.tasksForType.length !== 0) {
      noTasksMessage.style.display = 'none';
    } else {
      noTasksMessage.style.display = 'block';
    }
  }

  handleAddProject() {
    const projectName = document
      .getElementById('projectName')
      .value.trim()
      .toLowerCase();

    if (projectName) {
      this.addProject(projectName);
      this.toggleModal(false, 'project');
      this.clearProjectModal();
    } else {
      alert('Please enter a project name.');
    }
  }

  addProject(name) {
    const title = _.capitalize(name);

    const projectsHeading = document.querySelector('.nav.project-task h2');
    const main = document.querySelector('.main');

    const projectBtn = `
      <button id="${name}" class="btn btn-nav">${title}</button>
    `;
    const projectContainer = `
      <div class="type-container ${name} hidden">
        <h1 class="type-title">${title}</h1>
        <div class="task-wrapper">
          <p class="no-tasks-message">You have no tasks to do.</p>
        </div>
      </div>`;

    main.insertAdjacentHTML('beforeend', projectContainer);
    projectsHeading.insertAdjacentHTML('afterend', projectBtn);

    this.updateTaskCount(name, 0);  
  }

  clearProjectModal() {
    document.getElementById('projectName').value = '';
  }

  getModalInput() {
    const taskName = document.getElementById('taskName');
    const importanceSelect = document.getElementById('importance');
    const dateInput = document.getElementById('date');

    if (taskName.value) {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();

      // Set time to midnight for accurate date comparison
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today || !dateInput.value) {
        return {
          name: _.capitalize(taskName.value.trim()),
          importance: this.#getSelectedOption(importanceSelect),
          date: dateInput.value || new Date()
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

  handleKeyboardInput(e) {
    if (e.key === 'Escape') this.toggleModal(false);
  }

  handleTaskFunctions(e) {
    if (e.target.closest('.delete')) {
      this.handleDeleteTask(e);
    }
  }

  handleAddTask() {
    if (this.getModalInput()) {
      const { name, importance, date } = this.getModalInput();

      tasksManager.appendTask(name, importance, date);
      this.renderNewTaskRow();

      this.toggleModal(false);
      this.clearModal();
      this.updateAllTaskCount();
    } else {
      return;
    }
  }

  handleDeleteTask(e) {
    const taskRow = e.target.closest('.task-row');
    const taskId = +taskRow.dataset.id;

    tasksManager.deleteTask(taskId);

    document
      .querySelectorAll(`.task-row[data-id="${taskId}"]`)
      .forEach(row => row.remove());

    this.checkTasksAvailability();
    this.updateAllTaskCount();
  }

  handleNavSwitch(e) {
    const navBtn = e.target.closest('.btn-nav');
    if (!navBtn) return;

    const type = navBtn.id;

    document
      .querySelectorAll('.btn-nav')
      .forEach(btn => btn.classList.remove('nav-active'));

    navBtn.classList.add('nav-active');

    document
      .querySelectorAll('.type-container')
      .forEach(typeSection => typeSection.classList.add('hidden'));

    document.querySelector(`.${type}`).classList.remove('hidden');

    this.checkTasksAvailability();
  }

  getTypes() {
    const types = [];

    document.querySelectorAll('.type-container').forEach(container => {
      const classes = [...container.classList];
      const type = classes.filter(name => name !== 'type-container');

      types.push(type[0]);
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
    const newTask = _.last(tasksManager.allTasks);
    const importanceClass = this.getImportanceClass(newTask.importance);

    // Always show tasks in Inbox
    this.prepareNewTaskRow('inbox', newTask, importanceClass);

    if (newTask.type === 'Today') {
      this.prepareNewTaskRow('today', newTask, importanceClass);
    } else {
      this.prepareNewTaskRow('planned', newTask, importanceClass);
    }

    this.checkTasksAvailability();
  }

  prepareNewTaskRow(containerType, task, importanceClass) {
    const taskWrapper = document.querySelector(
      `.${containerType} .task-wrapper`
    );

    const taskRow = `
      <div class="task-row ${importanceClass}" data-id="${task.id}">
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

  checkTasksAvailability() {
    const typeContainers = document.querySelectorAll('.type-container');
    const types = this.getTypes();

    typeContainers.forEach(typeContainer => {
      const type = [...typeContainer.classList].find(typeClass =>
        types.includes(typeClass)
      );

      tasksManager.getTasks(type);
      this.toggleNoTasksMessage(typeContainer);
    });
  }

  updateAllTaskCount() {
    const counts = tasksManager.getAllTaskCounts();

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
