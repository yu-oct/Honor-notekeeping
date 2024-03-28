import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Input, Modal, Row, Col, List, Checkbox } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    lastModifiedAt: string;
    userId: string;
    tagId: string;
    isPublic: boolean;
    image: string;
    tags: string;
    todos: Todo[];
}

interface Todo {
    _id: string;
    text: string;
    completed: boolean;
}

interface ShowNoteProps {
    noteId: string;
}

const ShowNote: React.FC<ShowNoteProps> = ({ noteId }) => {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newTodoText, setNewTodoText] = useState<string>(''); // 新增的状态用于保存新待办事项的文本
    const token = useSelector(selectToken);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/notes/${noteId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNote(data.note);
                } else {
                    message.error('Failed to fetch note');
                }
            } catch (error) {
                console.error('Failed to fetch note:', error);
                message.error('Failed to fetch note');
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [noteId, token]);

    const handleEditClick = () => {
        navigate(`/edit/${noteId}`);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleAddTodo = () => {
        if (newTodoText.trim() === '') {
            message.error('Please enter a todo item');
            return;
        }

        // 构造新的待办事项对象
        const newTodo: Todo = {
            _id: Math.random().toString(), // 为了简化，这里使用随机生成的字符串作为 ID
            text: newTodoText,
            completed: false
        };

        // 更新当前笔记的待办事项列表
        setNote(prevNote => {
            if (prevNote) {
                return {
                    ...prevNote,
                    todos: [...prevNote.todos, newTodo]
                };
            }
            return prevNote;
        });

        // 清空输入框内容
        setNewTodoText('');
    };

    return (
        <LayoutComponent>
            <div className="note-container">
                {loading ? (
                    <Spin />
                ) : (
                    note && (
                        <>
                            <div className="banner-container">
                                <div onClick={() => setModalVisible(true)}>
                                    <img src={note.image} alt="Banner Image" className="banner-image" />
                                </div>
                                <Modal
                                    title="Banner Image"
                                    visible={modalVisible}
                                    onCancel={handleModalCancel}
                                    footer={null}
                                >
                                    <img src={note.image} alt="Banner Image" style={{ width: '100%' }} />
                                </Modal>
                            </div>
                            <div className="title-input-container">
                                <Input
                                    className="title-input"
                                    value={note.title}
                                    readOnly
                                />
                            </div>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div className="tag-container">
                                        <span className="tag-label">Tag:</span>
                                        <Input
                                            className="tag-input"
                                            value={note.tags}
                                            readOnly
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="visibility-container">
                                        <span className="visibility-label">Visibility:</span>
                                        <Input
                                            className="visibility-input"
                                            value={note.isPublic ? 'Public' : 'Private'}
                                            readOnly
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <div className="editor-wrapper">
                                <Editor
                                    apiKey="gja64jeos72ivs0qbvao7ygeuzrpaj8qq6ew5q3m1o5631bo"
                                    initialValue={note.content}
                                    init={{
                                        height: 300,
                                        menubar: false,
                                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                                        toolbar: ''
                                    }}
                                    disabled
                                />
                            </div>
                            <Button type="primary" onClick={handleEditClick} className="save-button" style={{ width: '100%' }}>
                                Edit Note
                            </Button>
                        </>
                    )
                )}
            </div>
        </LayoutComponent>

    );
};

export default ShowNote;
