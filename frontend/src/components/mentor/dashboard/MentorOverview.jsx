import React from 'react';
import { Row, Col, Card, Button, Table, Badge, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const MentorOverview = ({ mentorData }) => {
    // Mock data cho biểu đồ
    const monthlyEarningsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Thu nhập (VNĐ)',
                data: [5200000, 6800000, 7200000, 8100000, 7500000, 9200000],
                backgroundColor: 'rgba(113, 201, 206, 0.8)',
                borderColor: 'rgba(113, 201, 206, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const bookingStatusData = {
        labels: ['Đã hoàn thành', 'Đang chờ', 'Đã hủy'],
        datasets: [
            {
                data: [151, 5, 8],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    // Mock data cho lịch sắp tới
    const upcomingSessions = [
        {
            id: 1,
            customerName: 'Nguyễn Thị Lan',
            service: 'Tư vấn du học',
            date: '2024-01-15',
            time: '14:00 - 15:00',
            status: 'confirmed'
        },
        {
            id: 2,
            customerName: 'Trần Văn Đức',
            service: 'Hướng nghiệp',
            date: '2024-01-16',
            time: '10:00 - 11:00',
            status: 'pending'
        },
        {
            id: 3,
            customerName: 'Lê Thị Mai',
            service: 'Luyện thi IELTS',
            date: '2024-01-17',
            time: '16:00 - 17:00',
            status: 'confirmed'
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format currency to short format (1.5M, 2.3B, etc.)
    const formatCurrencyShort = (amount) => {
        if (!amount) return '0 đ';
        if (amount >= 1000000000) {
            return (amount / 1000000000).toFixed(2) + ' tỷ';
        }
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(2) + ' triệu';
        }
        if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return amount.toFixed(0);
    };

    return (
        <div className="mentor-overview">
            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip id="earnings-tooltip" className="custom-tooltip">
                                <div className="text-start p-2">
                                    <div className="mb-2">
                                        <small className="text-light d-block mb-1">📊 <strong>Chi tiết thu nhập</strong></small>
                                    </div>
                                    <div className="mb-1">
                                        <small className="text-light d-block">
                                            Tổng từ bookings:
                                        </small>
                                        <small className="text-white fw-bold">
                                            {formatCurrency(mentorData.totalEarnings || 0)}
                                        </small>
                                    </div>
                                    <div className="mb-1">
                                        <small className="text-light d-block">
                                            Phí nền tảng (10%):
                                        </small>
                                        <small className="text-warning fw-bold">
                                            - {formatCurrency(mentorData.platformCommission || 0)}
                                        </small>
                                    </div>
                                    <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                                    <div>
                                        <small className="text-light d-block">
                                            Thu nhập thực nhận (90%):
                                        </small>
                                        <small className="text-success fw-bold" style={{ fontSize: '1.1em' }}>
                                            ✓ {formatCurrency(mentorData.netEarnings || 0)}
                                        </small>
                                    </div>
                                </div>
                            </Tooltip>
                        }
                    >
                        <Card 
                            className="dashboard-card stat-card earnings-card" 
                            style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, rgba(113, 201, 206, 0.1) 0%, rgba(52, 152, 219, 0.1) 100%)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(113, 201, 206, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <Card.Body>
                                <div className="stat-icon primary" style={{
                                    background: 'linear-gradient(135deg, #71c9ce, #3498db)',
                                    fontSize: '1.8em'
                                }}>
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div className="stat-value" style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #71c9ce, #3498db)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    {formatCurrencyShort(mentorData.netEarnings || 0)}
                                </div>
                                <p className="stat-label" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                    Tổng Thu Nhập
                                </p>
                                <small className="text-muted d-block" style={{ fontSize: '0.85em' }}>
                                    <i className="bi bi-info-circle me-1"></i>
                                    90% sau trừ phí
                                </small>
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(113, 201, 206, 0.2)' }}>
                                    <small className="text-muted d-block" style={{ fontSize: '0.8em' }}>
                                        Đầy đủ: {formatCurrency(mentorData.netEarnings || 0)}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </OverlayTrigger>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{mentorData.completedBookings || 0}</div>
                            <p className="stat-label">Buổi đã hoàn thành</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-value">{mentorData.pendingBookings || 0}</div>
                            <p className="stat-label">Đang chờ xác nhận</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-star"></i>
                            </div>
                            <div className="stat-value">{mentorData.rating || 0}</div>
                            <p className="stat-label">Đánh giá trung bình</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row className="mb-4">
                <Col lg={8} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0">Thu nhập theo tháng</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                <Bar data={monthlyEarningsData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0">Trạng thái đặt lịch</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                <Doughnut data={bookingStatusData} options={doughnutOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Upcoming Sessions and Quick Actions */}
        </div>
    );
};

export default MentorOverview;