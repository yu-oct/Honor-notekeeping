
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import noteReducer from './noteSlice'; // 导入处理笔记状态的 reducer
import todoReducer from './todoSlice';
import tagReducer from './tagsSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        note: noteReducer,
        todos: todoReducer,
        tags:tagReducer,

    },
});

export default store;
