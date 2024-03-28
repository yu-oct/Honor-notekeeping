import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import LayoutComponent from './components/LayoutComponent';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from './store/authSlice';

interface TodoDetailsProps {
    title: string;
    content: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

const TodoDetailsPage: React.FC = () => {
    const { todoId } = useParams<{ todoId: string }>();
    const token = useSelector(selectToken); // 获取 Redux store 中的 token
    const [todo, setTodo] = useState<Partial<TodoDetailsProps> | null>(null);

    useEffect(() => {
        fetchTodoDetails();
    }, []);

    const fetchTodoDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/todos/${todoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Received todo data:', data);
            setTodo(data.todo);
            console.log('Current todo:', todo);
            // 打印每个 todo 对象的 content 字段
            data.todo.todos.forEach((todo: Partial<TodoDetailsProps>) => {
                console.log('Content:', todo.content);
            });

        } catch (error) {
            console.error('Failed to fetch todo details:', error);
            message.error('Failed to fetch todo details');
        }
    };


    console.log('Current todo:', todo); // 调试语句：打印当前 todo 状态

    return (
        <LayoutComponent>
            <div>
                <h2>Todo Details</h2>
                {todo ? (
                    <div>
                        <p>Title: {todo.title}</p>
                        <p>Content: {todo.content}</p>
                        <p>Completed: {todo.completed ? 'Yes' : 'No'}</p>
                        <p>Created At: {todo.createdAt}</p>
                        <p>Last Updated At: {todo.updatedAt}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        </LayoutComponent>
    );
};

export default TodoDetailsPage;
