import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

const CustomerSupport = () => {
    const [supportItems, setSupportItems] = useState([
        {
            id: 1,
            title: 'Vấn đề về thanh toán',
            sender: 'lethihong@gmail.com',
            date: '01/10/2025',
            message: 'Tôi đã thanh toán nhưng chưa được kết nối với mentor',
            priority: 'urgent',
            status: 'new',
            type: 'support'
        },
        {
            id: 2,
            title: 'FAQ: Làm thế nào để đặt lịch với mentor?',
            sender: 'admin@mentorlink.com',
            date: '29/09/2025',
            message: 'Cần trả lời câu hỏi thường gặp về quy trình đặt lịch với mentor',
            priority: 'normal',
            status: 'new',
            type: 'faq'
        },
        {
            id: 3,
            title: 'Hướng dẫn đặt lịch',
            sender: 'nguyenvanbinh@gmail.com',
            date: '30/09/2025',
            message: 'Làm thế nào để đặt lịch với mentor theo nhóm?',
            priority: 'normal',
            status: 'new',
            type: 'support'
        },
        {
            id: 4,
            title: 'Cập nhật thông tin cá nhân',
            sender: 'phamthanhhai@gmail.com',
            date: '29/09/2025',
            message: 'Đã hỗ trợ cập nhật thông tin cá nhân cho khách hàng',
            priority: 'normal',
            status: 'resolved',
            type: 'support'
        },
        {
            id: 5,
            title: 'FAQ: Cách thay đổi mật khẩu?',
            sender: 'admin@mentorlink.com',
            date: '28/09/2025',
            message: 'Cập nhật hướng dẫn thay đổi mật khẩu cho người dùng',
            priority: 'normal',
            status: 'resolved',
            type: 'faq'
        }
    ]);

    const [showReplyModal, setShowReplyModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    const handleReply = (id) => {
        const item = supportItems.find(item => item.id === id);
        setCurrentItem(item);
        setShowReplyModal(true);
    };

    const handleSubmitReply = () => {
        if (currentItem && replyMessage) {
            setSupportItems(supportItems.map(item =>
                item.id === currentItem.id ? { ...item, status: 'inProgress' } : item
            ));
            setShowReplyModal(false);
            setReplyMessage('');
        }
    };

    const handleResolve = (id) => {
        setSupportItems(supportItems.map(item =>
            item.id === id ? { ...item, status: 'resolved' } : item
        ));
    };

    return (
        <>
            <Card className="support-panel">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Hỗ trợ khách hàng & FAQ</h5>
                    <div>
                        <Badge bg="danger" className="me-2">
                            {supportItems.filter(item => item.priority === 'urgent' && item.status !== 'resolved').length} khẩn cấp
                        </Badge>
                        <Badge bg="info" className="me-2">
                            {supportItems.filter(item => item.status === 'new').length} mới
                        </Badge>
                        <Badge bg="primary" className="me-2">
                            {supportItems.filter(item => item.type === 'faq').length} FAQ
                        </Badge>
                        <Button variant="outline-primary" size="sm">Xem tất cả</Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="filter-bar mb-3 d-flex">
                        <Button variant="outline-secondary" size="sm" className="me-2">Tất cả</Button>
                        <Button variant="outline-primary" size="sm" className="me-2">FAQ</Button>
                        <Button variant="outline-info" size="sm" className="me-2">Hỗ trợ</Button>
                        <Button variant="outline-danger" size="sm" className="me-2">Khẩn cấp</Button>
                        <Button variant="outline-success" size="sm">Đã giải quyết</Button>
                    </div>

                    <div className="support-list">
                        {supportItems.map(item => (
                            <div
                                key={item.id}
                                className={`support-item ${item.priority === 'urgent' ? 'urgent' : ''} ${item.status === 'resolved' ? 'resolved' : ''}`}
                            >
                                <div className="d-flex justify-content-between">
                                    <h6>{item.title}</h6>
                                    <div>
                                        {item.type === 'faq' && (
                                            <Badge bg="primary" className="me-1">FAQ</Badge>
                                        )}
                                        {item.priority === 'urgent' && item.status !== 'resolved' && (
                                            <Badge bg="danger">Khẩn cấp</Badge>
                                        )}
                                        {item.status === 'new' && (
                                            <Badge bg="info">Mới</Badge>
                                        )}
                                        {item.status === 'inProgress' && (
                                            <Badge bg="warning">Đang xử lý</Badge>
                                        )}
                                        {item.status === 'resolved' && (
                                            <Badge bg="success">{item.type === 'faq' ? 'Đã trả lời' : 'Đã giải quyết'}</Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted small">Người gửi: {item.sender} - {item.date}</p>
                                <p>{item.message}</p>

                                {item.status !== 'resolved' ? (
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleResolve(item.id)}
                                        >
                                            <FiCheckCircle className="me-1" /> {item.type === 'faq' ? 'Đánh dấu đã trả lời' : 'Đánh dấu đã giải quyết'}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleReply(item.id)}
                                        >
                                            <FiMessageSquare className="me-1" /> {item.type === 'faq' ? 'Trả lời' : 'Phản hồi'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-end">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleReply(item.id)}
                                        >
                                            Xem lịch sử
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card.Body>
                <Card.Footer className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Hiển thị 3 trên 8 mục</span>
                        <div className="pagination-controls">
                            <Button variant="light" size="sm" className="me-1">←</Button>
                            <Button variant="primary" size="sm" className="me-1">1</Button>
                            <Button variant="light" size="sm" className="me-1">2</Button>
                            <Button variant="light" size="sm">→</Button>
                        </div>
                    </div>
                </Card.Footer>
            </Card>

            {/* Reply Modal */}
            <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentItem?.type === 'faq' ? 'Trả lời FAQ' : 'Phản hồi hỗ trợ'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentItem && (
                        <div className="original-message mb-3 p-3 bg-light rounded">
                            <h6>Yêu cầu từ {currentItem.sender}</h6>
                            <p className="mb-1">{currentItem.message}</p>
                            <small className="text-muted">Gửi lúc: {currentItem.date}</small>
                        </div>
                    )}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung phản hồi</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Nhập nội dung phản hồi của bạn..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSubmitReply}>
                        {currentItem?.type === 'faq' ? 'Gửi câu trả lời' : 'Gửi phản hồi'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CustomerSupport;