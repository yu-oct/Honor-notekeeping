import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Button, Input, Card, message } from 'antd';
import { selectUsername, selectEmail, login, logout } from '../store/authSlice'; // 假设您的 authSlice 中包含 selectEmail
import LayoutComponent from '../components/LayoutComponent';
import { LockOutlined, LogoutOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;

const PersonalInformation: React.FC = () => {
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail); // 获取用户的电子邮件地址
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleEdit = () => {
        setEditing(true);
        setOldPassword('');
        setNewPassword('');
        setVerificationCode('');
        setOldPasswordError(false);
    };

    const handleCancelEdit = () => {
        setEditing(false);
    };

    const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOldPassword(e.target.value);
        setOldPasswordError(false);
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerificationCode(e.target.value);
    };

    const handleSendVerificationCode = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // 使用 Redux Store 中的电子邮件地址
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

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.put('http://localhost:3001/api/update-user', {
                oldPassword,
                newPassword,
                verificationCode,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                // 清除本地存储的 token，表示用户注销
                localStorage.removeItem('token');
                // 注销用户，重定向到登录页面
                dispatch(logout());
                message.success('Password updated successfully. Please log in again.');
                navigate('/login');
            } else {
                console.error('Failed to update user information');
            }
        } catch (error: any) {
            console.error('Error updating user information:', error);
            if (error.response && error.response.status === 401) {
                setOldPasswordError(true);
            }
        }
    };

    return (
        <LayoutComponent>
            <Content style={{ padding: '24px' }}>
                <Card title="Personal Information">
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ marginRight: '8px' }}>Username:</label>
                        <div>{username}</div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ marginRight: '8px' }}>Email:</label> {/* 显示用户的电子邮件地址 */}
                        <div>{email}</div>
                    </div>
                    {editing && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ marginRight: '8px' }}>Old Password:</label>
                            <Input
                                type="password"
                                style={{ width: '200px', marginRight: '8px' }}
                                value={oldPassword}
                                onChange={handleOldPasswordChange}
                            />
                            {oldPasswordError && (
                                <span style={{ color: 'red' }}>Incorrect old password</span>
                            )}
                        </div>
                    )}
                    {editing && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ marginRight: '8px' }}>New Password:</label>
                            <Input
                                type="password"
                                style={{ width: '200px', marginRight: '8px' }}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                            />
                        </div>
                    )}
                    {/* 添加验证码输入字段 */}
                    {editing && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ marginRight: '8px' }}>Verification Code:</label>
                            <Input
                                style={{ width: '200px', marginRight: '8px' }}
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                            />
                            <Button onClick={handleSendVerificationCode}>Send Verification Code</Button>
                        </div>
                    )}
                    {!editing ? (
                        <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>Edit</Button>
                    ) : (
                        <>
                            <Button type="primary" onClick={handleUpdate}>Update</Button>
                            <Button style={{ marginLeft: '8px' }} onClick={handleCancelEdit}>Cancel</Button>
                        </>
                    )}
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginLeft: '8px' }}>Logout</Button>
                </Card>
            </Content>
        </LayoutComponent>
    );
};

export default PersonalInformation;
