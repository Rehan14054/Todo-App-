let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const password = document.querySelector("#password");
const togglePassword = document.querySelector("#togglePassword");
const loginForm = document.querySelector("#login-Form");

password.addEventListener("input", function () {
  if (password.value.length > 0) {
    togglePassword.classList.remove("hidden");
  } else {
    togglePassword.classList.add("hidden");
    password.type = "password";
    togglePassword.textContent = "Show";
  }
});

togglePassword.addEventListener("click", function () {
  if (password.type === "password") {
    password.type = "text";
    togglePassword.textContent = "Hide";
  } else {
    password.type = "password";
    togglePassword.textContent = "Show";
  }
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  document.querySelector("#login-screen").classList.add("hidden");
  document.querySelector("#task-screen").classList.remove("hidden");
  initTaskScreen();
});

let taskScreenInitialized = false;
let locationScreenInitialized = false;

// ===== TASK SCREEN =====
function initTaskScreen() {
  if (taskScreenInitialized) return;
  taskScreenInitialized = true;

  const addTaskBtn = document.querySelector("#add-task-btn");
  const taskModal = document.querySelector("#task-modal");
  const saveTaskBtn = document.querySelector("#save-task-btn");
  const cancelTaskBtn = document.querySelector("#cancel-task-btn");
  const incompleteList = document.querySelector("#incomplete-list");
  const completedList = document.querySelector("#completed-list");
  const taskSummary = document.querySelector("#task-summary");
  const taskDate = document.querySelector("#task-date");

  // tooltip
  const tooltip = document.querySelector("#task-tooltip");
  const tooltipSummary = document.querySelector("#tooltip-summary");
  const tooltipDescription = document.querySelector("#tooltip-description");

  // reminder
  const reminderInput = document.querySelector("#reminder-input");
  const reminderTime = document.querySelector("#reminder-time");

  // FIX 1 — load saved tasks from localStorage on init
  loadTasks(incompleteList, completedList);

  // open modal
  addTaskBtn.addEventListener("click", function () {
    taskModal.classList.remove("hidden");
  });

  // close modal
  cancelTaskBtn.addEventListener("click", function () {
    taskModal.classList.add("hidden");
  });

  // go to location
  document.querySelector("#go-to-location").addEventListener("click", function () {
    document.querySelector("#task-screen").classList.add("hidden");
    document.querySelector("#location-screen").classList.remove("hidden");
    initLocationScreen();
  });

  // logout
  document.querySelector("#logout-btn").addEventListener("click", function () {
    document.querySelector("#task-screen").classList.add("hidden");
    document.querySelector("#login-screen").classList.remove("hidden");
  });

  // FIX 2 — tooltip listeners moved here, outside saveTaskBtn, so they only attach once
  document.querySelector("#tooltip-skip").addEventListener("click", function () {
    tooltip.classList.add("hidden");
    reminderInput.classList.add("hidden");
  });

  document.querySelector("#tooltip-remind").addEventListener("click", function (e) {
    e.stopPropagation();
    reminderInput.classList.remove("hidden");
  });

  document.querySelector("#set-reminder-btn").addEventListener("click", function (e) {
    e.stopPropagation();

    const timeValue = reminderTime.value;

    if (timeValue === "") {
      alert("Please pick a reminder time");
      return;
    }

    const reminderDate = new Date(timeValue);
    const now = new Date();
    const diff = reminderDate - now;

    if (diff <= 0) {
      alert("Please pick a future time!");
      return;
    }

    const taskName = tooltipSummary.textContent;

    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        setTimeout(function () {
          new Notification("Task Reminder! 🔔", {
            body: taskName,
          });
        }, diff);
        alert("Reminder set for: " + reminderDate.toLocaleString());
      } else {
        alert("Please allow notifications");
      }
    });

    reminderInput.classList.add("hidden");
    tooltip.classList.add("hidden");
    reminderTime.value = "";
  });

  // click anywhere → close tooltip
  document.addEventListener("click", function (e) {
    if (!tooltip.contains(e.target)) {
      tooltip.classList.add("hidden");
      reminderInput.classList.add("hidden");
    }
  });

  // save task
  saveTaskBtn.addEventListener("click", function () {
    const summary = taskSummary.value.trim();
    const rawDate = taskDate.value;

    // FIX 4 — handle empty date gracefully
    const date = rawDate
      ? new Date(rawDate).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "No date set";

    const description = document.querySelector("#task-description").value;

    if (summary === "") {
      alert("Please enter a task summary!");
      return;
    }

    const taskObj = {
      summary: summary,
      description: description,
      date: date,
      completed: false,
    };

    tasks.push(taskObj);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTask(taskObj, incompleteList, completedList);

    // clear inputs
    taskSummary.value = "";
    taskDate.value = "";
    document.querySelector("#task-description").value = "";
    taskModal.classList.add("hidden");
  });
} // ← end of initTaskScreen

// ===== LOCATION SCREEN =====
function initLocationScreen() {
  if (locationScreenInitialized) return;
  locationScreenInitialized = true;

  const checkInBtn = document.querySelector("#check-in-btn");
  const locationModal = document.querySelector("#location-modal");
  const saveLocationBtn = document.querySelector("#save-location-btn");
  const cancelLocationBtn = document.querySelector("#cancel-location-btn");
  const currentList = document.querySelector("#current-locations");
  const previousList = document.querySelector("#previous-locations");

  // load default locations
  if (currentList.children.length === 0) {
    currentList.innerHTML = `
      <li class="flex items-start gap-3">
        <span class="text-red-500">📍</span>
        <div>
          <p class="text-sm font-medium">Pustegränd, Stockholm, SE</p>
          <p class="text-xs text-gray-400 mt-1">59.323°N, 18.068°E</p>
        </div>
      </li>
    `;

    previousList.innerHTML = `
      <li class="flex items-start gap-3">
        <span class="text-red-500">📍</span>
        <div>
          <p class="text-sm font-medium">Hälsingegatan, Stockholm, SE</p>
          <p class="text-xs text-gray-400 mt-1">59.347°N, 18.056°E</p>
        </div>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-red-500">📍</span>
        <div>
          <p class="text-sm font-medium">Långa Gatan, Stockholm, SE</p>
          <p class="text-xs text-gray-400 mt-1">59.318°N, 18.069°E</p>
        </div>
      </li>
    `;
  }

  // go back to task screen
  document.querySelector("#go-to-task").addEventListener("click", function () {
    document.querySelector("#location-screen").classList.add("hidden");
    document.querySelector("#task-screen").classList.remove("hidden");
  });

  // logout
  document.querySelector("#location-logout-btn").addEventListener("click", function () {
    document.querySelector("#location-screen").classList.add("hidden");
    document.querySelector("#login-screen").classList.remove("hidden");
  });

  // open modal
  checkInBtn.addEventListener("click", function () {
    locationModal.classList.remove("hidden");
  });

  // close modal
  cancelLocationBtn.addEventListener("click", function () {
    locationModal.classList.add("hidden");
  });

  // save new location
  saveLocationBtn.addEventListener("click", function () {
    const name = document.querySelector("#location-name").value.trim();
    const coords = document.querySelector("#location-coords").value;

    if (name === "") {
      alert("Please enter location name!");
      return;
    }

    // move current to previous
    const currentItem = currentList.querySelector("li");
    if (currentItem) {
      previousList.prepend(currentItem);
    }

    const li = document.createElement("li");
    li.classList.add("flex", "items-start", "gap-3");
    li.innerHTML = `
      <span class="text-red-500">📍</span>
      <div>
        <p class="text-sm font-medium">${name}</p>
        <p class="text-xs text-gray-400 mt-1">${coords}</p>
      </div>
    `;
    currentList.appendChild(li);

    document.querySelector("#location-name").value = "";
    document.querySelector("#location-coords").value = "";
    locationModal.classList.add("hidden");
  });
} // ← end of initLocationScreen

// ===== LOAD TASKS =====
function loadTasks(incompleteList, completedList) {
  tasks.forEach(function (task) {
    if (task.completed === false) {
      renderTask(task, incompleteList, completedList);
    } else {
      renderCompletedTask(task, completedList);
    }
  });
}

// ===== RENDER INCOMPLETE TASK =====
function renderTask(task, incompleteList, completedList) {
  const li = document.createElement("li");
  li.classList.add("flex", "items-start", "gap-3");
  li.dataset.summary = task.summary;
  li.dataset.description = task.description;

  li.innerHTML = `
    <input type="checkbox" class="mt-1 w-4 h-4 cursor-pointer" />
    <div>
      <p class="text-sm font-medium">${task.summary}</p>
      <p class="text-xs text-red-500">🕐 ${task.date}</p>
    </div>
  `;

  incompleteList.appendChild(li);

  // FIX 3 — tooltip click added to renderTask so loaded tasks also show tooltip
  const tooltip = document.querySelector("#task-tooltip");
  const tooltipSummary = document.querySelector("#tooltip-summary");
  const tooltipDescription = document.querySelector("#tooltip-description");

  li.addEventListener("click", function (e) {
    if (e.target.type === "checkbox") return;
    e.stopPropagation();
    tooltipSummary.textContent = task.summary;
    tooltipDescription.textContent = task.description;
    tooltip.classList.remove("hidden");
  });

  const checkbox = li.querySelector("input[type=checkbox]");
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      li.remove();

      tasks = tasks.map(function (t) {
        if (t.summary === task.summary) {
          t.completed = true;
        }
        return t;
      });

      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderCompletedTask(task, completedList);
    }
  });
}

// ===== RENDER COMPLETED TASK =====
function renderCompletedTask(task, completedList) {
  const completedLi = document.createElement("li");
  completedLi.classList.add("flex", "items-start", "gap-3");

  completedLi.innerHTML = `
    <input type="checkbox" checked class="mt-1 w-4 h-4 cursor-pointer" />
    <div>
      <p class="text-sm text-gray-400 line-through">${task.summary}</p>
    </div>
  `;

  completedList.appendChild(completedLi);
}