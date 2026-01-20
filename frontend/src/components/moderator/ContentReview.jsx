import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiCheck, FiX } from 'react-icons/fi';

const ContentReview = () => {
    

    const [activeFilter, setActiveFilter] = useState('all');

    const handleApprove = (id) => {
        setContentItems(contentItems.map(item =>
            item.id === id ? { ...item, status: 'approved' } : item
        ));
    };

    const handleReject = (id) => {
        setContentItems(contentItems.map(item =>
            item.id === id ? { ...item, status: 'rejected' } : item
        ));
    };

    const filteredItems = contentItems.filter(item => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return item.status === 'pending';
        if (activeFilter === 'approved') return item.status === 'approved';
        if (activeFilter === 'rejected') return item.status === 'rejected';
        if (activeFilter === 'blog') return item.type === 'blog';
        if (activeFilter === 'feedback') return item.type === 'feedback';
        return true;
    });

    return (
        <Card className="content-review-panel">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Kiểm duyệt nội dung</h5>
                <div>
                    <Badge bg="warning" className="me-2">
                        {contentItems.filter(item => item.status === 'pending').length} chờ duyệt
                    </Badge>
                    <Button variant="outline-primary" size="sm">Xem tất cả</Button>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="filter-bar mb-3 d-flex flex-wrap">
                    <Button
                        variant={activeFilter === 'all' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => setActiveFilter('all')}
                    >
                        Tất cả ({contentItems.length})
                    </Button>
                    <Button
                        variant={activeFilter === 'pending' ? 'warning' : 'outline-warning'}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => setActiveFilter('pending')}
                    >
                        Đang chờ ({contentItems.filter(item => item.status === 'pending').length})
                    </Button>
                    <Button
                        variant={activeFilter === 'approved' ? 'success' : 'outline-success'}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => setActiveFilter('approved')}
                    >
                        Đã phê duyệt ({contentItems.filter(item => item.status === 'approved').length})
                    </Button>
                    <Button
                        variant={activeFilter === 'rejected' ? 'danger' : 'outline-danger'}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => setActiveFilter('rejected')}
                    >
                        Đã từ chối ({contentItems.filter(item => item.status === 'rejected').length})
                    </Button>
                    <Button
                        variant={activeFilter === 'blog' ? 'info' : 'outline-secondary'}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => setActiveFilter('blog')}
                    >
                        Blog ({contentItems.filter(item => item.type === 'blog').length})
                    </Button>
                    <Button
                        variant={activeFilter === 'feedback' ? 'secondary' : 'outline-secondary'}
                        size="sm"
                        className="mb-2"
                        onClick={() => setActiveFilter('feedback')}
                    >
                        Feedback ({contentItems.filter(item => item.type === 'feedback').length})
                    </Button>
                </div>

                <div className="content-list">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`content-item ${item.status === 'pending' ? 'pending' : item.status === 'approved' ? 'approved' : 'rejected'}`}
                            >
                                <div className="d-flex justify-content-between">
                                    <h6>{item.title}</h6>
                                    <Badge bg={
                                        item.type === 'blog' ? 'info' :
                                            item.type === 'faq' ? 'primary' : 'secondary'
                                    }>
                                        {item.type.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-muted small">Đăng bởi: {item.author} - {item.date}</p>

                                {item.status === 'pending' ? (
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleReject(item.id)}
                                        >
                                            <FiX className="me-1" /> Từ chối
                                        </Button>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApprove(item.id)}
                                        >
                                            <FiCheck className="me-1" /> Phê duyệt
                                        </Button>
                                    </div>
                                ) : (
                                    <p className={`small ${item.status === 'approved' ? 'text-success' : 'text-danger'}`}>
                                        {item.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                Không có mục nào để hiển thị với bộ lọc hiện tại
                            </p>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2"
                                onClick={() => setActiveFilter('all')}
                            >
                                Xem tất cả
                            </Button>
                        </div>
                    )}
                </div>
            </Card.Body>
            <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                        Hiển thị {filteredItems.length} trên {contentItems.length} mục
                        {activeFilter !== 'all' && (
                            <span className="ms-2 text-primary">
                                (Đã lọc: {activeFilter === 'pending' ? 'Đang chờ' :
                                    activeFilter === 'approved' ? 'Đã phê duyệt' :
                                        activeFilter === 'rejected' ? 'Đã từ chối' :
                                            activeFilter === 'blog' ? 'Blog' : 'Feedback'})
                            </span>
                        )}
                    </span>
                    <div className="pagination-controls">
                        <Button variant="light" size="sm" className="me-1">←</Button>
                        <Button variant="primary" size="sm" className="me-1">1</Button>
                        <Button variant="light" size="sm" className="me-1">2</Button>
                        <Button variant="light" size="sm" className="me-1">3</Button>
                        <Button variant="light" size="sm">→</Button>
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default ContentReview;