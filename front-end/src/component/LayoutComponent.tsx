import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, message, Modal, Form, Input, Button } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { HomeOutlined, FileAddOutlined, FormOutlined, TagsOutlined, CheckOutlined, InfoCircleOutlined, ShareAltOutlined, HeartOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable'; // 导入Resizable组件
import { useSelector, useDispatch } from 'react-redux';
import { selectUsername, logout } from '../store/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

import TagComponent from './TagComponent'; // 导入 TagComponent
import { fetchTags, selectTags } from '../store/tagsSlice'; // 导入 fetchTags action creator
import { selectToken } from '../store/authSlice';
import Chatbot from './Chatbot';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

interface MenuItem {
    key: string;
    label: string;
    icon?: JSX.Element;
    path?: string;
    dropdown?: MenuItem[];
}

interface LayoutComponentProps {
    children?: React.ReactNode;
    username?: string;
}

const ResizableSider = (props: any) => (
    <Resizable width={200} height={Infinity} handle={<div style={{ width: '5px', background: '#ddd', cursor: 'col-resize' }} />} minConstraints={[100, Infinity]} maxConstraints={[400, Infinity]}>
        <Sider {...props} />
    </Resizable>
);

const LayoutComponent: React.FC<LayoutComponentProps> = ({ children }) => {
    const dispatch = useDispatch();
    const username = useSelector(selectUsername);
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [createTagVisible, setCreateTagVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const token = useSelector(selectToken);
    const tags = useSelector(selectTags); // 选择标签数据

    // Fetch tags on component mount
    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    const handleMenuItemClick = (path: string) => {
        navigate(path);
    };

    const items1: MenuItem[] = [
        { key: 'home', label: 'Home', path: '/', icon: <HomeOutlined /> },
        {
            key: 'create', label: 'Create', icon: <FileAddOutlined />, dropdown: [
                { key: 'newNote', label: 'New note', path: '/createnotes' },
                { key: 'newTodoList', label: 'New todolist', path: '/createtodolist' }
            ]
        },
        { key: 'PublicNotes', label: 'PublicNotes', path: '/PublicNotes', icon: <ShareAltOutlined /> },
        { key: 'mynotes', label: 'My Notes', path: '/mynotes', icon: <FormOutlined /> },
        { key: 'mylists', label: 'My Lists', path: '/mylists', icon: <CheckOutlined /> },
        { key: 'notetemplate', label: 'notetemplate', path: '/notetemplate', icon: <InfoCircleOutlined /> },
        { key: 'Favorite', label: 'Favorite', path: '/favoritespage', icon: <HeartOutlined /> },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const menuItem = items1.find(item => item.path === currentPath);
        if (menuItem) {
            setSelectedKey(menuItem.key);
        }
    }, [location.pathname, items1]);

    const renderMenu = () => (
        <Menu>
            <Menu.Item key="1" onClick={() => handleMenuItemClick('/personalinformation')}>
                Personal Information
            </Menu.Item>
            <Menu.Item key="2" onClick={() => handleMenuItemClick('/feedback')}>Feedback</Menu.Item>
            <Menu.Item key="3" onClick={handleLogout}>Log out</Menu.Item>
        </Menu>
    );

    const handleLogout = () => {
        dispatch(logout());
        message.success('Logged out successfully');
    };

    const handleCreateTag = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.message);
                setCreateTagVisible(false);
                dispatch(fetchTags()); // Re-fetch tags
            } else {
                throw new Error('Failed to create tag');
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to create tag');
        }
    };

    const handleNavigate = (path?: string) => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <Layout>
            <ResizableSider width={200} style={{ background: '#fff', position: 'relative' }}>
                <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)', position: 'absolute', top: '0', left: '0', right: '0' }} />
                <div style={{ textAlign: 'center', marginTop: '0px' }}>
                    <img src="/icons8-note-100.png" alt="note icon" style={{ width: '62px', height: '62px' }} />
                </div>
                <Menu mode="inline" selectedKeys={[selectedKey]} defaultOpenKeys={['sub1']} style={{ height: '100%', borderRight: 0, marginTop: '0px' }}>
                    {items1.map(item => (
                        item.dropdown ? (
                            <SubMenu key={item.key} icon={item.icon} title={item.label}>
                                {item.dropdown.map(subItem => (
                                    typeof subItem.path === 'string' && (
                                        <Menu.Item key={subItem.key} onClick={() => subItem.path && handleMenuItemClick(subItem.path)}>{subItem.label}</Menu.Item>
                                    )
                                ))}
                            </SubMenu>
                        ) : (
                            <Menu.Item key={item.key} onClick={() => handleNavigate(item.path)} icon={item.icon}>
                                <span>{item.label}</span>
                            </Menu.Item>
                        )
                    ))}
                    <SubMenu key="sub2" icon={<TagsOutlined />} title="Tags">
                        <Menu.Item key="createTag" onClick={() => setCreateTagVisible(true)}>
                            <PlusOutlined /> Create Tag
                        </Menu.Item>
                        <TagComponent tags={tags} /> {/* 传递标签数据给 TagComponent */}
                    </SubMenu>
                </Menu>
            </ResizableSider>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white' }}>
                    <div style={{ flex: 1 }} />
                    <div style={{ color: '#000', flex: 2.5 }}>Welcome to the notekeeping website</div>
                    <div style={{ color: '#000' }}>
                        {username && (
                            <Dropdown overlay={renderMenu} trigger={['click']}>
                                <span style={{ cursor: 'pointer', color: '#000' }}>
                                    Welcome, {username} <DownOutlined />
                                </span>
                            </Dropdown>
                        )}
                    </div>
                </Header>
                <Content style={{ padding: '0 24px 24px' }}>
                    <div style={{ padding: 24 }}>
                        {/* Your content here */}
                        {children}
                    </div>
                </Content>
                {/* Create Tag Modal */}
                <Modal
                    title="Create Tag"
                    visible={createTagVisible}
                    onCancel={() => setCreateTagVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setCreateTagVisible(false)}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleCreateTag}>
                            Create
                        </Button>
                    ]}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ modifier: 'public' }}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please input the title!' }]}
                        >
                            <Input onChange={(e) => setTitle(e.target.value)} />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea onChange={(e) => setDescription(e.target.value)} />
                        </Form.Item>
                    </Form>
                </Modal>
                {/* Chatbot 放置在页面右下角 */}
                <Chatbot />
            </Layout>
        </Layout>
    );
};

export default LayoutComponent;
