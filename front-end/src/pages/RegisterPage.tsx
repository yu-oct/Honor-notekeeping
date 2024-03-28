import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [isError, setIsError] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const handleSendVerificationCode = async () => {
        try {
            const values = form.getFieldsValue(['email']);
            const response = await fetch('http://localhost:3001/api/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: values.email }),
            });

            if (response.ok) {
                console.log('Verification code sent successfully');
            } else {
                console.error('Failed to send verification code');
            }
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleRegister = async (values: any) => {
        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json(); // 解析响应数据

            if (response.ok) {
                console.log('Registration successful');
                setIsRegistered(true);
            } else {
                console.error('Registration failed');
                setIsError(true);
                // 显示后端返回的错误信息
                if (data && data.message) {
                    // 判断是用户名已存在还是邮箱已存在
                    if (data.message.includes('Username')) {
                        form.setFields([{ name: 'username', errors: [data.message] }]);
                    } else if (data.message.includes('Email')) {
                        form.setFields([{ name: 'email', errors: [data.message] }]);
                    }
                }
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const handleCloseErrorModal = () => {
        setIsError(false);
    };

    const handleCloseSuccessModal = () => {
        setIsRegistered(false);
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Form
                form={form}
                name="register"
                initialValues={{ remember: true }}
                onFinish={handleRegister}
                style={{ maxWidth: 300 }}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' }
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleSendVerificationCode} style={{ width: '100%' }}>
                        Send Verification Code
                    </Button>
                </Form.Item>
                <Form.Item
                    name="verificationCode"
                    rules={[{ required: true, message: 'Please input verification code!' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Verification Code" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Register
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Link to="/login">
                        <Button type="primary" style={{ width: '100%' }}>
                            Go to Login
                        </Button>
                    </Link>
                </Form.Item>
            </Form>

            <Modal
                title="Registration Error"
                visible={isError}
                onCancel={handleCloseErrorModal}
                footer={[
                    <Button key="ok" type="primary" onClick={handleCloseErrorModal}>
                        OK
                    </Button>
                ]}
            >
                <p>Registration failed. Please try again.</p>
            </Modal>

            <Modal
                title="Registration Successful"
                visible={isRegistered}
                onCancel={handleCloseSuccessModal}
                footer={[
                    <Button key="ok" type="primary" onClick={handleCloseSuccessModal}>
                        Go to Login
                    </Button>
                ]}
            >
                <p>Registration successful.</p>
            </Modal>
        </div>
    );
};

export default RegisterPage;
