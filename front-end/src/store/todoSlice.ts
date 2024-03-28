import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './reducers';

interface Todo {
    id: string;
    title: string;
    completed: boolean;
}

interface TodoState {
    todos: Todo[];
}

const initialState: TodoState = {
    todos: [],
};

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        updateTodos(state, action: PayloadAction<Todo[]>) {
            state.todos = action.payload;
        },
        addTodo(state, action: PayloadAction<Todo>) {
            state.todos.push(action.payload);
        },
        toggleTodo(state, action: PayloadAction<string>) {
            const todoId = action.payload;
            const todo = state.todos.find(todo => todo.id === todoId);
            if (todo) {
                todo.completed = !todo.completed;
            }
        },
        removeTodo(state, action: PayloadAction<string>) {
            const todoId = action.payload;
            state.todos = state.todos.filter(todo => todo.id !== todoId);
        },
    },
});

export const { updateTodos, addTodo, toggleTodo, removeTodo } = todoSlice.actions;
export default todoSlice.reducer;
