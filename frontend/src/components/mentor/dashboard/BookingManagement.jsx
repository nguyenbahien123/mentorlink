import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, Tab, Nav, Alert } from 'react-bootstrap';
import { useGetMentorActivity } from '../../../hooks/useMentors';
import { handleBookingActionApi } from '../../../services/booking/bookingApi'; 
import { notifications } from "@mantine/notifications";
import { MdError } from "react-icons/md";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from '@tanstack/react-query';
import ClipLoader from "react-spinners/ClipLoader";

const BookingManagement = () => {

    // test push
    const queryClient = useQueryClient();
    const [cancelReason, setCancelReason] = useState("");
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [notification, setNotification] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState({
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: []
    });
    const { data: mentorActivity, isLoading, isError } = useGetMentorActivity();


    if(mentorActivity){
        console.log("Mentor Activity Data:", mentorActivity);
        console.log("Mentor Activity Bookings:", mentorActivity?.data);
    }

    // Hàm sắp xếp bookings theo ngày giảm dần (mới nhất trước)
    const sortBookingsByDate = (bookingsArray) => {
        if (!bookingsArray || !Array.isArray(bookingsArray)) return [];
        
        return [...bookingsArray].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Sắp xếp theo ngày giảm dần (mới nhất trước)
            if (dateB - dateA !== 0) {
                return dateB - dateA;
            }
            
            // Nếu cùng ngày, sắp xếp theo giờ bắt đầu giảm dần
            const timeA = a.timeSlot?.timeStart || 0;
            const timeB = b.timeSlot?.timeStart || 0;
            return timeB - timeA;
        });
    };

    useEffect(() => {
        if (mentorActivity) {
            console.log('Mentor activity data loaded:', mentorActivity?.data);
            const activityData = mentorActivity?.data;
            
            // Sắp xếp từng loại booking
            setBookings({
                pending: sortBookingsByDate(activityData.pending),
                confirmed: sortBookingsByDate(activityData.confirmed),
                completed: sortBookingsByDate(activityData.completed),
                cancelled: sortBookingsByDate(activityData.cancelled)
            });
        }
    }, [mentorActivity]);


    const formatTime = (hour) => {
        if (hour === undefined || hour === null) return '—'; // hoặc '00:00'
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ xác nhận' },
            'CONFIRMED': { bg: 'success', text: 'Đã xác nhận' },
            'COMPLETED': { bg: 'info', text: 'Đã hoàn thành' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' }
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
    };

    const handleBookingAction = async (bookingId, action, cancelReason) => {
        console.log(`${action} booking:`, bookingId);
        try{
            console.log("handle booking......");
            setLoading(true);
            await handleBookingActionApi(bookingId, action, cancelReason);
            setLoading(false);
            queryClient.invalidateQueries({ queryKey: ['mentorActivity'] });
            notifications.show({
                title: "Cập nhật thành công!",
                message: "Đã cập nhập thông tin thành công.",
                color: "green",
                icon: <IconAlertCircle />,
                autoClose: 3000,
            });


        }catch(error){
            setLoading(false);
            notifications.show({
            title: "Lỗi!",
            message: "Đã có lỗi trong quá trình xử lý, vui lòng thử lại sau.",
            color: "red",
            icon: <MdError />, // bạn có thể import từ react-icons
            autoClose: 4000,
          });
        }
        // Logic xử lý booking
    };

    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            notifications.show({
            title: "Thiếu lý do!",
            message: "Vui lòng nhập lý do hủy buổi hẹn.",
            color: "red",
            icon: <MdError />,
            });
            return;
            }

        try {
            setLoading(true);
            await handleBookingActionApi(cancelBookingId, 'CANCELLED', cancelReason);
            setLoading(false);
            notifications.show({
            title: "Đã hủy lịch",
            message: "Lý do: " + cancelReason,
            color: "orange",
            icon: <IconCheck />,
            });
            queryClient.invalidateQueries({ queryKey: ['mentorActivity'] });
        } catch (error) {
            setLoading(false);
            notifications.show({
            title: "Lỗi!",
            message: "Không thể hủy buổi hẹn.",
            color: "red",
            icon: <MdError />,
            });
        }

        setShowReasonModal(false);
        setCancelReason('');
        setCancelBookingId(null);
        };


    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const renderBookingCards = (bookingList) => (
        <div className="booking-cards">
            {bookingList.map((booking) => (
                <Card key={booking.id} className="booking-card mb-3 border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <Row className="align-items-center">
                            {/* Student Info */}
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <div className="student-avatar me-3">
                                        <div className="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #71c9ce, #5fb3d4)' }}>
                                            <span className="text-white fw-bold fs-5">
                                                {booking?.customer?.fullname?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">{booking?.customer?.fullname || 'Không rõ'}</h6>
                                        <small className="text-muted d-block">{booking?.customer?.email || 'Không có email'}</small>
                                        <small className="text-muted">{booking?.customer?.phone || 'Không có SĐT'}</small>
                                    </div>
                                </div>
                            </Col>
                            
                            {/* Booking Details */}
                            <Col md={4}>
                                <div className="booking-details">
                                    <div className="service-tag mb-2">
                                        <Badge bg="light" text="dark" className="px-3 py-2 fs-6">
                                            <i className="bi bi-bookmark-fill me-2"></i>
                                            {booking.service}
                                        </Badge>
                                    </div>
                                    <div className="time-info">
                                        <div className="d-flex align-items-center mb-1">
                                            <i className="bi bi-calendar3 text-primary me-2"></i>
                                            <span className="fw-medium">{booking.date}</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-clock text-success me-2"></i>
                                            <span className="text-muted">
                                                {formatTime(booking?.timeSlot?.timeStart)} - {formatTime(booking?.timeSlot?.timeEnd)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Status */}
                            <Col md={2} className="text-center">
                                <div className="status-section">
                                    {getStatusBadge(booking.status)}
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            Đặt lúc: {formatDateTime(booking.createdAt).split(' ')[1]}
                                        </small>
                                    </div>
                                </div>
                            </Col>

                            {/* Actions */}
                            <Col md={3}>
                                <div className="action-buttons d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewDetail(booking)}
                                        className="px-3"
                                    >
                                        <i className="bi bi-eye me-1"></i>
                                        Chi tiết
                                    </Button>

                                    {booking.status === 'PENDING' && (
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                                                className="px-3"
                                            >
                                                <i className="bi bi-check-lg me-1"></i>
                                                Chấp nhận
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    setCancelBookingId(booking.id);
                                                    setShowReasonModal(true);
                                                    
                                                }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </Button>
                                        </div>
                                    )}

                                    {booking.status === 'APPROVED' && (
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => handleBookingAction(booking.id, 'complete')}
                                            className="px-3"
                                        >
                                            <i className="bi bi-check-circle me-1"></i>
                                            Hoàn thành
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Note Preview */}
                        {booking.note && (
                            <Row className="mt-3">
                                <Col>
                                    <div className="note-preview bg-light p-3 rounded">
                                        <small className="text-muted fw-medium">Ghi chú:</small>
                                        <p className="mb-0 mt-1" style={{ fontSize: '14px' }}>
                                            {booking.note.length > 100 ? `${booking.note.substring(0, 100)}...` : booking.note}
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {/* Rating for completed bookings */}
                        {booking.status === 'COMPLETED' && booking.rating && (
                            <Row className="mt-3">
                                <Col>
                                    <div className="rating-section d-flex align-items-center">
                                        <span className="me-2 text-muted small">Đánh giá:</span>
                                        <div className="stars me-2">
                                            {[...Array(5)].map((_, index) => (
                                                <i
                                                    key={index}
                                                    className={`bi bi-star${index < booking.rating ? '-fill' : ''} text-warning me-1`}
                                                ></i>
                                            ))}
                                        </div>
                                        {booking.review && (
                                            <span className="text-muted small">"{booking.review}"</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="booking-management">
            {loading && (
            <div
                style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                }}
            >
                <ClipLoader size={60} color="#2563eb" />
            </div>
            )}
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1 d-flex align-items-center">
                        <i className="bi bi-calendar-event text-primary me-3"></i>
                        Quản lý đặt lịch
                    </h3>
                    <p className="text-muted mb-0">
                        Quản lý các yêu cầu tư vấn từ học viên một cách dễ dàng và hiệu quả
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" className="px-3">
                        <i className="bi bi-funnel me-2"></i>
                        Lọc
                    </Button>
                    <Button variant="outline-success" className="px-3">
                        <i className="bi bi-download me-2"></i>
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-value">{bookings.pending.length}</div>
                            <p className="stat-label">Chờ xác nhận</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{bookings.confirmed.length}</div>
                            <p className="stat-label">Đã xác nhận</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div className="stat-value">{bookings.completed.length}</div>
                            <p className="stat-label">Đã hoàn thành</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                                <i className="bi bi-x-circle"></i>
                            </div>
                            <div className="stat-value">{bookings.cancelled?.length}</div>
                            <p className="stat-label">Đã hủy</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Booking Tabs */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="tabs" className="booking-tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="pending">
                                    Chờ xác nhận
                                    {bookings.pending.length > 0 && (
                                        <Badge bg="warning" className="ms-2">{bookings.pending.length}</Badge>
                                    )}
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="confirmed">
                                    Đã xác nhận
                                    {bookings.confirmed.length > 0 && (
                                        <Badge bg="success" className="ms-2">{bookings.confirmed.length}</Badge>
                                    )}
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="completed">Đã hoàn thành</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="cancelled">Đã hủy
                                        {bookings.cancelled.length > 0 && (
                                        <Badge bg="danger" className="ms-2">{bookings.cancelled.length}</Badge>
                                    )}

                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Tab.Container>
                </Card.Header>
                <Card.Body className="p-0">
                    <Tab.Container activeKey={activeTab}>
                        <Tab.Content>
                            <Tab.Pane eventKey="pending">
                                {bookings.pending.length > 0 ? (
                                    <div className="p-4">
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span className="text-muted">
                                                <i className="bi bi-clock-history me-2"></i>
                                                {bookings.pending.length} yêu cầu đang chờ xác nhận
                                            </span>
                                            <Button variant="success" size="sm" className="px-3">
                                                <i className="bi bi-check-all me-2"></i>
                                                Chấp nhận tất cả
                                            </Button>
                                        </div>
                                        {renderBookingCards(bookings.pending)}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-calendar-heart display-1 text-primary mb-3"></i>
                                            <h5 className="text-muted">Tuyệt vời! Không còn yêu cầu nào cần xử lý</h5>
                                            <p className="text-muted">Các yêu cầu đặt lịch mới sẽ hiển thị ở đây</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="confirmed">
                                {bookings.confirmed.length > 0 ? (
                                    <div className="p-4">
                                        <div className="mb-3">
                                            <span className="text-muted">
                                                <i className="bi bi-calendar-check me-2"></i>
                                                {bookings.confirmed.length} buổi tư vấn sắp tới
                                            </span>
                                        </div>
                                        {renderBookingCards(bookings.confirmed)}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-calendar-plus display-1 text-success mb-3"></i>
                                            <h5 className="text-muted">Chưa có lịch đã xác nhận</h5>
                                            <p className="text-muted">Lịch đã xác nhận sẽ hiển thị ở đây</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="completed">
                                {bookings.completed.length > 0 ? (
                                    <div className="p-4">
                                        <div className="mb-3">
                                            <span className="text-muted">
                                                <i className="bi bi-trophy me-2"></i>
                                                {bookings.completed.length} buổi tư vấn đã hoàn thành
                                            </span>
                                        </div>
                                        {renderBookingCards(bookings.completed)}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-award display-1 text-info mb-3"></i>
                                            <h5 className="text-muted">Chưa có buổi nào hoàn thành</h5>
                                            <p className="text-muted">Lịch sử tư vấn sẽ hiển thị ở đây</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="cancelled">
                                {bookings.cancelled.length > 0 ? (
                                    <div className="p-4">
                                        <div className="mb-3">
                                            <span className="text-muted">
                                                <i className="bi bi-x-circle me-2"></i>
                                                {bookings.cancelled.length} lịch đã hủy
                                            </span>
                                        </div>
                                        {renderBookingCards(bookings.cancelled)}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-shield-check display-1 text-success mb-3"></i>
                                            <h5 className="text-muted">Không có lịch nào bị hủy</h5>
                                            <p className="text-muted">Điều này thật tuyệt vời!</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Booking Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đặt lịch</Modal.Title>
                </Modal.Header>
                {selectedBooking && (
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Header>
                                        <h6 className="mb-0">Thông tin học viên</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Họ tên:</label>
                                            <p className="mb-1">{selectedBooking.customer.fullname}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Email:</label>
                                            <p className="mb-1">{selectedBooking.customer.email}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Số điện thoại:</label>
                                            <p className="mb-1">{selectedBooking.customer.phone}</p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Header>
                                        <h6 className="mb-0">Thông tin buổi tư vấn</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Dịch vụ:</label>
                                            <p className="mb-1">{selectedBooking.service}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Ngày:</label>
                                            <p className="mb-1">{selectedBooking.date}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Giờ:</label>
                                            <p className="mb-1">
                                                {formatTime(selectedBooking?.timeSlot?.timeStart)} - {formatTime(selectedBooking?.timeSlot?.timeEnd)}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Trạng thái:</label>   
                                            <div>{getStatusBadge(selectedBooking.status)}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="mt-3">
                            <Card.Header>
                                <h6 className="mb-0">Ghi chú từ học viên</h6>
                            </Card.Header>
                            <Card.Body>
                                <p className="mb-0">{selectedBooking.note || 'Không có ghi chú'}</p>
                            </Card.Body>
                        </Card>

                        {selectedBooking.status === 'COMPLETED' && selectedBooking.review && (
                            <Card className="mt-3">
                                <Card.Header>
                                    <h6 className="mb-0">Đánh giá từ học viên</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <span className="me-2">Đánh giá:</span>
                                        {[...Array(5)].map((_, index) => (
                                            <i
                                                key={index}
                                                className={`bi bi-star${index < selectedBooking.rating ? '-fill' : ''} text-warning`}
                                            ></i>
                                        ))}
                                    </div>
                                    <p className="mb-0">{selectedBooking.review}</p>
                                </Card.Body>
                            </Card>
                        )}

                        {selectedBooking.status === 'PENDING' && (
                            <Alert variant="info" className="mt-3">
                                <i className="bi bi-info-circle me-2"></i>
                                Yêu cầu đặt lịch này đang chờ bạn xác nhận. Hãy xác nhận hoặc từ chối để học viên biết kết quả.
                            </Alert>
                        )}
                    </Modal.Body>
                )}
                <Modal.Footer>
                    {selectedBooking && selectedBooking.status === 'PENDING' && (
                        <div className="d-flex gap-2 me-auto">
                            <Button
                                variant="success"
                                onClick={() => handleBookingAction(selectedBooking.id, 'confirm')}
                            >
                                <i className="bi bi-check me-2"></i>Xác nhận
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleBookingAction(selectedBooking.id, 'reject')}
                            >
                                <i className="bi bi-x me-2"></i>Từ chối
                            </Button>
                        </div>
                    )}
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Nhập lý do hủy lịch</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <Form.Group>
                    <Form.Label>Lý do hủy:</Form.Label>
                    <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập lý do hủy buổi hẹn..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    />
                </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowReasonModal(false)}>
                Đóng
                </Button>
                <Button variant="danger" onClick={handleConfirmCancel}>
                <i className="bi bi-x-circle me-2"></i> Xác nhận hủy
                </Button>
            </Modal.Footer>
            </Modal>

            <style jsx>{`
                .booking-tabs .nav-link {
                    color: #6c757d;
                    border-bottom: 3px solid transparent;
                    padding: 1rem 1.5rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .booking-tabs .nav-link.active {
                    color: #71c9ce;
                    border-bottom-color: #71c9ce;
                    background: none;
                    font-weight: 600;
                }
                
                .booking-tabs .nav-link:hover {
                    color: #71c9ce;
                    border-bottom-color: rgba(113, 201, 206, 0.4);
                }

                .booking-card {
                    transition: all 0.3s ease;
                    border-radius: 12px !important;
                    overflow: hidden;
                }

                .booking-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }

                .student-avatar {
                    position: relative;
                }

                .service-tag .badge {
                    border-radius: 20px;
                    font-weight: 500;
                    border: 1px solid #e9ecef;
                }

                .time-info i {
                    font-size: 0.9rem;
                }

                .action-buttons .btn {
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .action-buttons .btn:hover {
                    transform: translateY(-1px);
                }

                .note-preview {
                    border-left: 4px solid #71c9ce;
                    background: #f8f9fa !important;
                }

                .rating-section .stars i {
                    font-size: 0.9rem;
                }

                .empty-state i {
                    opacity: 0.6;
                }

                .status-section .badge {
                    font-size: 0.8rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default BookingManagement;