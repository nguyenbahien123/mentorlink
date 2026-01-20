import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button } from 'react-bootstrap';
import { instance } from '../../api/axios';
import { API_ENDPOINTS } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import BookingDetailModal from '../../components/common/BookingDetailModal';
import '../../styles/components/BookingHistory.css';

const BookingHistoryPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        // Helper: compute a timestamp for sorting a booking by its schedule date and latest timeslot
        const computeBookingTimestamp = (booking) => {
            if (!booking || !booking.schedule) return 0;
            const dateStr = booking.schedule.date;
            const dateMs = dateStr ? new Date(dateStr).setHours(0, 0, 0, 0) : 0;
            const slots = booking.schedule.timeSlots || [];
            // Use the latest timeStart (so bookings with later times appear first for same date)
            const maxStart = slots.length > 0 ? Math.max(...slots.map(s => Number(s.timeStart || 0))) : 0;
            return dateMs + (Number(maxStart) * 60 * 60 * 1000);
        };

        const fetchBookingHistory = async () => {
            try {
                setLoading(true);
                const res = await instance.get('/api/bookings/mine');
                const data = res?.data || res;
                // Sort bookings by date descending (newest first)
                if (Array.isArray(data)) {
                    const sortedData = data.sort((a, b) => {
                        const timestampA = computeBookingTimestamp(a);
                        const timestampB = computeBookingTimestamp(b);
                        // Sắp xếp giảm dần - ngày mới nhất trước
                        return timestampB - timestampA;
                    });
                    setBookings(sortedData);
                }
            } catch (error) {
                console.error('Fetch booking history error', error);
                showToast('Không thể tải lịch sử đặt lịch', { variant: 'danger' });
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [showToast]);

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ xử lý' },
            'APPROVED': { bg: 'success', text: 'Đã xác nhận' },
            'SUCCESS': { bg: 'info', text: 'Đã hoàn thành' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
            'COMPLETED': { bg: 'primary', text: 'Đã hoàn tất' },
            'REJECTED': { bg: 'danger', text: 'Đã bị từ chối' },
            'CONFIRMED': { bg: 'success', text: 'Đã xử lý' },
        };
        const config = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getPaymentBadge = (status) => {
        const statusMap = {
            'COMPLETED': { bg: 'success', text: 'Đã thanh toán' },
            'WAIT_REFUND': { bg: 'warning', text: 'Chờ hoàn tiền' },
            'REFUNDED': { bg: 'danger', text: 'Đã hoàn tiền' },
        };
        const config = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (timeSlots) => {
        if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) return '-';
        const sorted = timeSlots.slice().sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0));
        return sorted
            .map(slot => `${slot.timeStart}:00 - ${slot.timeEnd}:00`)
            .join(', ');
    };

    const renderTimeSlots = (timeSlots) => {
        if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) return '-';
        const sorted = timeSlots.slice().sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0));
        return (
            <div className="time-slots-container">
                {sorted.map((slot, i) => (
                    <span key={i} className="time-slot-chip">{`${slot.timeStart}:00 - ${slot.timeEnd}:00`}</span>
                ))}
            </div>
        );
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return '-';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetail(true);
    };

    const handleBookingCancelled = async (bookingId) => {
        // Refresh booking list after cancellation and keep descending date/time order
        try {
            const res = await instance.get('/api/bookings/mine');
            const data = res?.data || res;
            if (Array.isArray(data)) {
                // Helper: compute a timestamp for sorting
                const computeBookingTimestamp = (booking) => {
                    if (!booking || !booking.schedule) return 0;
                    const dateStr = booking.schedule.date;
                    const dateMs = dateStr ? new Date(dateStr).setHours(0, 0, 0, 0) : 0;
                    const slots = booking.schedule.timeSlots || [];
                    const maxStart = slots.length > 0 ? Math.max(...slots.map(s => Number(s.timeStart || 0))) : 0;
                    return dateMs + (Number(maxStart) * 60 * 60 * 1000);
                };
                
                const sortedData = data.sort((a, b) => {
                    const timestampA = computeBookingTimestamp(a);
                    const timestampB = computeBookingTimestamp(b);
                    return timestampB - timestampA; // Giảm dần
                });
                setBookings(sortedData);
            }
        } catch (error) {
            console.error('Error refreshing bookings:', error);
        }
    };

    const handleMentorClick = (mentorId) => {
        if (!mentorId) {
            showToast('Không có thông tin cố vấn', { variant: 'warning' });
            return;
        }

        // Navigate directly to mentor detail page using mentorId
        navigate(`/mentors/${mentorId}`);
    };

    if (loading) {
        return (
            <Container className="py-5">
                <Row>
                    <Col className="text-center">
                        <Spinner animation="border" />
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <Card className="booking-history-card">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-calendar-check me-2"></i>
                                Lịch sử đặt lịch
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {bookings && bookings.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover className="booking-history-table">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '5%' }}>STT</th>                                       
                                                <th style={{ width: '15%' }}>Cố vấn</th>
                                                <th style={{ width: '10%' }}>Ngày</th>                                              
                                                <th style={{ width: '16%' }}>Thời gian</th>
                                                <th style={{ width: '12%' }}>Giá</th>                                             
                                                <th style={{ width: '17%' }}>TT Thanh toán</th>
                                                <th style={{ width: '10%' }}>Trạng thái</th>
                                                <th style={{ width: '10%' }}>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking, index) => (
                                                <tr key={booking.bookingId} className="booking-row">
                                                    <td className="stt-cell">{index + 1}</td>
                                                    
                                                    <td>
                                                        <Button
                                                            variant="link"
                                                            className="mentor-link"
                                                            onClick={() => handleMentorClick(booking.mentorId)}
                                                            title="Xem thông tin cố vấn"
                                                        >
                                                            <small>{booking.emailMentor || '-'}</small>
                                                        </Button>
                                                    </td>
                                                    <td>
                                                        {booking.schedule
                                                            ? formatDate(booking.schedule.date)
                                                            : '-'}
                                                    </td>
                                                    
                                                    <td>
                                                        {booking.schedule && booking.schedule.timeSlots
                                                            ? renderTimeSlots(booking.schedule.timeSlots)
                                                            : '-'}
                                                    </td>
                                                    <td className="price-cell">
                                                        {booking.schedule ? formatPrice(booking.schedule.price) : '-'}
                                                    </td>                                                  
                                                    <td>
                                                        {getPaymentBadge(booking.paymentProcess)}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(booking.statusName)}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(booking)}
                                                            className="detail-btn"
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            Chi tiết
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                    <p className="mt-3 text-muted">Chưa có lịch sử đặt lịch nào</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Detail Modal */}
            <BookingDetailModal
                show={showDetail}
                booking={selectedBooking}
                onHide={() => setShowDetail(false)}
                onBookingCancelled={handleBookingCancelled}
            />
        </Container>
    );
};

export default BookingHistoryPage;
