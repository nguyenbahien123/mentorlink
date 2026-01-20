import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Modal, Button, Row, Col, Badge, ListGroup, Spinner } from 'react-bootstrap';
import { instance } from '../../api/axios';
import '../../styles/components/BookingDetailModal.css';

const BookingDetailModal = ({ show, booking, onHide, onBookingCancelled }) => {
    const [cancelling, setCancelling] = useState(false);
    const { showToast } = useToast();

    if (!booking) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTimeSlots = (timeSlots) => {
        if (!timeSlots || !Array.isArray(timeSlots)) return '-';
        return timeSlots
            .map(slot => `${slot.timeStart}:00 - ${slot.timeEnd}:00`)
            .join(', ');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ xử lý' },
            'CONFIRMED': { bg: 'success', text: 'Đã xác nhận' },
            'COMPLETED': { bg: 'info', text: 'Đã hoàn thành' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' }
        };
        const config = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getPaymentBadge = (status) => {
        const statusMap = {
            'COMPLETED': { bg: 'success', text: 'Đã thanh toán' },
            'WAIT_REFUND': { bg: 'warning', text: 'Chờ hoàn tiền' },
            'REFUNDED': { bg: 'danger', text: 'Đã hoàn tiền' }
        };
        const config = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    // Check if booking can be cancelled
    // Conditions:
    // 1. paymentProcess must be COMPLETED
    // 2. statusName must NOT be CANCELLED
    // 3. Must be cancelled at least 3 hours before the earliest time slot
    const canCancelBooking = () => {
        if (!booking || booking.paymentProcess !== 'COMPLETED') return false;
        if (booking.statusName === 'CANCELLED') return false;
        if (!booking.schedule || !booking.schedule.timeSlots || booking.schedule.timeSlots.length === 0) return false;

        try {
            // Get the earliest time slot
            const sortedSlots = booking.schedule.timeSlots
                .slice()
                .sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0));
            const earliestSlot = sortedSlots[0];

            if (!earliestSlot) return false;

            // Parse booking date and earliest time
            const bookingDate = new Date(booking.schedule.date);
            const slotTime = new Date(bookingDate);
            slotTime.setHours(earliestSlot.timeStart, 0, 0, 0);

            // Get current time
            const now = new Date();

            // Calculate time difference in hours
            const timeDiffMs = slotTime - now;
            const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

            // Must be at least 3 hours before
            return timeDiffHours >= 3;
        } catch (error) {
            console.error('Error checking cancel eligibility:', error);
            return false;
        }
    };

    const handleCancelBooking = async () => {
        if (!booking || !booking.bookingId) return;

        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn hủy cuộc họp này? Tiền sẽ được hoàn lại.'
        );

        if (!confirmed) return;

        try {
            setCancelling(true);
            const response = await instance.post(`/api/bookings/${booking.bookingId}/cancel`);

            if (response && response.respCode === '0') {
                // Success
                showToast('Hủy cuộc họp thành công. Tiền sẽ được hoàn lại trong thời gian sớm nhất.', { variant: 'success' });
                // Callback to refresh booking list
                if (onBookingCancelled) {
                    onBookingCancelled(booking.bookingId);
                }
                // Close modal
                onHide();
            } else {
                showToast(response?.description || 'Hủy cuộc họp thất bại. Vui lòng thử lại.', { variant: 'danger' });
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showToast('Lỗi khi hủy cuộc họp. Vui lòng thử lại.', { variant: 'danger' });
        } finally {
            setCancelling(false);
        }
    };

    const isCancellable = canCancelBooking();
    const reasonNotCancellable = !isCancellable ? getReasonNotCancellable() : null;

    // Helper function to explain why booking cannot be cancelled
    function getReasonNotCancellable() {
        if (booking.statusName === 'CANCELLED') {
            return 'Cuộc họp đã bị hủy';
        }
        if (booking.paymentProcess !== 'COMPLETED') {
            return ;
        }
        if (!booking.schedule || !booking.schedule.timeSlots || booking.schedule.timeSlots.length === 0) {
            return 'Không có thông tin lịch học';
        }

        try {
            const sortedSlots = booking.schedule.timeSlots
                .slice()
                .sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0));
            const earliestSlot = sortedSlots[0];
            const bookingDate = new Date(booking.schedule.date);
            const slotTime = new Date(bookingDate);
            slotTime.setHours(earliestSlot.timeStart, 0, 0, 0);
            const now = new Date();
            const timeDiffHours = (slotTime - now) / (1000 * 60 * 60);

            if (timeDiffHours < 0) {
                return 'Cuộc họp đã diễn ra';
            }
            if (timeDiffHours < 3) {
                const hoursLeft = timeDiffHours.toFixed(1);
                return `Chỉ có ${hoursLeft} giờ nữa. Phải hủy 3 giờ trước.`;
            }
        } catch (error) {
            console.error('Error calculating reason:', error);
        }
        return 'Không thể hủy cuộc họp';
    }

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="bi bi-calendar-check me-2"></i>
                    Chi tiết lịch đặt lịch
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="booking-detail-content">
                    {/* Basic Info */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <h6 className="text-muted mb-2">Booking ID</h6>
                            <p className="fw-bold">{booking.bookingId}</p>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-muted mb-2">Ngày đặt</h6>
                            <p className="fw-bold">
                                {new Date(booking.requestDateTime).toLocaleDateString('vi-VN')}
                            </p>
                        </Col>
                    </Row>

                    {/* Status and Payment */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <h6 className="text-muted mb-2">Trạng thái booking</h6>
                            <p>{getStatusBadge(booking.statusName)}</p>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-muted mb-2">Trạng thái thanh toán</h6>
                            <p>{getPaymentBadge(booking.paymentProcess)}</p>
                        </Col>
                    </Row>

                    {/* Description */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <h6 className="text-muted mb-2">Mô tả</h6>
                            <div className="detail-box">
                                <p className="mb-0">{booking.description || '(Không có mô tả)'}</p>
                            </div>
                        </Col>
                    </Row>

                    {/* Mentor Comment */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <h6 className="text-muted mb-2">Nhận xét của cố vấn</h6>
                            <div className="detail-box">
                                <p className="mb-0">{booking.comment || '(Chưa có nhận xét)'}</p>
                            </div>
                        </Col>
                    </Row>

                    {/* Mentor Info */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <h6 className="text-muted mb-2">Thông tin cố vấn</h6>
                            <ListGroup>
                                <ListGroup.Item>
                                    <strong>Email:</strong> {booking.emailMentor}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>

                    {/* Schedule Info */}
                    {booking.schedule && (
                        <Row className="mb-4">
                            <Col md={12}>
                                <h6 className="text-muted mb-2">Thông tin lịch học</h6>
                                <div className="schedule-info">
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <small className="text-muted">Ngày</small>
                                            <p className="fw-bold">{formatDate(booking.schedule.date)}</p>
                                        </Col>
                                        <Col md={6}>
                                            <small className="text-muted">Giá</small>
                                            <p className="fw-bold">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(booking.schedule.price)}
                                            </p>
                                        </Col>
                                    </Row>
                                    <div>
                                        <small className="text-muted">Các slot thời gian</small>
                                        <div className="time-slots-detail">
                                            {booking.schedule.timeSlots && booking.schedule.timeSlots.length > 0 ? (
                                                <ul className="mb-0">
                                                    {booking.schedule.timeSlots
                                                        .slice()
                                                        .sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0))
                                                        .map((slot, index) => (
                                                            <li key={index}>
                                                                {slot.timeStart}:00 - {slot.timeEnd}:00
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <p className="mb-0 text-muted">-</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                {isCancellable && (
                    <Button
                        variant="danger"
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="me-2"
                    >
                        {cancelling ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang hủy...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-x-circle me-2"></i>
                                Hủy cuộc họp
                            </>
                        )}
                    </Button>
                )}
                {!isCancellable && reasonNotCancellable && (
                    <div className="me-auto">
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {reasonNotCancellable}
                        </small>
                    </div>
                )}
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookingDetailModal;
