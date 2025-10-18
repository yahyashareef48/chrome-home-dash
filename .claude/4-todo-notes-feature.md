# Todo List & Notes Feature

## Overview
Added a comprehensive todo list with advanced features and a placeholder for notes section.

## Files Created
- `src/managers/todo-manager.ts` - Todo management logic
- `src/types/index.ts` - Added TodoItem, RepeatInterval, TodoFilter types
- `public/styles/todo.css` - Todo list styling
- `public/styles/notes.css` - Notes placeholder styling

## Files Modified
- `src/app.ts` - Integrated todo functionality
- `public/index.html` - Added todo/notes sections
- `public/styles.css` - Imported new CSS files

## Features

### Todo List (Left Panel)
- **Add Todos**: Text input with optional due date and repeat settings
- **Smart Filters**: Today, Upcoming, Completed tabs
- **Repeat Options**: Daily, Weekly, Monthly, Custom intervals
- **Auto-regeneration**: Recurring todos create new instances when completed
- **Date Badges**: Color-coded (Overdue=red, Today=yellow, Upcoming=blue)
- **Statistics**: Live counters for today/upcoming/completed tasks
- **Bulk Actions**: Clear all completed tasks button (shown only on Completed tab)
- **Options Dropdown**: Beautiful dropdown for date and repeat settings
- **Persistent Storage**: Chrome local storage

### Notes (Right Panel)
- Placeholder section ("Coming Soon")
- Matches todo panel styling
- Ready for future implementation

### Toggle Panels Button
- **Location**: Bottom left (matches settings button on right)
- **Function**: Hide/show todo and notes panels
- **Styling**: Same glassmorphic design as settings button
- **Active State**: Turns blue when panels are hidden

## Key Components

### TodoManager
- `addTodo()` - Create new todo with date/repeat options
- `toggleTodo()` - Mark complete/incomplete, handles repeating logic
- `deleteTodo()` - Remove single todo
- `clearOldCompleted()` - Remove all completed tasks
- `getFilteredTodos()` - Returns todos based on active filter
- `generateNextOccurrence()` - Creates next instance of repeating todo

### UI Layout
```
[Toggle Button]  .......  [Shortcuts Island]  .......  [Settings Button]

         [Todo Panel]                [Notes Panel]
```

## Styling
- Glassmorphic design matching the rest of the app
- Compact sizing (smaller fonts, tight spacing)
- Smooth animations for interactions
- Dark theme optimized dropdowns
- Responsive scrolling for long lists

## Usage
1. Add tasks with the input field
2. Click options button (3 dots) to set date/repeat
3. Switch between Today/Upcoming/Completed filters
4. Click tasks to mark complete
5. Hover over tasks to see delete button
6. Click "Clear All" on Completed tab to remove finished tasks
7. Click toggle button (bottom left) to hide/show panels
