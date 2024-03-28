import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LayoutComponent from '../components/LayoutComponent';
import { Typography, Spin, Card, Row, Col, Form, Button, Input, List, Space } from 'antd';
import { MessageOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import CustomComment from '../components/customcomment';
import { selectToken } from '../store/authSlice';
import ObjectId from 'bson-objectid';
import '../index.css';
import { Divider } from 'antd';
import { selectUserId, selectUsername } from '../store/authSlice';
const { Text, Title } = Typography;
const { TextArea } = Input;

interface Note {
    _id: string;
    title: string;
    content: string;
    userId?: {
        username: string;
    };
    image?: string;
}

interface Comment {
    _id: string;
    content: string;
    userId?: {
        _id: string;
        username: string;
    } | null; // 或者使用联合类型 null
    createdAt: string;
    replies: Reply[];
}


interface Reply {
    _id: string;
    content: string;
    userId?: {
        _id: string;
        username: string;
    } | null;
    createdAt: string;
}
const waveStyle = {
    width: '100%',
    height: '8px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\'%3E%3Cpath fill=\'%23f0f0f0\' d=\'M0,32C60,32,106.7,0,160,0s96,32,160,69.3c53.3,37.3,96,69.3,160,74.7s96-11.3,160-16c53.3-4.7,96-2.7,160,10.7s96,37.3,160,32s96-53.3,160-58.7s96,21.3,160,42.7s96,48,160,53.3s96-10.7,160-10.7s96,16,160,16V120H0V32z\'/%3E%3C/svg%3E")',
    backgroundSize: 'auto 100%',
    backgroundRepeat: 'repeat-x',
    marginBottom: '20px', // 增加间距
};
const ViewPublicNotesPage: React.FC = () => {
    const token = useSelector(selectToken);
    const { noteId } = useParams<{ noteId: string }>();
    const [note, setNote] = useState<Note | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [commentContent, setCommentContent] = useState<string>('');
    const [replyContent, setReplyContent] = useState<string>('');
    const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
    const userId = useSelector(selectUserId);
    const username = useSelector(selectUsername);

    useEffect(() => {
        const fetchNoteAndComments = async () => {
            try {
                const responseNote = await fetch(`http://localhost:3001/api/publicnotes/${noteId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const responseComments = await fetch(`http://localhost:3001/comments/${noteId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (responseNote.ok && responseComments.ok) {
                    const dataNote = await responseNote.json();
                    const dataComments = await responseComments.json();
                    setNote(dataNote.note);
                    setComments(dataComments);
                } else {
                    console.error('Failed to fetch note or comments');
                }
            } catch (error) {
                console.error('Failed to fetch note or comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNoteAndComments();
    }, [noteId, token]);

    const handleSubmitComment = async () => {
        try {
            if (!noteId) {
                console.error('NoteId is undefined');
                return;
            }
            if (note) {
                const response = await fetch(`http://localhost:3001/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: commentContent,
                        userId: userId, // 从前端状态中获取用户ID
                        username: username, // 从前端状态中获取用户名
                        noteId: ObjectId.isValid(noteId) ? new ObjectId(noteId) : ''
                    })
                });

                if (response.ok) {
                    console.log('Comment submitted successfully');
                    const updatedCommentsResponse = await fetch(`http://localhost:3001/comments/${noteId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const updatedComments = await updatedCommentsResponse.json();
                    setComments(updatedComments);
                    setCommentContent('');
                } else {
                    console.error('Failed to submit comment');
                }
            } else {
                console.error('Note is empty');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };


    const handleReplySubmit = async (commentId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/comments/${commentId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    userId: userId, // 从前端状态中获取用户ID
                    username: username // 从前端状态中获取用户名
                })
            });

            if (response.ok) {
                console.log('Reply submitted successfully');
                setReplyContent('');
                // 如果需要更新评论列表，可以在这里执行更新操作
            } else {
                console.error('Failed to submit reply');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    const toggleExpandComment = (commentId: string | null) => {
        if (expandedCommentId === commentId) {
            setExpandedCommentId(null);
        } else {
            setExpandedCommentId(commentId);
        }
    };

    const toggleShowReplies = async (commentId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/comments/${commentId}/replies`);
            if (response.ok) {
                const repliesData = await response.json();
                // 更新评论列表以显示回复
                const updatedComments = comments.map((comment) => {
                    if (comment._id === commentId) {
                        return { ...comment, replies: repliesData };
                    }
                    return comment;
                });
                // 更新评论列表和回复显示状态
                setComments(updatedComments);
                setShowReplies((prevState) => ({
                    ...prevState,
                    [commentId]: !prevState[commentId]
                }));
            } else {
                console.error('Failed to fetch replies for comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching replies for comment:', error);
        }
    };

    const handleFavoriteNote = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/favorites/${noteId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Note added to favorites successfully');
                // You can update the UI to reflect that the note has been favorited
            } else {
                console.error('Failed to add note to favorites');
            }
        } catch (error) {
            console.error('Error adding note to favorites:', error);
        }
    };

    if (loading) {
        return (
            <LayoutComponent>
                <Spin size="large" />
            </LayoutComponent>
        );
    }

    if (!note) {
        return (
            <LayoutComponent>
                <Text type="danger">Failed to load note</Text>
            </LayoutComponent>
        );
    }

    return (
        <LayoutComponent>
            <Card>
                <Link to="/publicnotes" style={{ position: 'absolute', top: '10px', left: '10px', color: 'gray', textDecoration: 'none' }}>
                    <span>&#9664;</span>
                </Link>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2}>{note.title}</Title>
                    </Col>
                    <Col>
                        <Text>{note.userId?.username}</Text>
                    </Col>
                </Row>
                <Row justify="center" >
                    <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {note.image && <img src={note.image} alt="Note Image" style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', marginBottom: '20px' }} className="banner-image" />}
                    </Col>
                </Row>

                <div style={{ marginBottom: '100px' }} dangerouslySetInnerHTML={{ __html: note.content }} />
                <Button type="primary" onClick={handleFavoriteNote}>Favorite</Button>

                <div style={{ position: 'relative' }}>
                    <Divider style={waveStyle} />
                    <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', padding: '0 10px' }}>
                        <span>Comment Area</span>
                    </div>
                </div>

                {/* Comment form */}
                <Form onFinish={handleSubmitComment}>
                    <Row justify="space-between" gutter={16}> {/* 使用 gutter 来设置间距 */}
                        <Col flex="auto"> {/* 使用 flex 属性来使文本区域自动填充剩余空间 */}
                            <Form.Item name="content">
                                <TextArea
                                    rows={2}
                                    placeholder="Write a comment..."
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col> {/* 用于放置提交按钮 */}
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit">Submit</Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>


                {/* Comments list */}
                <List
                    dataSource={comments}
                    renderItem={(comment: Comment) => (
                        <List.Item style={{ marginBottom: '8px' }}>
                            <CustomComment
                                author={comment.userId ? comment.userId.username : ""}
                                content={<p>{comment.content}</p>}
                                datetime={new Date(comment.createdAt).toLocaleString()}
                            >
                                {/* Reply form */}
                                {expandedCommentId === comment._id && (
                                    <Form onFinish={() => handleReplySubmit(comment._id)}>
                                        <Form.Item>
                                            <TextArea rows={2} placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                                        </Form.Item>
                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button type="primary" htmlType="submit">Reply</Button>
                                            <Button type="link" icon={<MinusCircleOutlined />} onClick={() => toggleExpandComment(null)}>Cancel</Button>
                                        </Form.Item>
                                    </Form>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Space>
                                        <Button type="text" icon={<MessageOutlined />} onClick={() => toggleShowReplies(comment._id)}>{showReplies[comment._id] ? 'Hide Replies' : 'View Replies'}</Button>
                                        <Button type="text" icon={<PlusCircleOutlined />} onClick={() => toggleExpandComment(comment._id)}>Reply</Button>
                                    </Space>
                                </div>
                                {/* Replies list */}
                                {showReplies[comment._id] && comment.replies && comment.replies.length > 0 && (
                                    <List
                                        dataSource={comment.replies}
                                        renderItem={(reply: Reply) => {

                                            return (
                                                <List.Item>
                                                    <CustomComment
                                                        author={reply.userId ? reply.userId.username : ""}
                                                        content={<p>{reply.content}</p>}
                                                        datetime={new Date(reply.createdAt).toLocaleString()}
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                )}

                            </CustomComment>
                        </List.Item>
                    )}
                />
            </Card>
        </LayoutComponent>
    );
};

export default ViewPublicNotesPage;
