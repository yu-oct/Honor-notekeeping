import React, { useState, useEffect } from 'react';
import { message, List, Button, Space, Modal, Select, Input, Spin } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { Link } from 'react-router-dom';

const { Option } = Select;

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    lastModifiedAt: string;
    userId: string;
    tagId: string;
    reviewed: boolean;
}

interface Tag {
    _id: string;
    title: string;
}

const MyNotes: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const token = useSelector(selectToken);
    useEffect(() => {
        fetchTags();
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:3001/api/notes';
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setNotes(data.notes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            message.error('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/tags', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTags(data.tags);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
            message.error('Failed to fetch tags');
        }
    };

    const handleShowPreview = (note: Note) => {
        setSelectedNote(note);
        setIsModalVisible(true);
    };

    const handleDeleteNote = async (note: Note) => {
        try {
            const response = await fetch(`http://localhost:3001/api/notes/${note._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedNotes = notes.filter(n => n._id !== note._id);
                setNotes(updatedNotes);
                message.success('Note deleted successfully');
            } else {
                message.error('Failed to delete note');
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
            message.error('Failed to delete note');
        }
    };

    const handleTagSelect = async (tagId: string | null) => {
        setSelectedTag(tagId);
        try {
            let tagQueryParam = tagId !== null ? tagId : 'null'; // 处理标签值
            const response = await fetch(`http://localhost:3001/${tagQueryParam}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setNotes(data.notes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            message.error('Failed to fetch notes');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/search?query=${searchKeyword}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setNotes(data.notes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            message.error('Failed to fetch notes');
        }
    };

    const handleViewAll = () => {
        setSelectedTag(null);
        setSearchKeyword('');
        fetchNotes(); // 显示所有笔记
    };

    const handleChangeReviewStatus = async (note: Note) => {
        try {
            const response = await fetch(`http://localhost:3001/api/notes/${note._id}/reviewed`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewed: !note.reviewed }) // 将当前复习状态取反
            });

            if (response.ok) {
                // 更新本地笔记列表中相应笔记的复习状态
                const updatedNotes = notes.map(n => {
                    if (n._id === note._id) {
                        return { ...n, reviewed: !note.reviewed };
                    }
                    return n;
                });
                setNotes(updatedNotes);
                message.success('Review status updated successfully');
            } else {
                message.error('Failed to update review status');
            }
        } catch (error) {
            console.error('Failed to update review status:', error);
            message.error('Failed to update review status');
        }
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
                    <Button onClick={handleViewAll} style={{ marginLeft: '10px' }}>View all notes</Button>

                    <Select
                    placeholder="Select a tag"
                    style={{ width: 200, marginLeft: '10px' }}
                    onChange={handleTagSelect}
                    value={selectedTag}
                >
                    <Option value={null}>No Tag</Option>
                    {tags && tags.length > 0 && (
                        tags.map(tag => (
                            <Option key={tag._id} value={tag._id}>{tag.title}</Option>
                        ))
                    )}
                </Select>
                </div>

                

                {loading ? (
                    <Spin />
                ) : (
                    <List
                        bordered
                        dataSource={notes}
                        renderItem={note => (
                            <List.Item
                                actions={[
                                    <Space>
                                        <Button onClick={() => handleShowPreview(note)}>Show Preview</Button>
                                        <Button>
                                            <Link to={`/shownote/${note._id}`}>Show All</Link>
                                        </Button>
                                        <Button>
                                            <Link to={`/edit/${note._id}?token=${token}`}>Edit</Link>
                                        </Button>
                                        <Button onClick={() => handleDeleteNote(note)}>Delete</Button>
                                        {/* 添加复习状态选择框 */}
                                        <Select
                                            value={note.reviewed ? 'Reviewed' : 'Unreviewed'}
                                            style={{ width: 120 }}
                                            onChange={() => handleChangeReviewStatus(note)}
                                        >
                                            <Option value="Reviewed">Reviewed</Option>
                                            <Option value="Unreviewed">Unreviewed</Option>
                                        </Select>
                                    </Space>
                                ]}
                            >
                                <div>Title: {note.title}</div>
                            </List.Item>
                        )}
                    />
                )}

            </div>

            <Modal
                title="Note Preview"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>
                ]}
            >
                {selectedNote && (
                    <div>
                        <h2>{selectedNote.title}</h2>
                        <p>{selectedNote.content}</p>
                    </div>
                )}
            </Modal>
        </LayoutComponent>
    );
};

export default MyNotes;
