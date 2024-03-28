import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Tooltip, Modal, message, Input } from 'antd';
import { DownOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectToken } from '../store/authSlice';
import { fetchTags, selectTags, deleteTag, editTag } from '../store/tagsSlice'; // 导入tagsSlice中的Tag类型和相关action creators
import { Tag } from '../store/tagsSlice';

interface TagComponentProps {
    tags: Tag[]; // Define tags prop with Tag type
}

const { TextArea } = Input;

const TagComponent: React.FC<TagComponentProps> = ({ tags }) => {
    const dispatch = useDispatch();
    const token = useSelector(selectToken);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedTag, setEditedTag] = useState<Tag | null>(null); // 指定editedTag的类型为Tag或null
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    const handleDelete = async (tagId: string) => {
        try {
            await dispatch(deleteTag(tagId));
            message.success('Tag deleted successfully');
        } catch (error) {
            console.error('Failed to delete tag:', error);
            message.error('Failed to delete tag');
        }
    };

    const handleViewDescription = (title: string, description: string) => {
        Modal.info({
            title,
            content: description,
        });
    };

    const handleEditTag = (tag: Tag) => {
        setEditedTag(tag); // 将要编辑的标签设置为editedTag
        setEditedTitle(tag.title); // 设置编辑后的标题
        setEditedDescription(tag.description); // 设置编辑后的描述
        setEditModalVisible(true); // 显示编辑模态框
    };

    const handleSaveEdit = async () => {
        try {
            if (!editedTag) return; // 如果没有要编辑的标签，则直接返回

            // 创建一个包含编辑后的标签信息的对象
            const editedTagData: Tag = {
                ...editedTag,
                title: editedTitle,
                description: editedDescription,
            };

            await dispatch(editTag(editedTagData)); // 发送编辑标签的action

            // 清空编辑状态
            setEditedTag(null);
            setEditedTitle('');
            setEditedDescription('');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Failed to edit tag:', error);
            message.error('Failed to edit tag');
        }
    };

    const renderTagMenu = (tag: Tag) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEditTag(tag)}>
                <EditOutlined /> Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDelete(tag._id)}>
                <DeleteOutlined /> Delete
            </Menu.Item>
        </Menu>
    );

    const renderTags = () => {
        return tags.map((tag: Tag) => (
            <Menu.Item key={tag._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <span>{tag.title}</span>
                    <div style={{ marginLeft: 'auto' }}>
                        <Tooltip title="View Description">
                            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => handleViewDescription(tag.title, tag.description)} />
                        </Tooltip>
                        <Dropdown overlay={() => renderTagMenu(tag)} trigger={['click']}>
                            <Button size="small" type="text" icon={<DownOutlined />} />
                        </Dropdown>
                    </div>
                </div>
            </Menu.Item>
        ));
    };

    return (
        <Menu>
            {renderTags()}
            <Modal
                title="Edit Tag"
                visible={editModalVisible}
                onCancel={() => {
                    setEditedTag(null); // 清空编辑状态
                    setEditModalVisible(false);
                }}
                onOk={handleSaveEdit}
            >
                <div>
                    <label>Title: </label>
                    <Input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label>Description: </label>
                    <TextArea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                    />
                </div>
            </Modal>
        </Menu>
    );
};

export default TagComponent;
