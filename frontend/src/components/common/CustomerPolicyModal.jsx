import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import PolicyService from '../../services/policy/PolicyService';

const CustomerPolicyModal = ({ show, onHide, onAgree }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            fetchPolicies();
        }
    }, [show]);

    const fetchPolicies = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await PolicyService.getActiveMenteePolicies();
            if (response.respCode === "0") {
                setPolicies(response.data || []);
            } else {
                setError(response.description || 'Có lỗi xảy ra khi tải chính sách');
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            setError('Không thể tải thông tin chính sách. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleAgree = () => {
        if (onAgree) {
            onAgree();
        }
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            scrollable
            backdrop="static"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="text-primary fw-bold">
                    <i className="bi bi-shield-check me-2"></i>
                    Điều khoản sử dụng và chính sách bảo mật
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }} className="pt-2">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </Spinner>
                        <p className="mt-3 text-muted">Đang tải chính sách...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="border-0 shadow-sm">
                        <Alert.Heading className="h5">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Lỗi!
                        </Alert.Heading>
                        <p className="mb-3">{error}</p>
                        <Button variant="outline-danger" size="sm" onClick={fetchPolicies}>
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Thử lại
                        </Button>
                    </Alert>
                ) : policies.length > 0 ? (
                    <div>
                        <Alert variant="info" className="border-0 shadow-sm mb-4">
                            <i className="bi bi-info-circle me-2"></i>
                            Vui lòng đọc kỹ các điều khoản và chính sách dưới đây trước khi đồng ý:
                        </Alert>

                        {policies.map((policy, index) => (
                            <Card key={policy.id} className="mb-3 border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-start mb-3">
                                        <Badge
                                            bg="primary"
                                            className="me-3 mt-1 px-2 py-1 rounded-pill"
                                        >
                                            {index + 1}
                                        </Badge>
                                        <Card.Title className="h5 text-primary mb-0 flex-grow-1">
                                            {policy.title}
                                        </Card.Title>
                                    </div>
                                    <Card.Text className="text-secondary mb-3 ps-4">
                                        {policy.content}
                                    </Card.Text>
                                    <div className="ps-4">
                                        <small className="text-muted">
                                            <i className="bi bi-clock me-1"></i>
                                            Cập nhật: {new Date(policy.updatedAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        <Alert variant="warning" className="border-0 shadow-sm mt-4">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Lưu ý:</strong> Bằng cách nhấn "Tôi đồng ý", bạn xác nhận đã đọc và hiểu tất cả các điều khoản trên.
                        </Alert>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-file-text text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted mt-3">Không có chính sách nào được tìm thấy.</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="outline-secondary" onClick={onHide}>
                    <i className="bi bi-x-lg me-1"></i>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAgree}
                    disabled={loading || error || policies.length === 0}
                    className="px-4"
                >
                    <i className="bi bi-check-lg me-1"></i>
                    Tôi đồng ý
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerPolicyModal;