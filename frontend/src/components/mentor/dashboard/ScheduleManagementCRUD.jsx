import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Badge,
    Modal,
    Form,
    Alert,
    Spinner,
    ButtonGroup,
    InputGroup,
    Tabs,
    Tab,
    ListGroup
} from 'react-bootstrap';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaClock,
    FaMoneyBillWave,
    FaEye,
    FaCheck,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';
import ScheduleService from '../../../services/mentor/ScheduleService';
import TimeSlotService from '../../../services/mentor/TimeSlotService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import '../../../styles/components/ScheduleManagement.css';

/**
 * Schedule Management Component for Mentors
 * Features: CRUD operations, responsive UI, form validation
 */
const ScheduleManagement = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    
    // Try different properties to get mentorId
    const mentorId = user?.id || user?.userId || user?.mentorId || 4; // Fallback to 4 for testing

    // State management
    const [schedules, setSchedules] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        date: '',
        timeSlotIds: [],
        price: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // View state
    const [activeTab, setActiveTab] = useState('all');

    // Load data on component mount
    useEffect(() => {
        console.log('useEffect triggered with mentorId:', mentorId);
        console.log('user object:', user);
        if (mentorId) {
            loadSchedules();
            loadTimeSlots();
        } else {
            console.log('No mentorId available');
        }
    }, [mentorId]);

    // ==================== DATA LOADING ====================
    
    const loadSchedules = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading schedules for mentor:', mentorId);
            const response = await ScheduleService.getAllSchedules(mentorId);
            console.log('Schedules response:', response);
            
            if (response.respCode === '0') {
                console.log('Setting schedules:', response.data);
                setSchedules(response.data || []);
            } else {
                console.error('Error response:', response.description);
                setError(response.description || 'Lỗi khi tải danh sách lịch');
            }
        } catch (err) {
            console.error('Error loading schedules - caught exception:', err);
            setError('Không thể tải danh sách lịch');
        } finally {
            setLoading(false);
        }
    };

    const loadTimeSlots = async () => {
        try {
            console.log('Loading time slots...');
            const response = await TimeSlotService.getTimeSlots();
            console.log('Time slots response:', response);
            if (response.respCode === '0') {
                console.log('Setting time slots:', response.data);
                setTimeSlots(response.data || []);
            } else {
                console.error('Time slots error:', response.description);
            }
        } catch (err) {
            console.error('Error loading time slots - caught exception:', err);
        }
    };

    const initTimeSlots = async () => {
        try {
            console.log('Initializing time slots...');
            const response = await fetch('http://localhost:8080/api/time-slots/init', {
                method: 'POST'
            });
            const data = await response.json();
            console.log('Init time slots response:', data);
            
            if (data.respCode === '0') {
                showToast('Khởi tạo time slots thành công!', 'success');
                // Reload time slots
                loadTimeSlots();
            } else {
                showToast(data.description || 'Lỗi khởi tạo time slots', 'error');
            }
        } catch (err) {
            console.error('Error initializing time slots:', err);
            showToast('Lỗi kết nối khi khởi tạo time slots', 'error');
        }
    };

    // ==================== MODAL HANDLERS ====================
    
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedSchedule(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            timeSlotIds: [],
            price: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openEditModal = (schedule) => {
        if (!ScheduleService.canModifySchedule(schedule)) {
            showToast('Không thể chỉnh sửa lịch này', 'error');
            return;
        }
        
        setModalMode('edit');
        setSelectedSchedule(schedule);
        setFormData({
            date: schedule.date,
            timeSlotIds: schedule.timeSlots?.map(slot => slot.timeSlotId) || [],
            price: schedule.price.toString()
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openViewModal = (schedule) => {
        setModalMode('view');
        setSelectedSchedule(schedule);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSchedule(null);
        setFormData({
            date: '',
            timeSlotIds: [],
            price: ''
        });
        setFormErrors({});
    };

    // ==================== FORM HANDLERS ====================
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTimeSlotChange = (timeSlotId) => {
        setFormData(prev => {
            const newTimeSlotIds = prev.timeSlotIds.includes(timeSlotId)
                ? prev.timeSlotIds.filter(id => id !== timeSlotId)
                : [...prev.timeSlotIds, timeSlotId];
            
            return {
                ...prev,
                timeSlotIds: newTimeSlotIds
            };
        });
        
        // Clear time slot error
        if (formErrors.timeSlotIds) {
            setFormErrors(prev => ({
                ...prev,
                timeSlotIds: ''
            }));
        }
    };

    const validateForm = () => {
        const validation = ScheduleService.validateScheduleData({
            ...formData,
            price: parseFloat(formData.price)
        });
        
        const errors = {};
        validation.errors.forEach(error => {
            if (error.includes('ngày')) {
                errors.date = error;
            } else if (error.includes('khung giờ')) {
                errors.timeSlotIds = error;
            } else if (error.includes('giá')) {
                errors.price = error;
            }
        });
        
        setFormErrors(errors);
        return validation.isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setSubmitting(true);
            const submitData = {
                ...formData,
                price: parseFloat(formData.price)
            };
            
            let response;
            if (modalMode === 'create') {
                response = await ScheduleService.createSchedule(mentorId, submitData);
            } else {
                response = await ScheduleService.updateSchedule(
                    selectedSchedule.scheduleId,
                    mentorId,
                    submitData
                );
            }
            
            if (response.respCode === '0') {
                showToast(
                    modalMode === 'create' 
                        ? 'Tạo lịch thành công!' 
                        : 'Cập nhật lịch thành công!',
                    'success'
                );
                closeModal();
                loadSchedules();
            } else {
                showToast(response.description || 'Có lỗi xảy ra', 'error');
            }
        } catch (err) {
            showToast('Có lỗi xảy ra khi lưu lịch', 'error');
            console.error('Error submitting form:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // ==================== DELETE HANDLER ====================
    
    const handleDelete = async (schedule) => {
        if (!ScheduleService.canModifySchedule(schedule)) {
            showToast('Không thể xóa lịch này', 'error');
            return;
        }
        
        if (!window.confirm('Bạn có chắc chắn muốn xóa lịch này không?')) {
            return;
        }
        
        try {
            const response = await ScheduleService.deleteSchedule(
                schedule.scheduleId,
                mentorId
            );
            
            if (response.respCode === '0') {
                showToast('Xóa lịch thành công!', 'success');
                loadSchedules();
            } else {
                showToast(response.description || 'Có lỗi xảy ra khi xóa lịch', 'error');
            }
        } catch (err) {
            showToast('Có lỗi xảy ra khi xóa lịch', 'error');
            console.error('Error deleting schedule:', err);
        }
    };

    // ==================== RENDER HELPERS ====================
    
    const renderTimeSlots = (timeSlots) => {
        if (!timeSlots || timeSlots.length === 0) return '-';
        
        return timeSlots
            .sort((a, b) => a.timeStart - b.timeStart)
            .map(slot => (
                <Badge key={slot.timeSlotId} bg="primary" className="me-1 mb-1">
                    {slot.timeStart}:00 - {slot.timeEnd}:00
                </Badge>
            ));
    };

    const renderScheduleStatus = (schedule) => {
        if (schedule.isBooked) {
            return <Badge bg="success"><FaCheck /> Đã đặt</Badge>;
        }
        
        if (!ScheduleService.canModifySchedule(schedule)) {
            return <Badge bg="secondary">Đã qua</Badge>;
        }
        
        return <Badge bg="warning">Trống</Badge>;
    };

    const getFilteredSchedules = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (activeTab) {
            case 'upcoming':
                return schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate >= today;
                });
            case 'past':
                return schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate < today;
                });
            case 'booked':
                return schedules.filter(schedule => schedule.isBooked);
            default:
                return schedules;
        }
    };

    // ==================== TIME SLOT SELECTION UI ====================
    
    const renderTimeSlotSelection = () => {
        if (!timeSlots || timeSlots.length === 0) {
            return (
                <div>
                    <Form.Label>Khung giờ *</Form.Label>
                    <Alert variant="warning">
                        <div className="d-flex align-items-center">
                            <Spinner size="sm" className="me-2" />
                            Đang tải khung giờ...
                        </div>
                        <small className="d-block mt-2">
                            Nếu lâu không tải được, vui lòng liên hệ admin để khởi tạo time slots.
                        </small>
                    </Alert>
                </div>
            );
        }
        
        const groupedSlots = TimeSlotService.groupTimeSlotsByCategory(timeSlots);
        
        if (Object.keys(groupedSlots).length === 0) {
            return (
                <div>
                    <Form.Label>Khung giờ *</Form.Label>
                    <Alert variant="danger">
                        <strong>Không có khung giờ nào!</strong>
                        <div className="mt-2">
                            <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={initTimeSlots}
                            >
                                Khởi tạo Time Slots
                            </Button>
                        </div>
                    </Alert>
                </div>
            );
        }
        
        return (
            <div>
                <Form.Label>Khung giờ *</Form.Label>
                {Object.entries(groupedSlots).map(([category, slots]) => (
                    <div key={category} className="mb-3">
                        <h6 className="text-muted">
                            {TimeSlotService.getCategoryLabel(category)}
                        </h6>
                        <Row>
                            {slots.map(slot => {
                                const isSelected = formData.timeSlotIds.includes(slot.timeSlotId);
                                const isPast = TimeSlotService.isTimeSlotInPast(slot, formData.date);
                                
                                return (
                                    <Col key={slot.timeSlotId} xs={6} md={4} className="mb-2">
                                        <Button
                                            variant={isSelected ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            disabled={isPast}
                                            className="w-100"
                                            onClick={() => handleTimeSlotChange(slot.timeSlotId)}
                                        >
                                            {slot.displayText}
                                        </Button>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                ))}
                {formErrors.timeSlotIds && (
                    <div className="text-danger small">{formErrors.timeSlotIds}</div>
                )}
            </div>
        );
    };

    // ==================== MAIN RENDER ====================
    
    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container fluid className="schedule-management">
            <Row className="mb-4">
                <Col>
                    <h2>
                        <FaCalendarAlt className="me-2" />
                        Quản lí lịch làm việc
                    </h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={openCreateModal}>
                        <FaPlus className="me-2" />
                        Tạo lịch mới
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Card>
                <Card.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="all" title="Tất cả">
                            <div className="text-muted mb-1">
                                Tổng cộng: {schedules.length} lịch
                            </div>
                        </Tab>
                        <Tab eventKey="upcoming" title="Sắp tới">
                            <div className="text-muted mb-1">
                                Lịch sắp tới: {getFilteredSchedules().length} lịch
                            </div>
                        </Tab>
                        <Tab eventKey="booked" title="Đã đặt">
                            <div className="text-muted mb-1">
                                Lịch đã đặt: {getFilteredSchedules().length} lịch
                            </div>
                        </Tab>
                        <Tab eventKey="past" title="Đã qua">
                            <div className="text-muted mb-1">
                                Lịch đã qua: {getFilteredSchedules().length} lịch
                            </div>
                        </Tab>
                    </Tabs>

                    {getFilteredSchedules().length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCalendarAlt size={48} className="mb-3" />
                            <p>Chưa có lịch nào</p>
                            <Button variant="primary" onClick={openCreateModal}>
                                Tạo lịch đầu tiên
                            </Button>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Khung giờ</th>
                                    <th>Giá</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredSchedules()
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map(schedule => (
                                    <tr key={schedule.scheduleId}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaCalendarAlt className="me-2 text-muted" />
                                                {new Date(schedule.date).toLocaleDateString('vi-VN', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td>{renderTimeSlots(schedule.timeSlots)}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaMoneyBillWave className="me-2 text-success" />
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(schedule.price)}
                                            </div>
                                        </td>
                                        <td>{renderScheduleStatus(schedule)}</td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant="outline-info"
                                                    onClick={() => openViewModal(schedule)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </Button>
                                                {ScheduleService.canModifySchedule(schedule) && (
                                                    <>
                                                        <Button
                                                            variant="outline-warning"
                                                            onClick={() => openEditModal(schedule)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            onClick={() => handleDelete(schedule)}
                                                            title="Xóa"
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </>
                                                )}
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal for Create/Edit/View */}
            <Modal show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'create' && 'Tạo lịch mới'}
                        {modalMode === 'edit' && 'Chỉnh sửa lịch'}
                        {modalMode === 'view' && 'Chi tiết lịch'}
                    </Modal.Title>
                </Modal.Header>
                
                {modalMode === 'view' ? (
                    <Modal.Body>
                        {selectedSchedule && (
                            <div>
                                <Row className="mb-3">
                                    <Col sm={3}><strong>Ngày:</strong></Col>
                                    <Col>
                                        {new Date(selectedSchedule.date).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3}><strong>Khung giờ:</strong></Col>
                                    <Col>{renderTimeSlots(selectedSchedule.timeSlots)}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3}><strong>Giá:</strong></Col>
                                    <Col>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(selectedSchedule.price)}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3}><strong>Trạng thái:</strong></Col>
                                    <Col>{renderScheduleStatus(selectedSchedule)}</Col>
                                </Row>
                            </div>
                        )}
                    </Modal.Body>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            isInvalid={!!formErrors.date}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.date}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giá (VNĐ) *</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="Nhập giá..."
                                                isInvalid={!!formErrors.price}
                                                min="0"
                                                step="1000"
                                            />
                                            <InputGroup.Text>VNĐ</InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.price}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <Form.Group className="mb-3">
                                {renderTimeSlotSelection()}
                            </Form.Group>
                        </Modal.Body>
                        
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    modalMode === 'create' ? 'Tạo lịch' : 'Cập nhật'
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Modal>
        </Container>
    );
};

export default ScheduleManagement;