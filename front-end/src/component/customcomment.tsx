import React from 'react';
import { Typography, Form, Button, Input } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

interface CustomCommentProps {
  author: string;
  content: string | React.ReactNode;
  datetime: string;
  children?: React.ReactNode;
  onEdit?: () => void; // 添加 onEdit 回调函数
  onDelete?: () => void; // 添加 onDelete 回调函数
}

const CustomComment: React.FC<CustomCommentProps> = ({ author, content, datetime, onEdit, onDelete, children }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Text strong style={{ marginLeft: '8px' }}>{author}</Text>
        <Text type="secondary" style={{ marginLeft: 'auto' }}>{datetime}</Text>
      </div>
      <div style={{ marginLeft: '40px' }}>
        {content}
      </div>
      <div style={{ marginTop: '8px' }}>
        {/* 添加编辑和删除评论的按钮 */}
        {onEdit && <Button type="text" onClick={onEdit}>Edit</Button>}
        {onDelete && <Button type="text" onClick={onDelete}>Delete</Button>}
      </div>
      {children}
    </div>
  );
};

export default CustomComment;
