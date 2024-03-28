import React, { useState } from 'react';
import { message, Modal, Input } from 'antd';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice'; // 导入获取令牌的 selector

interface CreateTagModalProps {
    visible: boolean;
    onCancel: () => void;
    onCreate: (title: string, description: string) => void;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({ visible, onCancel, onCreate }) => {
    const token = useSelector(selectToken); // 使用 useSelector 获取令牌

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleOk = () => {
        // 确保标题和描述都不为空
        if (!title.trim() || !description.trim()) {
            message.error('Title and description are required');
            return;
        }

        // 调用父组件传递的创建函数
        onCreate(title, description);

        // 清空输入框
        setTitle('');
        setDescription('');

        // 关闭模态框
        onCancel();
    };

    return (
        <Modal
            title="Create Tag"
            visible={visible}
            onOk={handleOk}
            onCancel={onCancel}
        >
            <Input
                placeholder="Enter tag title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <Input.TextArea
                placeholder="Enter tag description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginTop: '10px' }}
            />
        </Modal>
    );
};

export default CreateTagModal;
