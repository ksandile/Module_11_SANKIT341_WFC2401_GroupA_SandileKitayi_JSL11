// TASK1: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
// TASK2: import initialData
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// TASK3: Get elements from the DOM
const elements = {
    // Navigation Sidebar elements
    sideBar: document.querySelector('.side-bar'),
    logo: document.getElementById('logo'),
    boardsNavLinks: document.getElementById('boards-nav-links-div'),
    darkThemeIcon: document.getElementById('icon-dark'),
    themeSwitch: document.getElementById('switch'),
    lightThemeIcon: document.getElementById('icon-light'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
  
    // Header elements
    header: document.getElementById('header'),
    headerBoardName: document.getElementById('header-board-name'),
    addNewTaskBtn: document.getElementById('add-new-task-btn'),
    editBoardBtn: document.getElementById('edit-board-btn'),
    editBoardDiv: document.getElementById('editBoardDiv'),
  
    // Task Columns elements
    todoColumn: document.querySelector('.column-div[data-status="todo"]'),
    doingColumn: document.querySelector('.column-div[data-status="doing"]'),
    doneColumn: document.querySelector('.column-div[data-status="done"]'),
    filterDiv: document.getElementById('filterDiv'),
  
    // New Task Modal elements
    newTaskModal: document.getElementById('new-task-modal-window'),
    titleInput: document.getElementById('title-input'),
    descInput: document.getElementById('desc-input'),
    selectStatus: document.getElementById('select-status'),
    createTaskBtn: document.getElementById('create-task-btn'),
    cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  
    // Edit Task Modal elements
    editTaskModal: document.querySelector('.edit-task-modal-window'),
    editTaskForm: document.getElementById('edit-task-form'),
    editTaskTitleInput: document.getElementById('edit-task-title-input'),
    editTaskDescInput: document.getElementById('edit-task-desc-input'),
    editSelectStatus: document.getElementById('edit-select-status'),
    saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn'),
  
    // Filter elements
    filterDiv: document.getElementById('filterDiv'),
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK4: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const boardsContainer = elements.boardsNavLinks;
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; // Fixed the ternary operator syntax
    localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // Added a line to save the active board to localStorage
    elements.headerBoardName.textContent = activeBoard; // Fixed the syntax
    styleActiveBoard(activeBoard); // Fixed the syntax
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK5: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    // Add event listener to each board button
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    // Append each board button to the container
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK6: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const columnDivs = [elements.todoColumn, elements.doingColumn, elements.doneColumn];
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // Changed = to === in the filter functions for proper comparison values.

  columnDivs.forEach(column => { // Removed elements to ensure that we iterate over columnDivs
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { // Changed = to === in the filter functions for proper comparison values.
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {  // Corrected the syntax of the taskElement.click() line to taskElement.addEventListener('click', () => {...}) for proper event handling.
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK7: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active'); // Added "classList"
    }
    else {
      btn.classList.remove('active'); // Added "classList".
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModal.addEventListener('submit', (event) => {
    event.preventDefault();
    addTask(event);
  });
}


// Toggles tasks modal
// Task8: Fix bugs
function toggleModal(show, modal = elements.editTaskModal) {
  modal.style.display = show ? 'block' : 'none'; //Corrected syntax and logic of ternary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  console.log("addTask function called")
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

function toggleSidebar(show) {
  if (show) {
    console.log("show sidebar button clicked");
    elements.sideBar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
  } else {
    elements.sideBar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
  }
}

function toggleTheme() {
  const body = document.body;
  // Toggle between 'light-theme' and 'dark-theme' classes
  body.classList.toggle('light-theme');
  body.classList.toggle('dark-theme');
  // Save the theme preference to localStorage
  const isLightTheme = body.classList.contains('light-theme');
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id); // Pass the task id to saveTaskChanges
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    // Assuming deleteTask is a function in your helper functions
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal); // Close the task modal after deleting the task
    refreshTasksUI(); // Refresh the UI to reflect the changes
  });

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const newTitle = elements.editTaskTitleInput.value;
  const newDescription = elements.editTaskDescInput.value;
  const newStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: newTitle,
    description: newDescription,
    status: newStatus
  };

  // Update task using a helper function if needed
  patchTask(taskId, updatedTask);
  // putTask(taskId, updatedTask);

  // Close the modal
  toggleModal(false, elements.editTaskModal);

  // Refresh the UI to reflect the changes
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar); // Pass the value retrieved from localStorage
  const isLightTheme = localStorage.getItem('theme') === 'light'; // Corrected key to match the one used for setting
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}