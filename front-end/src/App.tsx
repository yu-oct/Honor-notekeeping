import React from 'react';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from './store/reducers';
import { selectUsername } from './store/authSlice';
import axios from 'axios';
const { Content } = Layout;
axios.defaults.baseURL = 'http://localhost:3001';
const App: React.FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const username = useSelector(selectUsername);

  return (
    <Layout>

      {isLoggedIn && (
        <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
          {/* 在用户登录时显示的内容 */}

        </Content>
      )}
    </Layout>
  );
};

export default App;
