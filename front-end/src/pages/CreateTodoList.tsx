import React, { useState } from 'react';
import { Input, Button, Form, Checkbox, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import LayoutComponent from '../components/LayoutComponent';

const CreateToDoListPage: React.FC = () => {
    const token = useSelector(selectToken);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [todos, setTodos] = useState<{ content: string; completed: boolean }[]>([]);

    const handleAddTodo = () => {
        form.validateFields(['todoText']).then(values => {
            const { todoText } = values;
            setTodos(prevTodos => [...prevTodos, { content: todoText, completed: false }]);
            form.setFieldsValue({ todoText: '' }); // 清空输入框
        });
    };

    const handleCreateList = async () => {
        form.validateFields().then(async values => {
            const { listName } = values;
            if (listName.trim() !== '' && todos.length > 0 && token) {
                const newList = {
                    title: listName,
                    todos: todos,
                };
                try {
                    const response = await fetch('http://localhost:3001/api/todos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(newList),
                    });

                    if (response.ok) {
                        setTodos([]);
                        form.resetFields(); // 重置表单
                        message.success('List created successfully');
                    } else {
                        message.error('Failed to create list');
                    }
                } catch (error) {
                    console.error('Error creating list:', error);
                    message.error('Error creating list');
                }
            } else {
                message.error('Please fill all fields');
            }
        });
    };

    const handleTodoChange = (index: number, checked: boolean) => {
        setTodos(prevTodos => {
            const newTodos = [...prevTodos];
            newTodos[index].completed = checked;
            return newTodos;
        });
    };

    return (
        <LayoutComponent>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create New ToDoList</h2>
                <Form layout="vertical" form={form}>
                    <Form.Item label="List Name" name="listName" rules={[{ required: true, message: 'Please input list name' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Add Todo" style={{ marginBottom: '8px' }}>
                        <Form.Item name="todoText" noStyle>
                            <Input placeholder="Enter todo" style={{ marginRight: '8px', width: '60%' }} />
                        </Form.Item>
                        <Button type="primary" onClick={handleAddTodo}>Add</Button>
                    </Form.Item>
                    <Form.Item label="Todos">
                        {todos.map((todo, index) => (
                            <div key={index} style={{ marginBottom: '8px' }}>
                                <Checkbox
                                    checked={todo.completed}
                                    onChange={(e) => handleTodoChange(index, e.target.checked)}
                                >
                                    {todo.content}
                                </Checkbox>
                            </div>
                        ))}
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'center' }}>
                        <Button type="primary" onClick={handleCreateList}>Save</Button>
                    </Form.Item>
                </Form>
            </div>
        </LayoutComponent>
    );
};

export default CreateToDoListPage;
