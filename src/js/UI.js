import { format } from 'date-fns';

export default class UI {
  #tasks = [];

  #getSelectedOption(option) {
    return option.options[option.selectedIndex].text;
  }

  init() {
    this.setupEventListeners();
    this.checkTasksAvailability();
  }

  setupEventListeners() {
    const btnOpenModal = document.querySelector('.add-task-btn');
    const btnCloseModal = document.querySelector('.btn-close-modal');
    const btnAddTask = document.querySelector('.btn-confirm-add');

    btnOpenModal.addEventListener(
      'click',
      this.toggleModalVisibility.bind(this, true)
    );

    btnAddTask.addEventListener('click', this.handleAddTask.bind(this));

    btnCloseModal.addEventListener(
      'click',
      this.toggleModalVisibility.bind(this, false)
    );

    document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
    document
      .querySelector('.overlay')
      .addEventListener('click', this.toggleModalVisibility.bind(this, false));

    document
      .querySelector('.task-wrapper')
      .addEventListener('click', this.handleTaskFunctions.bind(this));

    document
      .querySelector('.sidebar')
      .addEventListener('click', this.handleNavSwitch.bind(this));
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

  handleKeyboardInput(e) {
    if (e.key === 'Escape') this.toggleModalVisibility(false);
  }

  handleTaskFunctions(e) {
    if (e.target.closest('.delete')) {
      this.handleDeleteTask(e);
    }
  }

  getModalInput() {
    return {
      name: document.getElementById('taskName'),
      typeSelect: document.getElementById('type'),
      importanceSelect: document.getElementById('importance')
    };
  }

  handleAddTask() {
    const input = this.getModalInput();

    this.appendTask(
      input.name,
      input.typeSelect,
      input.importanceSelect
    );
    this.renderNewTask();
    this.toggleModalVisibility(false);
  }

  handleDeleteTask(e) {
    const taskRow = e.target.closest('.task-row');
    const taskId = Number(taskRow.dataset.id);

    this.#tasks = this.#tasks.filter(task => task.id !== taskId);

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

  appendTask(taskName, typeSelect, importanceSelect) {
    this.#tasks.push({
      id: Date.now(),
      name: taskName.value.trim(),
      type: this.#getSelectedOption(typeSelect),
      importance: this.#getSelectedOption(importanceSelect),
      date: format(new Date(), 'dd/MM/yyyy')
    });
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

  renderNewTask() {
    const newTask = this.#tasks[this.#tasks.length - 1];
    const importanceClass = this.getImportanceClass(newTask.importance);

    // Render the task in the Inbox
    this.placeTaskInContainer('inbox', newTask, importanceClass);

    // Render the task in its respective type
    if (newTask.type.toLowerCase() !== 'inbox') {
      this.placeTaskInContainer(
        newTask.type.toLowerCase(),
        newTask,
        importanceClass
      );
    }

    this.checkTasksAvailability();
  }

  placeTaskInContainer(containerType, task, importanceClass) {
    const taskWrapper = document.querySelector(
      `.${containerType} .task-wrapper`
    );

    const taskRow = `
      <div class="task-row ${importanceClass}" data-id="${task.id}">
          <div class="task-name-container">
              <p class="task-name">${task.name}</p>
              <p class="task-type">${task.type}</p>
          </div>
          <div class="task-function">
              <div class="btn btn-task edit">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="icon"
                  >
                      <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                  </svg>
              </div>
              <div class="btn btn-task delete">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="icon"
                  >
                      <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                  </svg>
              </div>
              <p class="task-date">${task.date}</p>
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

      const tasksForType =
        type === 'inbox'
          ? this.#tasks
          : this.#tasks.filter(task => task.type.toLowerCase() === type);

      const noTasksMessage = typeContainer.querySelector('.no-tasks-message');

      if (tasksForType.length !== 0) {
        noTasksMessage.style.display = 'none';
      } else {
        noTasksMessage.style.display = 'block';
      }
    });
  }
}
