import React, { useState, useEffect } from 'react';
import { Input, Button, message, Select, Modal } from 'antd';
import LayoutComponent from '../components/LayoutComponent';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { Editor } from '@tinymce/tinymce-react';
import '../index.css';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';

interface Tag {
    _id: string;
    title: string;
}

const { Option } = Select;

const CreateNotePage: React.FC<{ username: string }> = ({ username }) => {
    const token = useSelector(selectToken);
    const [content, setContent] = useState<string>('');
    const [image, setImage] = useState<string>(''); // 默认图片的 URL
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [visibility, setVisibility] = useState<string>('private');
    const [showImageInput, setShowImageInput] = useState<boolean>(false);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('Default Title');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    useEffect(() => {
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
        fetchTags();
    }, [token]);

    const handleEditorChange = (content: string, editor: any) => {
        setContent(content);
    };

    const handleSaveNote = async () => {
        if (!token) {
            console.error('Token is missing');
            return;
        }
        let isPublic: boolean;
        if (visibility === 'public') {
            isPublic = true;
        } else {
            isPublic = false;
        }
        const imageToSend = imageUrl || (image ? image : 'https://images.unsplash.com/photo-1710080703554-86dc9a0e9d6e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
        try {
            const response = await fetch('http://localhost:3001/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content, image: imageToSend, tags: selectedTags, isPublic })
            });
            if (response.ok) {
                message.success('Note saved successfully');
                setContent('');
                setImage('');
                setImageUrl('');
                setSelectedTags([]);
            } else {
                message.error('Failed to save note');
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            message.error('Failed to save note');
        }
    };
    const handleTagChange = (selectedValues: string[]) => {
        setSelectedTags(selectedValues);
    };

    const handleVisibilityChange = (value: string) => {
        setVisibility(value === 'public' ? 'public' : 'private');
    };

    const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.value);
    };

    const handleTitleClick = () => {
        setEditingTitle(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setEditingTitle(false);
    };

    const handleImageClick = () => {
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrl(e.target.value);
    };

    const handleUploadImage = () => {
        setImage(imageUrl); // 更新 image 状态，替换默认图片
        setModalVisible(false); // 关闭 Modal
    };
    const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
        const fileList = info.fileList;
        if (fileList.length > 0) {
            const file = fileList[0].originFileObj;
            if (file) {
                setSelectedFile(file);
            }
        }
    };
    const handleUploadAttachment = async () => {
        if (!selectedFile || !token) {
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (response.ok) {
                message.success('Attachment uploaded successfully.');
            } else {
                message.error('Failed to upload attachment.');
            }
        } catch (error) {
            console.error('Failed to upload attachment:', error);
            message.error('Failed to upload attachment.');
        }
    };

    return (
        <LayoutComponent>
            <div className="note-container">
                <div onClick={handleImageClick}>
                    {image && (
                        <img src={image} alt="Banner Image" className="banner-image" />
                    )}
                    {!image && (
                        <div className="default-banner">
                            <img src="https://images.unsplash.com/photo-1710080703554-86dc9a0e9d6e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Default Banner Image" />
                        </div>
                    )}
                </div>
                {showImageInput && (
                    <Input
                        placeholder="Enter Image URL"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        className="image-input"
                    />
                )}
                <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-end', marginBottom: '10px', marginRight: '10px' }}>
                    {editingTitle ? (
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            className="title-input"
                        />
                    ) : (
                        <div className="title" onClick={handleTitleClick}>{title}</div>
                    )}
                    <div style={{ marginLeft: '10px' }}>
                        <Select
                            mode="multiple"
                            placeholder="Select tags"
                            value={selectedTags}
                            onChange={handleTagChange}
                            className="tags-select"
                            style={{ width: '150px' }}
                        >
                            {tags.map((tag: Tag) => (
                                <Option key={tag._id} value={tag._id}>
                                    {tag.title}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                        <Select
                            defaultValue="private"
                            onChange={handleVisibilityChange}
                            className="visibility-select"
                            style={{ width: '100px' }}
                        >
                            <Option value="public">Public</Option>
                            <Option value="private">Private</Option>
                        </Select>
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                        <Upload onChange={handleFileChange}>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </div>
                </div>

                <div className="editor-wrapper" >
                    <Editor
                        apiKey='gja64jeos72ivs0qbvao7ygeuzrpaj8qq6ew5q3m1o5631bo'
                        init={{
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            autosave_disabled: true,
                            auto_correct: false,
                            height: 500,
                            menubar: false
                        }}
                        onEditorChange={handleEditorChange}
                    />
                </div>
                <Button type="primary" onClick={() => { handleSaveNote(); handleUploadAttachment(); }} className="save-button" style={{ width: '100%' }}>
                    Save Note
                </Button>

            </div>
            <Modal
                title="Upload Image"
                visible={modalVisible}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="upload" type="primary" onClick={handleUploadImage}>
                        Upload
                    </Button>,
                ]}
            >
                <Input
                    placeholder="Enter Image URL"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                />

            </Modal>
        </LayoutComponent >
    );
};

export default CreateNotePage;
