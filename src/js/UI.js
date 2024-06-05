export default class UI {
  init() {
    this.handleModal();
    // this.showTasks();
    this.getTaskData();
  }

  handleModal() {
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const btnNewTask = document.querySelector('.add-task-btn');
    const btnCloseModal = document.querySelector('.btn-close-modal');

    const showModal = () => {
      modal.classList.remove('hidden');
      overlay.classList.remove('hidden');
    };

    const hideModal = () => {
      modal.classList.add('hidden');
      overlay.classList.add('hidden');
    };

    btnNewTask.addEventListener('click', showModal);
    btnCloseModal.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        hideModal();
      }
    });
  }

  #getSelectedOption(option) {
    return option.options[option.selectedIndex].text
  }

  getTaskData() {
    const inputTaskName = document.getElementById('taskName');
    const typeSelect = document.getElementById('type');
    const importanceSelect = document.getElementById('importance');

    document.querySelector('.btn-confirm-add').addEventListener('click', () => {
      console.log(inputTaskName.value);
      console.log(this.#getSelectedOption(typeSelect));
      console.log(this.#getSelectedOption(importanceSelect));
    });
  }
}
