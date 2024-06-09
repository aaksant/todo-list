export default class UI {
  #tasks = [];

  #getSelectedOption(option) {
    return option.options[option.selectedIndex].text;
  }

  init() {
    this.setupEventListeners();
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

    // event delegation
    document
      .querySelector('.task-wrapper')
      .addEventListener('click', this.handleTaskFunctions.bind(this));
  }

  handleAddTask() {
    const inputTaskName = document.getElementById('taskName');
    const typeSelect = document.getElementById('type');
    const importanceSelect = document.getElementById('importance');

    this.appendTask(inputTaskName, typeSelect, importanceSelect);
    this.renderNewTask();
    this.toggleModalVisibility(false);
  }

  handleDeleteTask(e) {
    const taskRow = e.target.closest('.task-row');
    const taskId = +taskRow.dataset.id;
    const taskIndex = this.#tasks.findIndex(task => task.id === taskId);

    taskRow.remove();
    this.#tasks.splice(taskIndex, 1);
  }

  handleTaskFunctions(e) {
    if (e.target.closest('.delete')) {
      this.handleDeleteTask(e);
    }
  }

  handleKeyboardInput(e) {
    if (e.key === 'Escape') this.toggleModalVisibility(false);
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

  appendTask(taskName, typeSelect, importanceSelect) {
    this.#tasks.push({
      name: taskName.value.trim(),
      type: this.#getSelectedOption(typeSelect),
      importance: this.#getSelectedOption(importanceSelect),
      id: Date.now()
    });
  }

  renderNewTask() {
    const taskWrapper = document.querySelector('.task-wrapper');
    const newTask = this.#tasks[this.#tasks.length - 1];
    const importanceBorder = this.getImportanceBorder(newTask.importance);

    const taskRow = `
      <div class="task-row ${importanceBorder}" data-id="${newTask.id}">
        <div class="task-name-container">
          <p class="task-name">${newTask.name}</p>
          <p class="task-type">${newTask.type}</p>
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
          <p class="task-date">02/06/2024</p>
        </div>
      </div>`;

    taskWrapper.insertAdjacentHTML('beforeend', taskRow);
  }

  getImportanceBorder(importance) {
    switch (importance) {
      case 'High':
        return 'importance-high';
      case 'Medium':
        return 'importance-medium';
      case 'Low':
        return 'importance-low';
    }
  }
}
