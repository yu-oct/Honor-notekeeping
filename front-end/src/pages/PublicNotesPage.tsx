import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { Card, Row, Col, Typography, Modal } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import LayoutComponent from '../components/LayoutComponent';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Note {
    _id: string;
    title: string;
    content: string;
    userId?: {
        username: string;
    };
}

const removeHtmlTags = (htmlString: string): string => {
    return htmlString.replace(/<[^>]*>?/gm, '');
};

const PublicNotesPage: React.FC = () => {
    const token = useSelector(selectToken);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null); // 存储选中的笔记内容
    const navigate = useNavigate(); // 获取 navigate 方法

    useEffect(() => {
        const fetchPublicNotes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/public', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data.notes);
                } else {
                    console.error('Failed to fetch public notes');
                }
            } catch (error) {
                console.error('Failed to fetch public notes:', error);
            }
        };

        fetchPublicNotes();
    }, [token]);

    const handleNoteClick = (note: Note) => {
        setSelectedNote(note);
        navigate(`/viewpublicnotes/${note._id}`); // 使用 navigate 方法跳转到 ViewPublicNotesPage 页面并传递 noteId
    };

    const handleCloseModal = () => {
        setSelectedNote(null);
    };

    return (
        <LayoutComponent>
            
            <Row gutter={[16, 16]}>
                {notes.map(note => (
                    <Col key={note._id} xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Card
                            title={<Title level={4}>{note.title}</Title>}
                            extra={
                                <div>
                                    <FileTextOutlined onClick={() => handleNoteClick(note)} />
                                    <span style={{ marginLeft: '0.5rem' }}>{note.userId?.username}</span>
                                </div>
                            }
                        >
                            <Text>{removeHtmlTags(note.content).substring(0, 50)}...</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal
                title={selectedNote?.title}
                visible={selectedNote !== null}
                onCancel={handleCloseModal}
                footer={null}
            >
                <Text>{selectedNote?.content}</Text>
            </Modal>
        </LayoutComponent>
    );
};

export default PublicNotesPage;
