import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';

const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const [isError, setIsError] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 在登录成功后，从服务器响应中获取用户的电子邮件地址
    const handleLogin = async (values: any) => {
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);

                // 在调用 login 动作时，传递一个包含 username、token 和 email 属性的对象
                dispatch(login({ username: values.username, token: data.token, email: data.email, userId: data.userId, }));
                setIsLoggedIn(true);
            } else {
                console.error('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };



    const handleCloseErrorModal = () => {
        setIsError(false);
    };

    const handleCloseSuccessModal = () => {
        setIsLoggedIn(false);
        navigate('/main');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Form
                form={form}
                name="login"
                initialValues={{ remember: true }}
                onFinish={handleLogin}
                style={{ maxWidth: 300 }}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Log in
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Link to="/register">
                        <Button type="primary" style={{ width: '100%' }}>Go to Register</Button>
                    </Link>
                </Form.Item>
            </Form>

            <Modal
                title="Login Error"
                open={isError}
                onCancel={handleCloseErrorModal}
                footer={[
                    <Button key="ok" type="primary" onClick={handleCloseErrorModal}>
                        OK
                    </Button>
                ]}
            >
                <p>Invalid username or password. Please try again.</p>
            </Modal>

            <Modal
                title="Login Successful"
                open={isLoggedIn}
                onCancel={handleCloseSuccessModal}
                footer={[
                    <Button key="ok" type="primary" onClick={handleCloseSuccessModal}>
                        OK
                    </Button>
                ]}
            >
                <p>Login successful.</p>
            </Modal>
        </div>
    );
};

export default LoginPage;
