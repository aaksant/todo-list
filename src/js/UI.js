import { format } from 'date-fns';
import { isSameDay } from 'date-fns/isSameDay';
import _ from 'lodash';

import editSvg from '../assets/edit.svg';
import trashSvg from '../assets/trash.svg';
import TasksManager from './TasksManager';

const tasksManager = new TasksManager();

export default class UI {
  init() {
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

    btnOpenModal.addEventListener(
      'click',
      this.toggleModalVisibility.bind(this, true)
    );

    btnAddTask.addEventListener('click', this.handleAddTask.bind(this));

    btnCloseModal.addEventListener(
      'click',
      this.toggleModalVisibility.bind(this, false)
    );

    // Escape keydown support
    document.addEventListener('keydown', this.handleKeyboardInput.bind(this));

    // Overlay click
    overlay.addEventListener(
      'click',
      this.toggleModalVisibility.bind(this, false)
    );

    taskWrappers.forEach(wrapper =>
      wrapper.addEventListener('click', this.handleTaskFunctions.bind(this))
    );

    sidebar.addEventListener('click', this.handleNavSwitch.bind(this));
  }

  toggleModalVisibility(isVisible) {
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

  getModalInput() {
    const taskName = document.getElementById('taskName');
    const importanceSelect = document.getElementById('importance');
    const dateInput = document.getElementById('date');

    return {
      name: taskName.value.trim(),
      importanceSelect: this.#getSelectedOption(importanceSelect),
      date: format(dateInput.value || new Date(), 'dd/MM/yyyy')
    };
  }

  clearModal() {
    document.getElementById('taskName').value = '';
    document.getElementById('importance').selectedIndex = 0;
    document.getElementById('date').value = '';
  }

  toDateObject(dateStr) {
    return dateStr
      .split('/')
      .map((part, i) => {
        return i === 1 ? Number.parseInt(part) - 1 : Number.parseInt(part);
      })
      .reverse();
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

  handleKeyboardInput(e) {
    if (e.key === 'Escape') this.toggleModalVisibility(false);
  }

  handleTaskFunctions(e) {
    if (e.target.closest('.delete')) {
      this.handleDeleteTask(e);
    }
  }

  handleAddTask() {
    const { name, importanceSelect, date } = this.getModalInput();

    tasksManager.appendTask(name, importanceSelect, date);
    this.renderNewTask();

    this.toggleModalVisibility(false);
    this.clearModal();
  }

  handleDeleteTask(e) {
    const taskRow = e.target.closest('.task-row');
    const taskId = Number(taskRow.dataset.id);

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
    document
      .querySelector(`.${type}`)
      .querySelector('.no-tasks-message')
      .classList.remove('hidden');
  }

  // FIXME: Unmatched containerType and renderNewTask actual container results in every task is always displayed in Planned
  renderNewTask() {
    const tasks = tasksManager.tasks;
    const newTask = tasks[tasks.length - 1];
    const importanceClass = this.getImportanceClass(newTask.importance);

    const containerType = isSameDay(
      new Date(...this.toDateObject(newTask.date)),
      new Date()
    )
      ? 'today'
      : 'planned';

    this.createNewTaskRow('inbox', newTask, importanceClass);
    this.createNewTaskRow(containerType, newTask, importanceClass);
    this.checkTasksAvailability();
  }

  createNewTaskRow(containerType, task, importanceClass) {
    const taskWrapper = document.querySelector(
      `.${containerType} .task-wrapper`
    );

    const taskType = containerType === 'today' ? 'Today' : 'Planned';

    const taskRow = `
      <div class="task-row ${importanceClass}" data-id="${task.id}">
          <div class="task-name-container">
              <p class="task-name">${task.name}</p>
              <span class="task-type">${taskType}</span>
              <span class="task-importance">${
                importanceClass.split('-')[1]
              }</span>
          </div>
          <div class="task-function">
              <div class="btn btn-task edit">
                <img src="${editSvg}" class="icon" alt="Edit"</img>
              </div>
              <div class="btn btn-task delete">
                <img src="${trashSvg}" class="icon" alt="Trash"</img>
              </div>
              <p class="task-date">${task.date}</p>
          </div>
      </div>`;

    taskWrapper.insertAdjacentHTML('beforeend', taskRow);
  }

  checkTasksAvailability() {
    const tasks = tasksManager.tasks;
    const typeContainers = document.querySelectorAll('.type-container');
    const taskTypes = ['inbox', 'today', 'planned'];

    typeContainers.forEach(typeContainer => {
      const type =
        [...typeContainer.classList].find(typeClass =>
          taskTypes.includes(typeClass)
        ) || '';

      const tasksForType =
        type === 'inbox' ? tasks : tasks.filter(task => task.type === type);

      const noTasksMessage = typeContainer.querySelector('.no-tasks-message');

      if (tasksForType.length !== 0) {
        noTasksMessage.style.display = 'none';
      } else {
        noTasksMessage.style.display = 'block';
      }
    });
  }
}
