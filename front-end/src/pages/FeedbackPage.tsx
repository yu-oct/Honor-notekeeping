import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux'; // 导入 useSelector 钩子
import axios from 'axios'; // 导入 axios 库

const FeedbackPage: React.FC = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const loggedInUsername = useSelector((state: any) => state.auth.username); // 获取登录用户的用户名

    const handleFeedbackSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            // 将登录用户的用户名添加到反馈数据中
            const feedbackData = {
                ...values,
                name: loggedInUsername // 使用登录用户的用户名作为反馈者姓名
            };

            // 发送 POST 请求到后端
            const response = await axios.post('http://localhost:3001/api/feedback', feedbackData);

            if (response.data.success) {
                message.success('Feedback submitted successfully');
                form.resetFields();
            } else {
                message.error('Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            message.error('Error submitting feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <LayoutComponent>
            <div style={{ padding: '20px' }}>
                <h1>Feedback</h1>
                <Form
                    form={form}
                    onFinish={handleFeedbackSubmit}
                    layout="vertical"
                    initialValues={{ message: '' }}
                >
                    <Form.Item
                        label="Feedback Message"
                        name="message"
                        rules={[{ required: true, message: 'Please input your feedback message!' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            Submit Feedback
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </LayoutComponent>
    );
};

export default FeedbackPage;
