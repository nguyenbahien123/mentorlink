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
    cancelled: [],
    expired: []
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
            
            // Hàm lọc booking có thời gian bắt đầu cách hiện tại ít nhất 3 giờ
            const filterByMinimumPrepTime = (bookings) => {
                if (!bookings || !Array.isArray(bookings)) return [];
                
                const now = new Date();
                const minimumPrepTimeInHours = 3;
                
                return bookings.filter(booking => {
                    if (!booking.date || booking.timeSlot?.timeStart === undefined) return false;
                    
                    // Parse date string (format: YYYY-MM-DD)
                    const dateStr = booking.date;
                    const [year, month, day] = dateStr.split('-').map(Number);
                    
                    // Tạo datetime với date và timeStart
                    const bookingDateTime = new Date(year, month - 1, day, booking.timeSlot.timeStart, 0, 0, 0);
                    
                    // Tính số giờ chênh lệch
                    const hoursDiff = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    
                    // Debug log
                    console.log('Booking:', {
                        date: dateStr,
                        time: booking.timeSlot.timeStart,
                        bookingDateTime: bookingDateTime.toLocaleString('vi-VN'),
                        now: now.toLocaleString('vi-VN'),
                        hoursDiff: hoursDiff.toFixed(2),
                        willShow: hoursDiff >= minimumPrepTimeInHours
                    });
                    
                    // Chỉ hiển thị booking có thời gian bắt đầu >= hiện tại + 3 giờ
                    return hoursDiff >= minimumPrepTimeInHours;
                });
            };
            
            // Lọc cancelled bookings: những booking có comment "Quá hạn xử lý" là expired
            const allCancelled = sortBookingsByDate(activityData.cancelled || []);
            const expiredBookings = allCancelled.filter(b => b.comment === "Quá hạn xử lý");
            const cancelledBookings = allCancelled.filter(b => b.comment !== "Quá hạn xử lý");
            
            // Lọc booking theo thời gian chuẩn bị tối thiểu 3 giờ
            const filteredPending = filterByMinimumPrepTime(activityData.pending);
            const filteredConfirmed = filterByMinimumPrepTime(activityData.confirmed);
            
            // Sắp xếp từng loại booking
            setBookings({
                pending: sortBookingsByDate(filteredPending),
                confirmed: sortBookingsByDate(filteredConfirmed),
                completed: sortBookingsByDate(activityData.completed),
                cancelled: cancelledBookings,
                expired: expiredBookings
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

    const formatDateOnly = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ xác nhận' },
            'CONFIRMED': { bg: 'success', text: 'Đã xác nhận' },
            'COMPLETED': { bg: 'info', text: 'Đã hoàn thành' },
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
    };

    const getServiceLabel = (serviceValue) => {
        const serviceMap = {
            'SCHOLARSHIP': 'Học bổng',
            'JOBS': 'Việc làm',
            'SOFT_SKILLS': 'Kỹ năng mềm',
            'PROCEDURES': 'Thủ tục',
            'ORIENTATION': 'Định hướng',
            'OTHERS': 'Khác'
        };
        return serviceMap[serviceValue] || serviceValue;
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



    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const closeReasonModal = () => {
        setShowReasonModal(false);
        setCancelReason("");
        setCancelBookingId(null);
    };

    const handleSubmitCancel = async () => {
        if (!cancelBookingId) return;
        await handleBookingAction(cancelBookingId, 'CANCELLED', cancelReason);
        closeReasonModal();
    };

    const renderBookingCards = (bookingList) => (
        <div className="booking-cards">
            {bookingList.map((booking) => (
                <Card key={booking.id} className="booking-card mb-3 border-0 shadow-sm">
                    <Card.Body className="p-3">
                        <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3">
                            <div className="d-flex align-items-start gap-3 flex-grow-1">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                    <span className="fw-bold">
                                        {booking?.customer?.fullname?.charAt(0) || '?'}
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-bold">{booking?.customer?.fullname || 'Không rõ'}</h6>
                                    <div className="text-muted small">{booking?.customer?.email || 'Không có email'}</div>
                                    <div className="text-muted small">{booking?.customer?.phone || 'Không có SĐT'}</div>
                                    <div className="mt-2 d-flex flex-wrap gap-2 align-items-center text-muted small">
                                        <Badge bg="light" text="dark" className="px-2 py-1">
                                            {getServiceLabel(booking.service)}
                                        </Badge>
                                        <span>
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {formatDateOnly(booking.date)}
                                        </span>
                                        <span>
                                            <i className="bi bi-clock me-1"></i>
                                            {formatTime(booking?.timeSlot?.timeStart)} - {formatTime(booking?.timeSlot?.timeEnd)}
                                        </span>
                                        <span>
                                            <i className="bi bi-clock-history me-1"></i>
                                            Đặt lúc: {formatDateTime(booking.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-column align-items-end gap-2">
                                <div>{getStatusBadge(booking.status)}</div>
                                <div className="d-flex flex-wrap justify-content-end gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewDetail(booking)}
                                    >
                                        <i className="bi bi-eye me-1"></i>
                                        Chi tiết
                                    </Button>

                                    {booking.status === 'PENDING' && (
                                        <>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
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
                                        </>
                                    )}

                                    {booking.status === 'CONFIRMED' && (
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleBookingAction(booking.id, 'complete')}
                                        >
                                            <i className="bi bi-check-circle me-1"></i>
                                            Hoàn thành
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
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
                
            </div>


            {/* Booking Tabs - Style giống Service Management */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <style>{`
                        .status-filter .nav-link {
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-weight: 500;
                            transition: all 0.3s ease;
                        }
                        .status-filter .nav-link:hover {
                            border-color: #71c9ce;
                            box-shadow: 0 2px 8px rgba(113, 201, 206, 0.2);
                            transform: translateY(-1px);
                        }
                        .status-filter .nav-link.active {
                            border-color: #007bff;
                            background-color: #007bff;
                            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                        }
                    `}</style>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                            <Nav variant="pills" className="gap-2 flex-wrap status-filter">
                                <Nav.Item>
                                    <Nav.Link eventKey="pending">
                                        <span className="filter-label" style={{color: "black"}}>Chờ xác nhận</span>
                                        <Badge bg="warning" text="dark" className="ms-1">
                                            {bookings.pending.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="confirmed">
                                        <span className="filter-label" style={{color: "black"}}>Đã xác nhận</span>
                                        <Badge bg="info" text="dark" className="ms-1">
                                            {bookings.confirmed.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="completed">
                                        <span className="filter-label" style={{color: "black"}}>Đã hoàn thành</span>
                                        <Badge bg="success" text="dark" className="ms-1">
                                            {bookings.completed.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="expired">
                                        <span className="filter-label" style={{color: "black"}}>Đã qua hạn</span>
                                        <Badge bg="secondary" className="ms-1">
                                            {bookings.expired.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Tab.Container>
                    
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Tab.Container activeKey={activeTab}>
                        <Tab.Content>
                            <Tab.Pane eventKey="pending">
                                {bookings.pending.length > 0 ? (
                                    <div className="p-4">
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                            
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
                                            <h5 className="text-muted">Không còn yêu cầu nào cần xử lý</h5>
                                            <p className="text-muted">Các yêu cầu đặt lịch mới sẽ hiển thị ở đây</p>
                                        </div>
                                    </div>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="confirmed">
                                {bookings.confirmed.length > 0 ? (
                                    <div className="p-4">
                                        
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
                            <Tab.Pane eventKey="expired">
                                {bookings.expired.length > 0 ? (
                                    <div className="p-4">
                                         
                                
                                        {renderBookingCards(bookings.expired)}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-check-circle display-1 text-success mb-3"></i>
                                            <h5 className="text-muted">Không có lịch nào bị qua hạn</h5>
                                            <p className="text-muted">Hãy tiếp tục xử lý lịch hẹn kịp thời</p>
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
                                            <p className="mb-1">{getServiceLabel(selectedBooking.service)}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Ngày:</label>
                                            <p className="mb-1">{formatDateOnly(selectedBooking.date)}</p>
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
                                onClick={() => handleBookingAction(selectedBooking.id, 'CONFIRMED')}
                            >
                                <i className="bi bi-check me-2"></i>Xác nhận
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    setCancelBookingId(selectedBooking.id);
                                    setShowDetailModal(false);
                                    setShowReasonModal(true);
                                }}
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

            <Modal show={showReasonModal} onHide={closeReasonModal}>
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
                <Button variant="secondary" onClick={closeReasonModal}>
                Đóng
                </Button>
                <Button variant="danger" onClick={handleSubmitCancel} disabled={!cancelReason.trim()}>
                Hủy lịch
                </Button>
            </Modal.Footer>
            </Modal>

            <style jsx>{`
                .stat-icon.danger {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
                }

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