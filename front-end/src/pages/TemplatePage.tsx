import React from 'react';
import LayoutComponent from '../components/LayoutComponent';
import NoteTemplate from '../components/NoteTemplate';
import { Row, Col, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from '../store/authSlice';

const TemplatePage: React.FC = () => {
    const navigate = useNavigate();
    const token = useSelector(selectToken);

    const handleUseTemplate = async (templateType: string, imageUrl: string, content: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: templateType,
                    image: imageUrl,
                    content: content
                }),
            });

            if (response.ok) {
                const { noteId } = await response.json();
                navigate(`/edit/${noteId}`);
            } else {
                console.error('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleReadingTemplate = () => {
        const tableHtml = `
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>2024-03-16</td>
                    <td>Book Title</td>
                    <td>Author Name</td>
                    <td>This is a note about the book.</td>
                </tr>
            </tbody>
        </table>
        `;

        handleUseTemplate(
            "readingTemplate",
            'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhZGluZ3xlbnwwfHwwfHx8MA%3D%3D',
            tableHtml
        );
    };
    const handleproceedingsTemplate = () => {
        const tableHtml = `
        <div>
                    <h2>Meeting Proceedings</h2>
                    <h3>Meeting Details</h3>
                    <p>Date: XXXX-XX-XX</p>
                    <p>Location: XXXXXX</p>
                    <h3>Agenda</h3>
                    <ul>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                    </ul>
                    <h3>Discussion Points</h3>
                    <ul>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                    </ul>
                    <h3>Action Items</h3>
                    <ul>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                        <li>XXXXX</li>
                    </ul>
                </div>`;
        handleUseTemplate(
            "proceedingsTemplate",
            'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhZGluZ3xlbnwwfHwwfHx8MA%3D%3D',
            tableHtml
        );
    }
    const handlegetstartTemplate = () => {
        const tableHtml = `
        <div>
        <h2>Welcome to Our Website</h2>
        <p>Thank you for visiting our website. We are excited to introduce you to our products and services. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquet urna nec consequat lacinia. Nullam convallis, turpis sed ultrices aliquet, est magna vehicula urna, vel sagittis dui tortor ut purus. Phasellus quis purus mauris. Nulla facilisi.</p>
        <p>In this website, you'll find:</p>
        <ul>
            <li>A wide range of products to choose from</li>
            <li>Informative articles and blog posts</li>
            <li>Customer reviews and testimonials</li>
        </ul>
        <p>Feel free to explore our website and don't hesitate to <a href="mailto:info@example.com">contact us</a> if you have any questions.</p>
    </div>
       `;
        handleUseTemplate(
            "gettingStarted",
            'https://pic.616pic.com/bg_w1180/00/03/71/mMeUGGFhbH.jpg!/fh/300',
            tableHtml
        );
    }
    const handlefinacialTemplate = () => {
        const tableHtml = `
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Expense</th>
                    <th>Amount (USD)</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>2024-03-16</td>
                    <td>Groceries</td>
                    <td>50.00</td>
                    <td>Food</td>
                </tr>
                <tr>
                    <td>2024-03-16</td>
                    <td>Gasoline</td>
                    <td>30.00</td>
                    <td>Transportation</td>
                </tr>
            </tbody>
        </table>
        `;
        handleUseTemplate(
            "finacial",
            'https://images.unsplash.com/photo-1704472846648-3a1f17131cd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNHx8fGVufDB8fHx8fA%3D%3D',
            tableHtml
        );
    }

    return (
        <LayoutComponent>
            <h1>My Notes</h1>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6} lg={6}>
                    <Card>
                        <NoteTemplate templateType="gettingStarted" />
                        <Button type="primary" onClick={handlegetstartTemplate}>
                            Use Template
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                    <Card>
                        <NoteTemplate templateType="readingTemplate" />
                        <Button type="primary" onClick={handleReadingTemplate}>
                            Use Template
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                    <Card>
                        <NoteTemplate templateType="proceedingsTemplate" />
                        <Button type="primary" onClick={handleproceedingsTemplate}>
                            Use Template
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                    <Card>
                        <NoteTemplate templateType="financialTemplate" />
                        <Button type="primary" onClick={handlefinacialTemplate}>
                            Use Template
                        </Button>
                    </Card>
                </Col>
            </Row>
        </LayoutComponent>
    );
};

export default TemplatePage;
