import React, { useState, useEffect } from 'react';
import { message, Button, Input, Checkbox, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { useParams, useNavigate } from 'react-router-dom';

interface Todo {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    todos: { _id: string; content: string; completed: boolean }[];
}

const ShowTodo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [todo, setTodo] = useState<Todo | null>(null);
    const [updatedTodos, setUpdatedTodos] = useState<{ _id: string; content: string; completed: boolean }[]>([]);
    const [editableTitle, setEditableTitle] = useState(false);
    const [newTodoText, setNewTodoText] = useState<string>(''); 
    const token = useSelector(selectToken);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTodo();
    }, []);

    const fetchTodo = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTodo(data.todo);
            setUpdatedTodos(data.todo.todos.map((todo: { _id: string; content: string; completed: boolean }) => ({
                _id: todo._id,
                content: todo.content,
                completed: todo.completed
            })));
        } catch (error) {
            console.error('Failed to fetch todo:', error);
            message.error('Failed to fetch todo');
        }
    };

    const handleCheckboxChange = (index: number) => {
        const updatedTodoList = [...updatedTodos];
        updatedTodoList[index].completed = !updatedTodoList[index].completed;
        setUpdatedTodos(updatedTodoList);
    };

    const handleContentChange = (index: number, content: string) => {
        const updatedTodoList = [...updatedTodos];
        updatedTodoList[index].content = content;
        setUpdatedTodos(updatedTodoList);
    };

    const handleTitleChange = (title: string) => {
        if (editableTitle) {
            setTodo(prevTodo => {
                if (prevTodo) {
                    return {
                        ...prevTodo,
                        title
                    };
                }
                return null;
            });
        }
    };

    const handleSaveAndBack = async () => {
        try {
            const updatedTodoData = {
                title: todo?.title,
                todos: updatedTodos.map(todo => ({
                    _id: todo._id,
                    content: todo.content,
                    completed: todo.completed
                }))
            };

            const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedTodoData)
            });

            if (response.ok) {
                message.success('Todos updated successfully');
                navigate('/mylists');
            } else {
                throw new Error('Failed to update todos');
            }
        } catch (error) {
            console.error('Failed to update todos:', error);
            message.error('Failed to update todos');
        }
    };

    const handleAddTodo = () => {
        if (newTodoText.trim() !== '') {
            const newTodo = {
                _id: '', // 由后端生成
                content: newTodoText,
                completed: false
            };
            setUpdatedTodos(prevTodos => [...prevTodos, newTodo]);
            setNewTodoText(''); // 清空输入框
        }
    };

    return (
        <LayoutComponent>
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center', cursor: 'pointer', borderBottom: editableTitle ? '1px solid #ccc' : 'none' }} onClick={() => setEditableTitle(true)}>{editableTitle ? <Input value={todo?.title} onChange={(e) => handleTitleChange(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%' }} /> : todo?.title}</h2>

                {todo && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Input
                                value={newTodoText}
                                onChange={(e) => setNewTodoText(e.target.value)}
                                placeholder="Enter todo"
                                style={{ marginRight: '8px', width: '60%' }}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTodo}>Add Todo</Button>
                        </div>
                        <Form layout="vertical">
                            {updatedTodos.map((item, index) => (
                                <Form.Item key={index} label="" style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Checkbox checked={item.completed} onChange={() => handleCheckboxChange(index)} />
                                        <Input value={item.content} onChange={(e) => handleContentChange(index, e.target.value)} style={{ marginLeft: '5px', flex: 1, border: 'none', borderBottom: '1px solid #ccc', maxWidth: '75%' }} />
                                    </div>
                                </Form.Item>
                            ))}
                        </Form>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button type="primary" onClick={handleSaveAndBack}>Save and Back</Button>
                </div>

            </div>
        </LayoutComponent>
    );
};

export default ShowTodo;
