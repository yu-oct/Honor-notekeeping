
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import noteReducer from './noteSlice';
import todoReducer from './todoSlice'; 
import tagReducer from './tagsSlice';
const rootReducer = combineReducers({
    auth: authReducer,
    note: noteReducer, 
    todos: todoReducer, 
    tags:tagReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
