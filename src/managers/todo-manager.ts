import type { TodoItem, RepeatInterval, TodoFilter } from "../types/index.js";

export class TodoManager {
  private todos: TodoItem[] = [];
  private currentFilter: TodoFilter = "today";

  async init() {
    await this.loadTodos();
    this.checkAndRegenerateRepeating();
  }

  async loadTodos() {
    const result = await chrome.storage.local.get("todos");
    this.todos = result.todos || [];
  }

  async saveTodos() {
    await chrome.storage.local.set({ todos: this.todos });
  }

  getTodos(): TodoItem[] {
    return this.todos;
  }

  getFilteredTodos(): TodoItem[] {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    switch (this.currentFilter) {
      case "today":
        return this.todos
          .filter(
            (todo) =>
              !todo.completed &&
              (!todo.dueDate || (todo.dueDate >= todayStart && todo.dueDate < todayEnd))
          )
          .sort((a, b) => {
            // Sort by due date, then by created date
            if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return b.createdAt - a.createdAt;
          });

      case "upcoming":
        return this.todos
          .filter((todo) => !todo.completed && todo.dueDate && todo.dueDate >= todayEnd)
          .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));

      case "completed":
        return this.todos
          .filter((todo) => todo.completed)
          .sort((a, b) => b.updatedAt - a.updatedAt);

      default:
        return this.todos;
    }
  }

  setFilter(filter: TodoFilter) {
    this.currentFilter = filter;
  }

  getCurrentFilter(): TodoFilter {
    return this.currentFilter;
  }

  async addTodo(
    text: string,
    dueDate?: number,
    repeatInterval: RepeatInterval = "none",
    customRepeatDays?: number
  ): Promise<TodoItem> {
    const todo: TodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate,
      repeatInterval,
      customRepeatDays,
    };

    this.todos.push(todo);
    await this.saveTodos();
    return todo;
  }

  async toggleTodo(id: string): Promise<void> {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();

    // Handle repeating todos
    if (todo.completed && todo.repeatInterval !== "none") {
      todo.lastCompletedDate = Date.now();

      // Generate next occurrence
      const nextTodo = this.generateNextOccurrence(todo);
      if (nextTodo) {
        this.todos.push(nextTodo);
      }
    }

    await this.saveTodos();
  }

  async deleteTodo(id: string): Promise<void> {
    this.todos = this.todos.filter((t) => t.id !== id);
    await this.saveTodos();
  }

  async clearOldCompleted(): Promise<number> {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const initialCount = this.todos.length;

    this.todos = this.todos.filter(
      (todo) => !todo.completed || todo.updatedAt > sevenDaysAgo
    );

    await this.saveTodos();
    return initialCount - this.todos.length;
  }

  private generateNextOccurrence(todo: TodoItem): TodoItem | null {
    if (!todo.dueDate) return null;

    let nextDueDate: number;
    const currentDue = new Date(todo.dueDate);

    switch (todo.repeatInterval) {
      case "daily":
        nextDueDate = new Date(currentDue.getTime() + 24 * 60 * 60 * 1000).getTime();
        break;

      case "weekly":
        nextDueDate = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000).getTime();
        break;

      case "monthly":
        const nextMonth = new Date(currentDue);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextDueDate = nextMonth.getTime();
        break;

      case "custom":
        if (!todo.customRepeatDays) return null;
        nextDueDate = new Date(
          currentDue.getTime() + todo.customRepeatDays * 24 * 60 * 60 * 1000
        ).getTime();
        break;

      default:
        return null;
    }

    return {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: todo.text,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: nextDueDate,
      repeatInterval: todo.repeatInterval,
      customRepeatDays: todo.customRepeatDays,
    };
  }

  private checkAndRegenerateRepeating() {
    // Check if any repeating todos need to be regenerated
    const now = Date.now();
    const todosToAdd: TodoItem[] = [];

    for (const todo of this.todos) {
      if (
        todo.repeatInterval !== "none" &&
        todo.completed &&
        todo.lastCompletedDate &&
        todo.dueDate &&
        todo.dueDate < now
      ) {
        // Check if we need to generate a new occurrence
        const nextTodo = this.generateNextOccurrence(todo);
        if (nextTodo && !this.todos.some((t) => t.text === nextTodo.text && !t.completed)) {
          todosToAdd.push(nextTodo);
        }
      }
    }

    if (todosToAdd.length > 0) {
      this.todos.push(...todosToAdd);
      this.saveTodos();
    }
  }

  getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    return {
      total: this.todos.length,
      completed: this.todos.filter((t) => t.completed).length,
      today: this.todos.filter(
        (t) =>
          !t.completed &&
          (!t.dueDate || (t.dueDate >= todayStart && t.dueDate < todayEnd))
      ).length,
      upcoming: this.todos.filter((t) => !t.completed && t.dueDate && t.dueDate >= todayEnd)
        .length,
      overdue: this.todos.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStart)
        .length,
    };
  }
}
