import React from 'react';
import { Card, Table } from 'antd';
import '../index.css';
interface NoteTemplateProps {
    templateType: string;
}

const NoteTemplate: React.FC<NoteTemplateProps> = ({ templateType }) => {
    let content;
    let imageUrl;

    switch (templateType) {
        case 'gettingStarted':
            imageUrl = 'https://pic.616pic.com/bg_w1180/00/03/71/mMeUGGFhbH.jpg!/fh/300';
            content = (
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

            );
            break;
        case 'readingTemplate':
            imageUrl = 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
            content = (
                <div>
                    <h2>Reading Log</h2>
                    <Table
                        columns={[
                            { title: 'Date', dataIndex: 'date', key: 'date', },
                            { title: 'Book', dataIndex: 'book', key: 'book', },
                            { title: 'Author', dataIndex: 'author', key: 'author', },
                            { title: 'Notes', dataIndex: 'notes', key: 'notes', },]}
                        dataSource={[
                            { key: '1', date: '2024-03-16', book: 'Book Title', author: 'Author Name', notes: 'This is a note about the book.', },]}
                    />
                </div>
            );
            break;
        case 'proceedingsTemplate':
            imageUrl = 'https://pic.616pic.com/bg_w1180/00/15/49/UxknOSMsAj.jpg!/fh/300';
            content = (
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
                </div>
            );
            break;
        case 'financialTemplate':
            imageUrl = 'https://images.unsplash.com/photo-1704472846648-3a1f17131cd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNHx8fGVufDB8fHx8fA%3D%3D';
            content = (
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Income</th>
                            <th>Total Expenses</th>
                            <th>Total Assets</th>
                            <th>Total Liabilities</th>
                            <th>Investment</th>
                            <th>Plan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Income and Expenses</td>
                            <td>XXXX USD</td>
                            <td>XXXX USD</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Assets and Liabilities</td>
                            <td>-</td>
                            <td>-</td>
                            <td>XXXX USD</td>
                            <td>XXXX USD</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Investments and Planning</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>XXXX USD</td>
                            <td>XXXX USD</td>
                        </tr>
                    </tbody>
                </table>
            );
            break;
    }

    return (
        <Card title={templateType} className="template-box">
            <img src={imageUrl} alt="Banner" style={{ width: '100%' }} />
            <div className="template-content">{content}</div>
        </Card>
    );
};

export default NoteTemplate;