import React, { useEffect, useState } from 'react';
import { message, Spin, Button, Input, Select, Modal } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

interface Note {
    _id: string;
    title: string;
    content: string; // Assume content is Markdown format
    createdAt: string;
    lastModifiedAt: string;
    userId: string;
    tags: string;
    isPublic: boolean;
    image: string;
}

const EditNote: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [editedVisibility, setEditedVisibility] = useState<string>('private');
    const [editedTags, setEditedTags] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newImageUrl, setNewImageUrl] = useState<string>('');
    const token = useSelector(selectToken);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNote();
    }, []);

    const fetchNote = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/notes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNote(data.note);
                setEditedVisibility(data.note.isPublic ? 'Public' : 'Private');
                const tagsArray = data.note.tags.split(',').map((tag: string) => tag.trim());
                setEditedTags(tagsArray);
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

    const handleSaveNote = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: note?.title,
                    content: note?.content,
                    isPublic: editedVisibility === 'Public',
                    tags: editedTags.join(','),
                    image: note?.image
                })
            });

            if (response.ok) {
                message.success('Note saved successfully');
            } else {
                message.error('Failed to save note');
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            message.error('Failed to save note');
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = () => {
        setModalVisible(true);
    };

    const handleModalOk = () => {
        setNote(prevNote => prevNote ? { ...prevNote, image: newImageUrl } : null);
        setModalVisible(false);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewImageUrl(e.target.value);
    };

    return (
        <LayoutComponent>
            <div className="note-container">
                {loading ? (
                    <Spin />
                ) : (
                    note && (
                        <div>
                            <div onClick={handleImageClick}>
                                <img src={note.image} alt="Banner Image" className="banner-image" />
                            </div>
                            <div className="title-input-container">
                                <Input
                                    className="title-input"
                                    value={note.title}
                                    onChange={(e) => setNote(prevNote => prevNote ? { ...prevNote, title: e.target.value } : null)}
                                />

                                <div className="form-item">Visibility:
                                    <Select
                                        value={editedVisibility}
                                        onChange={(value) => setEditedVisibility(value)}
                                        style={{ width: '100px' }}
                                    >
                                        <Select.Option value="Public">Public</Select.Option>
                                        <Select.Option value="Private">Private</Select.Option>
                                    </Select>

                                </div>
                                <div className="form-item">Tags: {editedTags.join(', ')}</div>
                            </div>
                            <div className="editor-wrapper">
                                <Editor
                                    apiKey="gja64jeos72ivs0qbvao7ygeuzrpaj8qq6ew5q3m1o5631bo"
                                    initialValue={note.content}
                                    init={{
                                        height: 500,
                                        menubar: false,
                                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat'
                                    }}
                                    onEditorChange={(content) => setNote(prevNote => prevNote ? { ...prevNote, content } : null)}
                                />
                            </div>
                            <p>Created at: {note.createdAt}</p>
                            <p>Last modified at: {note.lastModifiedAt}</p>
                            <Button type="primary" onClick={handleSaveNote}>Save</Button>
                        </div>
                    )
                )}
            </div>
            <Modal
                title="Change Image URL"
                visible={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Input placeholder="Enter new image URL" value={newImageUrl} onChange={handleImageUrlChange} />
            </Modal>
        </LayoutComponent>
    );
};

export default EditNote;
