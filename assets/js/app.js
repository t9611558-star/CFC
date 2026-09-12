/******/ (() => { // webpackBootstrap
(function () {
  var STORAGE_KEY = "cfc-todos";
  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var summary = document.getElementById("task-summary");
  var meta = document.getElementById("task-meta");
  var clearCompletedButton = document.getElementById("clear-completed");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

  if (!form || !input || !list || !summary || !meta || !clearCompletedButton || !filterButtons.length) {
    return;
  }

  var currentFilter = "all";
  var todos = loadTodos();

  function loadTodos() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(function (todo) {
          return todo && typeof todo.text === "string" && typeof todo.completed === "boolean";
        })
        .map(function (todo, index) {
          return {
            id: typeof todo.id === "string" && todo.id ? todo.id : "todo-" + Date.now() + "-" + index,
            text: todo.text.trim(),
            completed: todo.completed,
          };
        })
        .filter(function (todo) {
          return todo.text.length > 0;
        });
    } catch (error) {
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
    }
  }

  function createTodo(text) {
    return {
      id:
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : "todo-" + Date.now() + "-" + Math.random().toString(16).slice(2),
      text: text,
      completed: false,
    };
  }

  function getVisibleTodos() {
    return todos.filter(function (todo) {
      if (currentFilter === "active") {
        return !todo.completed;
      }

      if (currentFilter === "completed") {
        return todo.completed;
      }

      return true;
    });
  }

  function updateCounts() {
    var remaining = todos.filter(function (todo) {
      return !todo.completed;
    }).length;
    var completed = todos.length - remaining;
    var taskLabel = todos.length === 1 ? "task" : "tasks";
    summary.textContent = todos.length + " " + taskLabel;
    meta.textContent = remaining + " remaining • " + completed + " completed";
    clearCompletedButton.disabled = completed === 0;
  }

  function render() {
    var visibleTodos = getVisibleTodos();
    list.innerHTML = "";

    if (!visibleTodos.length) {
      var emptyState = document.createElement("li");
      emptyState.className = "empty-state";
      emptyState.textContent =
        currentFilter === "all"
          ? "No tasks yet. Add your first item above."
          : "No tasks match the selected filter.";
      list.appendChild(emptyState);
      updateCounts();
      return;
    }

    visibleTodos.forEach(function (todo) {
      var item = document.createElement("li");
      item.className = "todo-item" + (todo.completed ? " is-complete" : "");

      var checkbox = document.createElement("input");
      checkbox.className = "todo-checkbox";
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "Mark " + todo.text + (todo.completed ? " as incomplete" : " as complete"));
      checkbox.addEventListener("change", function () {
        todos = todos.map(function (entry) {
          if (entry.id !== todo.id) {
            return entry;
          }

          return {
            id: entry.id,
            text: entry.text,
            completed: !entry.completed,
          };
        });

        saveTodos();
        render();
      });

      var text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.text;

      var deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", "Delete " + todo.text);
      deleteButton.addEventListener("click", function () {
        todos = todos.filter(function (entry) {
          return entry.id !== todo.id;
        });
        saveTodos();
        render();
      });

      item.appendChild(checkbox);
      item.appendChild(text);
      item.appendChild(deleteButton);
      list.appendChild(item);
    });

    updateCounts();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var value = input.value.trim();

    if (!value) {
      input.focus();
      return;
    }

    todos.unshift(createTodo(value));
    saveTodos();
    input.value = "";
    input.focus();
    render();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach(function (entry) {
        var isActive = entry === button;
        entry.classList.toggle("is-active", isActive);
        entry.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      render();
    });
  });

  clearCompletedButton.addEventListener("click", function () {
    todos = todos.filter(function (todo) {
      return !todo.completed;
    });
    saveTodos();
    render();
  });

  render();
})();

/******/ })()
;