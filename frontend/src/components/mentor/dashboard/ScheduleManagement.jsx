import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';

const ScheduleManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

    // State cho weekly schedule (7 ngày x 3 khung giờ)
    // 0: không có lịch, 1: trống (có thể đặt), 2: đã đặt
    const [weeklySchedule, setWeeklySchedule] = useState(() => {
        // Mock data: tạo lịch mẫu cho tuần
        const schedule = Array(3).fill(null).map(() => Array(7).fill(0));

        // Mock một số slot có lịch
        schedule[0][1] = 1; // T2 08:00 - Trống
        schedule[0][2] = 2; // T3 08:00 - Đã đặt
        schedule[0][4] = 1; // T5 08:00 - Trống
        schedule[0][5] = 2; // T6 08:00 - Đã đặt
        schedule[0][6] = 1; // T7 08:00 - Trống

        schedule[1][0] = 1; // CN 14:00 - Trống
        schedule[1][1] = 1; // T2 14:00 - Trống
        schedule[1][2] = 1; // T3 14:00 - Trống
        schedule[1][3] = 1; // T4 14:00 - Trống
        schedule[1][4] = 1; // T5 14:00 - Trống
        schedule[1][5] = 2; // T6 14:00 - Đã đặt
        schedule[1][6] = 2; // T7 14:00 - Đã đặt

        schedule[2][0] = 2; // CN 19:00 - Đã đặt
        schedule[2][1] = 1; // T2 19:00 - Trống
        schedule[2][2] = 2; // T3 19:00 - Đã đặt
        schedule[2][3] = 1; // T4 19:00 - Trống
        schedule[2][4] = 1; // T5 19:00 - Trống
        schedule[2][5] = 2; // T6 19:00 - Đã đặt
        schedule[2][6] = 1; // T7 19:00 - Trống

        return schedule;
    });

    // Tạo các slot 1 tiếng từ 8h-22h (14 slots total)
    const generateHourlySlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 21; hour++) {
            slots.push({
                id: hour,
                hour: hour,
                timeString: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
                label: `${hour}h - ${hour + 1}h`
            });
        }
        return slots;
    };

    const availableHourlySlots = generateHourlySlots();

    // Mock data cho lịch làm việc - mentor tự chọn các khung giờ linh hoạt
    const schedules = [
        {
            id: 1,
            date: '2024-01-15',
            dayOfWeek: 'Thứ 2',
            timeSlots: [
                { id: 1, hour: 9, isBooked: false, customerName: null },
                { id: 2, hour: 10, isBooked: true, customerName: 'Nguyễn Văn A' },
                { id: 3, hour: 20, isBooked: false, customerName: null },
                { id: 4, hour: 21, isBooked: false, customerName: null }
            ]
        },
        {
            id: 2,
            date: '2024-01-16',
            dayOfWeek: 'Thứ 3',
            timeSlots: [
                { id: 5, hour: 8, isBooked: false, customerName: null },
                { id: 6, hour: 14, isBooked: true, customerName: 'Trần Thị B' },
                { id: 7, hour: 19, isBooked: false, customerName: null }
            ]
        },
        {
            id: 3,
            date: '2024-01-17',
            dayOfWeek: 'Thứ 4',
            timeSlots: [
                { id: 8, hour: 12, isBooked: false, customerName: null },
                { id: 9, hour: 15, isBooked: false, customerName: null },
                { id: 10, hour: 16, isBooked: true, customerName: 'Lê Văn C' },
                { id: 11, hour: 18, isBooked: false, customerName: null }
            ]
        }
    ];

    const formatTimeSlot = (hour) => {
        return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
    };

    const getTimeCategory = (hour) => {
        if (hour >= 8 && hour <= 11) return { category: 'Sáng', color: 'success' };
        if (hour >= 12 && hour <= 17) return { category: 'Chiều', color: 'primary' };
        if (hour >= 18 && hour <= 21) return { category: 'Tối', color: 'warning' };
        return { category: 'Khác', color: 'secondary' };
    };

    const handleTimeSlotToggle = (slotId) => {
        setSelectedTimeSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(id => id !== slotId)
                : [...prev, slotId]
        );
    };

    const handleCreateSchedule = () => {
        // Logic tạo lịch làm việc
        console.log('Creating schedule for:', selectedDate, selectedTimeSlots);
        setShowCreateModal(false);
        setSelectedDate('');
        setSelectedTimeSlots([]);
    };

    const handleDeleteSchedule = (scheduleId) => {
        // Logic xóa lịch làm việc
        console.log('Deleting schedule:', scheduleId);
    };

    // Xử lý toggle slot trong weekly schedule
    const handleSlotToggle = (timeIndex, dayIndex) => {
        setWeeklySchedule(prev => {
            const newSchedule = prev.map(row => [...row]);
            const currentStatus = newSchedule[timeIndex][dayIndex];

            // Chỉ toggle giữa 0 (không có lịch) và 1 (trống)
            // Không thể click vào slot đã đặt (status = 2)
            if (currentStatus === 2) return prev; // Đã đặt - không thể thay đổi

            newSchedule[timeIndex][dayIndex] = currentStatus === 0 ? 1 : 0;
            return newSchedule;
        });
    };

    // Lấy trạng thái của slot
    const getSlotStatus = (timeIndex, dayIndex) => {
        const status = weeklySchedule[timeIndex][dayIndex];
        switch (status) {
            case 0: return 'unavailable';
            case 1: return 'available';
            case 2: return 'booked';
            default: return 'unavailable';
        }
    };

    // Lấy text hiển thị cho slot
    const getSlotText = (status) => {
        switch (status) {
            case 'available': return 'Trống';
            case 'booked': return 'Đã đặt';
            case 'unavailable': return '';
            default: return '';
        }
    };

    return (
        <div className="schedule-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý lịch làm việc</h3>
                    <p className="text-muted mb-0">
                        Quản lý lịch tuần với 3 khung giờ cố định: 8h, 14h, 19h
                        <br />
                        <small className="text-info">
                            <i className="bi bi-info-circle me-1"></i>
                            Click vào các ô để bật/tắt khung giờ có thể đặt lịch
                        </small>
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo lịch mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-clock"></i>
                            </div>
                            <div className="stat-value">
                                {schedules.reduce((total, schedule) => total + schedule.timeSlots.length, 0)}
                            </div>
                            <p className="stat-label">Slot đã tạo</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div className="stat-value">
                                {schedules.reduce((total, schedule) =>
                                    total + schedule.timeSlots.filter(slot => slot.isBooked).length, 0
                                )}
                            </div>
                            <p className="stat-label">Đã được đặt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-calendar-plus"></i>
                            </div>
                            <div className="stat-value">
                                {schedules.reduce((total, schedule) =>
                                    total + schedule.timeSlots.filter(slot => !slot.isBooked).length, 0
                                )}
                            </div>
                            <p className="stat-label">Còn trống</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-graph-up"></i>
                            </div>
                            <div className="stat-value">
                                {Math.round(
                                    (schedules.reduce((total, schedule) =>
                                        total + schedule.timeSlots.filter(slot => slot.isBooked).length, 0
                                    ) / schedules.reduce((total, schedule) => total + schedule.timeSlots.length, 0)) * 100
                                )}%
                            </div>
                            <p className="stat-label">Tỷ lệ lấp đầy</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Schedule Table */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <h5 className="mb-0">Lịch làm việc tuần này</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table className="custom-table mb-0">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Thứ</th>
                                <th>Khung giờ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                schedule.timeSlots.map((timeSlot, index) => {
                                    const timeCategory = getTimeCategory(timeSlot.hour);
                                    return (
                                        <tr key={`${schedule.id}-${timeSlot.id}`}>
                                            {index === 0 && (
                                                <>
                                                    <td rowSpan={schedule.timeSlots.length}>
                                                        <div className="fw-medium">{schedule.date}</div>
                                                    </td>
                                                    <td rowSpan={schedule.timeSlots.length}>
                                                        <Badge bg="light" text="dark">{schedule.dayOfWeek}</Badge>
                                                    </td>
                                                </>
                                            )}
                                            <td>
                                                <div>
                                                    <div className="d-flex align-items-center">
                                                        <Badge bg={timeCategory.color} className="me-2 small">
                                                            {timeCategory.category}
                                                        </Badge>
                                                        <span className="fw-medium">
                                                            {formatTimeSlot(timeSlot.hour)}
                                                        </span>
                                                    </div>
                                                    {timeSlot.isBooked && timeSlot.customerName && (
                                                        <small className="text-info">
                                                            <i className="bi bi-person me-1"></i>
                                                            {timeSlot.customerName}
                                                        </small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {timeSlot.isBooked ? (
                                                    <Badge bg="success">
                                                        <i className="bi bi-check-circle me-1"></i>
                                                        Đã đặt
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="outline-success" className="text-success border border-success">
                                                        <i className="bi bi-calendar-plus me-1"></i>
                                                        Còn trống
                                                    </Badge>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    {timeSlot.isBooked ? (
                                                        <Button variant="outline-info" size="sm" title="Xem chi tiết booking">
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline-primary" size="sm" title="Chỉnh sửa slot">
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteSchedule(timeSlot.id)}
                                                        disabled={timeSlot.isBooked}
                                                        title={timeSlot.isBooked ? "Không thể xóa slot đã được đặt" : "Xóa slot"}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Create Schedule Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo lịch làm việc mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn ngày <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Chọn khung giờ rảnh <span className="text-danger">*</span></Form.Label>
                            <p className="small text-muted mb-3">
                                Chọn các khung giờ 1 tiếng bạn có thể tư vấn. Học viên sẽ thấy và có thể đặt lịch trong những khung giờ này.
                            </p>

                            {/* Quick Select Buttons */}
                            <div className="mb-3 d-flex gap-2 flex-wrap">
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => {
                                        const morningSlots = availableHourlySlots.filter(slot => slot.hour >= 8 && slot.hour <= 11).map(slot => slot.id);
                                        setSelectedTimeSlots(prev => [...new Set([...prev, ...morningSlots])]);
                                    }}
                                >
                                    + Buổi sáng (8h-12h)
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                        const afternoonSlots = availableHourlySlots.filter(slot => slot.hour >= 12 && slot.hour <= 17).map(slot => slot.id);
                                        setSelectedTimeSlots(prev => [...new Set([...prev, ...afternoonSlots])]);
                                    }}
                                >
                                    + Buổi chiều (12h-18h)
                                </Button>
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => {
                                        const eveningSlots = availableHourlySlots.filter(slot => slot.hour >= 18 && slot.hour <= 21).map(slot => slot.id);
                                        setSelectedTimeSlots(prev => [...new Set([...prev, ...eveningSlots])]);
                                    }}
                                >
                                    + Buổi tối (18h-22h)
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setSelectedTimeSlots([])}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>

                            {/* Individual Time Slots */}
                            <div className="time-slot-grid">
                                <Row>
                                    {availableHourlySlots.map((slot) => {
                                        const timeCategory = getTimeCategory(slot.hour);
                                        return (
                                            <Col md={6} lg={4} key={slot.id} className="mb-2">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`slot-${slot.id}`}
                                                        checked={selectedTimeSlots.includes(slot.id)}
                                                        onChange={() => handleTimeSlotToggle(slot.id)}
                                                    />
                                                    <label className="form-check-label d-flex align-items-center" htmlFor={`slot-${slot.id}`}>
                                                        <Badge bg={timeCategory.color} className="me-2 small">
                                                            {timeCategory.category}
                                                        </Badge>
                                                        <span className="fw-medium">{slot.timeString}</span>
                                                    </label>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>

                            {selectedTimeSlots.length > 0 && (
                                <div className="mt-3 p-3 bg-light rounded">
                                    <small className="text-success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Đã chọn {selectedTimeSlots.length} khung giờ
                                    </small>
                                </div>
                            )}
                        </Form.Group>

                        <Alert variant="info" className="d-flex align-items-center">
                            <i className="bi bi-info-circle me-2"></i>
                            <div>
                                <small>
                                    Lưu ý: Sau khi tạo lịch, học viên có thể đặt lịch trong các khung giờ này.
                                    Bạn chỉ có thể xóa lịch khi chưa có ai đặt.
                                </small>
                            </div>
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateSchedule}
                        disabled={!selectedDate || selectedTimeSlots.length === 0}
                    >
                        Tạo lịch
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Weekly Schedule Table */}
            <Card className="dashboard-card mt-4">
                <Card.Header className="bg-transparent border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Lịch tuần</h5>
                        <div className="d-flex gap-2">
                            <Button variant="outline-secondary" size="sm">
                                <i className="bi bi-chevron-left"></i>
                            </Button>
                            <Button variant="outline-light" size="sm" className="bg-light text-dark border-0">
                                Tuần này
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                                <i className="bi bi-chevron-right"></i>
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="weekly-schedule-table">
                        <Table className="mb-0" style={{ tableLayout: 'fixed' }}>
                            {/* Header với ngày */}
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '80px' }} className="text-center py-3"></th>
                                    {[
                                        { day: 'CN', date: 8 },
                                        { day: 'T2', date: 9 },
                                        { day: 'T3', date: 10 },
                                        { day: 'T4', date: 11 },
                                        { day: 'T5', date: 12 },
                                        { day: 'T6', date: 13 },
                                        { day: 'T7', date: 14 }
                                    ].map((dayInfo, index) => (
                                        <th key={index} className="text-center py-3">
                                            <div className="day-header">
                                                <div className="day-name text-muted small fw-medium">{dayInfo.day}</div>
                                                <div className="day-number fw-bold fs-5">{dayInfo.date}</div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Body với các khung giờ */}
                            <tbody>
                                {/* 08:00 */}
                                <tr>
                                    <td className="time-label text-center py-3 text-muted fw-medium">08:00</td>
                                    {[...Array(7)].map((_, dayIndex) => (
                                        <td key={dayIndex} className="p-2">
                                            <div
                                                className={`time-slot ${getSlotStatus(0, dayIndex)}`}
                                                onClick={() => handleSlotToggle(0, dayIndex)}
                                            >
                                                {getSlotText(getSlotStatus(0, dayIndex))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* 14:00 */}
                                <tr>
                                    <td className="time-label text-center py-3 text-muted fw-medium">14:00</td>
                                    {[...Array(7)].map((_, dayIndex) => (
                                        <td key={dayIndex} className="p-2">
                                            <div
                                                className={`time-slot ${getSlotStatus(1, dayIndex)}`}
                                                onClick={() => handleSlotToggle(1, dayIndex)}
                                            >
                                                {getSlotText(getSlotStatus(1, dayIndex))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* 19:00 */}
                                <tr>
                                    <td className="time-label text-center py-3 text-muted fw-medium">19:00</td>
                                    {[...Array(7)].map((_, dayIndex) => (
                                        <td key={dayIndex} className="p-2">
                                            <div
                                                className={`time-slot ${getSlotStatus(2, dayIndex)}`}
                                                onClick={() => handleSlotToggle(2, dayIndex)}
                                            >
                                                {getSlotText(getSlotStatus(2, dayIndex))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    {/* Tools and Legend */}
                    <div className="p-3 bg-light border-top">
                        {/* Quick Actions */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => {
                                        setWeeklySchedule(prev => prev.map(row => row.map(() => 1)));
                                    }}
                                >
                                    <i className="bi bi-check-all me-1"></i>
                                    Mở tất cả
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        setWeeklySchedule(prev => prev.map(row => row.map(cell => cell === 2 ? 2 : 0)));
                                    }}
                                >
                                    <i className="bi bi-x-lg me-1"></i>
                                    Đóng tất cả
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                        // Chỉ mở T2-T6 (index 1-5)
                                        setWeeklySchedule(prev => prev.map(row =>
                                            row.map((cell, dayIndex) =>
                                                cell === 2 ? 2 : (dayIndex >= 1 && dayIndex <= 5 ? 1 : 0)
                                            )
                                        ));
                                    }}
                                >
                                    <i className="bi bi-calendar-week me-1"></i>
                                    Chỉ T2-T6
                                </Button>
                            </div>

                            <div className="text-muted">
                                <small>
                                    <i className="bi bi-lightning-charge text-warning me-1"></i>
                                    {weeklySchedule.flat().filter(slot => slot === 1).length} slot khả dụng
                                </small>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="d-flex justify-content-center gap-4">
                            <div className="d-flex align-items-center">
                                <div className="legend-dot available me-2"></div>
                                <small className="text-muted">Trống - Có thể đặt</small>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="legend-dot booked me-2"></div>
                                <small className="text-muted">Đã đặt</small>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="legend-dot unavailable me-2"></div>
                                <small className="text-muted">Không có lịch</small>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <style jsx>{`
                .weekly-schedule-table {
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .weekly-schedule-table table {
                    margin: 0;
                }
                
                .weekly-schedule-table th {
                    border: none;
                    background: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                }
                
                .weekly-schedule-table td {
                    border: 1px solid #e9ecef;
                    vertical-align: middle;
                }
                
                .day-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .day-name {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .day-number {
                    font-size: 1.1rem;
                    color: #212529;
                    margin-top: 2px;
                }
                
                .time-label {
                    background: #f8f9fa;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-right: 2px solid #dee2e6;
                }
                
                .time-slot {
                    height: 50px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 2px solid transparent;
                }
                
                .time-slot.available {
                    background: #d1e7dd;
                    color: #0a3622;
                    border-color: #a3cfbb;
                }
                
                .time-slot.available:hover {
                    background: #b8dcc6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(25, 135, 84, 0.2);
                }
                
                .time-slot.booked {
                    background: #f8d7da;
                    color: #58151c;
                    border-color: #f1aeb5;
                    cursor: not-allowed;
                }
                
                .time-slot.unavailable {
                    background: #f8f9fa;
                    color: #6c757d;
                    border-color: #e9ecef;
                    cursor: pointer;
                }
                
                .time-slot.unavailable:hover {
                    background: #e9ecef;
                    border-color: #71c9ce;
                    color: #495057;
                }
                
                .legend-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 2px solid;
                }
                
                .legend-dot.available {
                    background: #d1e7dd;
                    border-color: #a3cfbb;
                }
                
                .legend-dot.booked {
                    background: #f8d7da;
                    border-color: #f1aeb5;
                }
                
                .legend-dot.unavailable {
                    background: #f8f9fa;
                    border-color: #e9ecef;
                }
                
                .weekly-schedule-table tbody tr:hover {
                    background-color: rgba(113, 201, 206, 0.05);
                }
                
                @media (max-width: 768px) {
                    .day-name {
                        font-size: 0.7rem;
                    }
                    
                    .day-number {
                        font-size: 1rem;
                    }
                    
                    .time-slot {
                        height: 40px;
                        font-size: 0.75rem;
                    }
                    
                    .time-label {
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ScheduleManagement;