import React, { useState, useEffect } from 'react';
import { message, List, Button, Modal, Space, Input } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { Link } from 'react-router-dom';

interface Todo {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

const MyList: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const token = useSelector(selectToken);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/todos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTodos(data.todos);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            message.error('Failed to fetch todos');
        }
    };


    const handleDeleteTodo = async (todo: Todo) => {
        try {
            const response = await fetch(`http://localhost:3001/api/todos/${todo._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedTodos = todos.filter(t => t._id !== todo._id);
                setTodos(updatedTodos);
                message.success('Todo deleted successfully');
            } else {
                message.error('Failed to delete todo');
            }
        } catch (error) {
            console.error('Failed to delete todo:', error);
            message.error('Failed to delete todo');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/todo/search?query=${searchKeyword}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTodos(data.todos);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            message.error('Failed to fetch notes');
        }
    };


    const handleViewAll = async () => {
        setSearchKeyword('');
        fetchTodos();
    };

    return (
        <LayoutComponent>
            <div>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <Input
                        placeholder="Enter search title"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ width: '200px', marginRight: '10px' }}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                    <Button onClick={handleViewAll} style={{ marginLeft: '10px' }}>View all todos</Button>
                </div>

                <List
                    bordered
                    dataSource={todos}
                    renderItem={todo => (
                        <List.Item
                            key={todo._id}
                            actions={[
                                <Space>

                                    <Button>
                                        <Link to={`/showtodo/${todo._id}`}>Show Todo</Link>
                                    </Button>

                                    <Button onClick={() => handleDeleteTodo(todo)}>Delete</Button>
                                </Space>
                            ]}
                        >
                            <div>Title: {todo.title}</div>
                        </List.Item>
                    )}
                />
            </div>

            <Modal
                title="Todo Preview"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>
                ]}
            >
                {selectedTodo && (
                    <div>
                        <h2>{selectedTodo.title}</h2>
                        <p>{selectedTodo.content}</p>
                    </div>
                )}
            </Modal>
        </LayoutComponent>
    );
};

export default MyList;
