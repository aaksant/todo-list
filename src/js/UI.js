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
    const btnOpenModal = document.querySelector('.add-task-btn');
    const btnCloseModal = document.querySelector('.btn-close-modal');
    const btnAddTask = document.querySelector('.btn-confirm-add');
    const overlay = document.querySelector('.overlay');
    const taskWrappers = document.querySelectorAll('.task-wrapper');
    const sidebar = document.querySelector('.sidebar');

    btnOpenModal.addEventListener('click', this.toggleModal.bind(this, true));

    btnAddTask.addEventListener('click', this.handleAddTask.bind(this));

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

  toggleModal(isVisible) {
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');

    if (isVisible) {
      modal.classList.remove('hidden');
      overlay.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
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

  getModalInput() {
    const taskName = document.getElementById('taskName');
    const importanceSelect = document.getElementById('importance');
    const dateInput = document.getElementById('date');

    if (taskName.value) {
      return {
        name: _.capitalize(taskName.value.trim()),
        importanceSelect: this.#getSelectedOption(importanceSelect),
        date: dateInput.value || new Date()
      };
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
      const { name, importanceSelect, date } = this.getModalInput();

      tasksManager.appendTask(name, importanceSelect, date);
      this.renderNewTaskRow();

      this.toggleModal(false);
      this.clearModal();
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
  }

  handleNavSwitch(e) {
    const navBtn = e.target.closest('.nav-btn');
    if (!navBtn) return;

    const type = navBtn.id;

    document
      .querySelectorAll('.nav-btn')
      .forEach(btn => btn.classList.remove('nav-active'));

    navBtn.classList.add('nav-active');

    document
      .querySelectorAll('.type-container')
      .forEach(typeSection => typeSection.classList.add('hidden'));

    document.querySelector(`.${type}`).classList.remove('hidden');

    this.checkTasksAvailability();
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
              <span class="task-type">${task.type}</span>
              <span class="task-importance">${
                importanceClass.split('-')[1]
              }</span>
          </div>
          <div class="task-function">
              <div class="btn btn-task edit">
                <img src="${editSvg}" class="icon" alt="Edit"/>
              </div>
              <div class="btn btn-task delete">
                <img src="${trashSvg}" class="icon" alt="Trash"/>
              </div>
              <p class="task-date">${format(task.date, 'dd/MM/yyyy')}</p>
          </div>
      </div>`;

    taskWrapper.insertAdjacentHTML('beforeend', taskRow);
  }

  checkTasksAvailability() {
    const typeContainers = document.querySelectorAll('.type-container');
    const taskTypes = ['inbox', 'today', 'planned'];

    typeContainers.forEach(typeContainer => {
      const type =
        [...typeContainer.classList].find(typeClass =>
          taskTypes.includes(typeClass)
        ) || '';

      tasksManager.getTasks(type);
      this.toggleNoTasksMessage(typeContainer);
    });
  }
}
