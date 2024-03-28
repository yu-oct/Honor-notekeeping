import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import Provider from react-redux
import store from './store/store'; // Import the Redux store
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import CreateNotePage from './pages/CreateNotes';
import MyNotes from './pages/MyNotes';
import EditNote from './pages/EditNotes'; // Import the EditNotePage component
import ShowNote from './pages/ShowNote';
import { useSelector } from 'react-redux';
import { RootState } from './store/reducers';
import PersonalInformation from './pages/PersonalInformation';
import MyList from './pages/Mylist';
import CreateToDoListPage from './pages/CreateTodoList';
import TodoDetailsPage from './Tododetails';
import TemplatePage from './pages/TemplatePage';
import FeedbackPage from './pages/FeedbackPage';
import Chatbot from './components/Chatbot';
import TinyMCEEditor from './TinyMCEeditor';
import ShowTodo from './pages/ShowToDo';
import PublicNotes from './pages/PublicNotesPage';
import ViewPublicNotesPage from './pages/ViewPublicNotesPage';
import FavoritesPage from './pages/FavoritesPage';
document.addEventListener('DOMContentLoaded', function () {
  const rootContainer = document.getElementById('root');
  if (rootContainer) {
    const root = createRoot(rootContainer);
    root.render(
      <Provider store={store}> {/* Provide the Redux store */}
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/createnotes" element={<CreateNoteRoute />} /> 
            <Route path="/mynotes" element={<MyNotes />} />
            <Route path="/edit/:id" element={<EditNote />} />
            <Route path="/shownote/:noteId" element={<ShowNoteRoute />} /> 
            <Route path="/personalinformation" element={<PersonalInformation />} />
            <Route path="/mylists" element={<MyList />} />
            <Route path="/createtodolist" element={<CreateToDoListPage />} />
            <Route
              path="/tododetails/:todoId"
              element={<TodoDetailsPage />}
            />
            <Route path="/notetemplate" element={<TemplatePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/Chatbot" element={<Chatbot />} />
            <Route path="/tinymce" element={<TinyMCEEditor />} />
            <Route path="/showtodo/:id" element={<ShowTodo />} />
            <Route path="/PublicNotes" element={<PublicNotes />} />
            <Route path="/viewpublicnotes/:noteId" element={<ViewPublicNotesPage />} />
            <Route path="/favoritespage" element={<FavoritesPage />} />
          </Routes>
        </Router>
      </Provider>
    );
  } else {
    console.error('Root container not found');
  }
});

// 创建一个专门用于传递 username 给 CreateNotePage 的 Route 组件
const CreateNoteRoute = () => {
  const username = useSelector((state: RootState) => state.auth.username);
  const token = useSelector((state: RootState) => state.auth.token);
  return <CreateNotePage username={username} />;
};

// 创建一个专门用于传递 noteId 给 ShowNote 的 Route 组件
const ShowNoteRoute = () => {
  const { noteId } = useParams<{ noteId: string }>(); // 使用 useParams 钩子获取 noteId
  if (!noteId) {
    // 处理 noteId 为 undefined 的情况
    return <div>Note ID not found</div>; // 也可以返回其他内容，如加载中的提示或者错误消息
  }
  return <ShowNote noteId={noteId} />;
};
