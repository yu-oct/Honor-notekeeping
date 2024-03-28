import React, { useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';

const Chatbot: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
    const [messageInput, setMessageInput] = useState('');

    const handleOpenChatbot = () => {
        setVisible(true);
    };

    const handleCloseChatbot = () => {
        setVisible(false);
        setMessages([]); // 关闭对话框时清空消息
    };

    const handleMessageSubmit = async () => {
        // 用户发送消息
        setMessages(prevMessages => [...prevMessages, { text: messageInput, sender: 'user' }]);
        setMessageInput(''); // 清空输入框

        try {
            // 发送消息给后端
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: messageInput })
            });

            if (!response.ok) {
                throw new Error('Failed to send message to server');
            }

            // 接收并解析后端返回的消息
            const data = await response.json();
            const botResponse = data.reply;

            // 显示后端返回的消息
            setMessages(prevMessages => [...prevMessages, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Failed to send message to server:', error);
        }
    };

    const handleEndChat = () => {
        setVisible(false);
        setMessages([]); // 清空消息
    };

    const chatbotDialog = (
        <Modal
            title="Chatbot"
            visible={visible}
            onCancel={handleCloseChatbot}
            footer={null}
            style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1001 }}
            maskClosable={false} // 设置点击遮罩不关闭对话框
            destroyOnClose // 对话框关闭时销毁内容
        >
            {messages.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
                    <span style={{ background: msg.sender === 'user' ? '#e6f7ff' : '#f0f0f0', padding: '5px 10px', borderRadius: msg.sender === 'user' ? '10px 0 10px 10px' : '0 10px 10px 10px' }}>{msg.text}</span>
                </div>
            ))}
            <div style={{ padding: '10px', borderTop: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={handleMessageSubmit}
                    placeholder="请输入您的问题"
                    autoFocus
                />
                <Button type="primary" onClick={handleMessageSubmit}>发送</Button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Button type="primary" onClick={handleEndChat}>结束对话</Button>
            </div>
        </Modal>
    );

    return (
        <>
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <Button type="primary" shape="circle" icon={<MessageOutlined />} onClick={handleOpenChatbot} />
            </div>
            {ReactDOM.createPortal(chatbotDialog, document.body)}
        </>
    );
};

export default Chatbot;
