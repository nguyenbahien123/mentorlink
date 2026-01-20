import React, { useState } from 'react';
import {
    Card, Row, Col, Nav, Tab, Table, Badge
} from 'react-bootstrap';
import {
    FaChartLine, FaUsers, FaMoneyBillWave, FaStar,
    FaCalendarAlt, FaArrowUp
} from 'react-icons/fa';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [dateRange, setDateRange] = useState('30days');

    // Mock data - thay thế bằng API call thực tế
    const overviewStats = {
        totalUsers: 1234,
        totalMentors: 156,
        totalBookings: 2890,
        totalRevenue: 1250000000,
        newUsersThisMonth: 89,
        newMentorsThisMonth: 12,
        bookingsThisMonth: 234,
        revenueThisMonth: 125000000,
        growthRates: {
            users: 12.5,
            mentors: 8.3,
            bookings: 15.2,
            revenue: 18.7
        }
    };

    const userGrowthData = {
        labels: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1'],
        datasets: [
            {
                label: 'Khách hàng mới',
                data: [65, 78, 90, 81, 85, 95, 89],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: 'Mentor mới',
                data: [8, 12, 15, 10, 14, 18, 12],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }
        ]
    };

    const revenueData = {
        labels: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1'],
        datasets: [
            {
                label: 'Doanh thu (triệu VNĐ)',
                data: [85, 92, 110, 98, 125, 140, 125],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                ]
            }
        ]
    };

    const bookingStatusData = {
        labels: ['Hoàn thành', 'Đã xác nhận', 'Chờ xác nhận', 'Đã hủy'],
        datasets: [
            {
                data: [1850, 650, 280, 110],
                backgroundColor: [
                    '#28a745',
                    '#17a2b8',
                    '#ffc107',
                    '#dc3545'
                ]
            }
        ]
    };

    const topMentorsData = [
        {
            id: 1,
            name: 'Nguyễn Văn An',
            bookings: 45,
            revenue: 22500000,
            rating: 4.9,
            completionRate: 96
        },
        {
            id: 2,
            name: 'Trần Thị Bình',
            bookings: 38,
            revenue: 19000000,
            rating: 4.8,
            completionRate: 94
        },
        {
            id: 3,
            name: 'Lê Minh Hoàng',
            bookings: 32,
            revenue: 16000000,
            rating: 4.7,
            completionRate: 89
        },
        {
            id: 4,
            name: 'Phạm Thị Lan',
            bookings: 29,
            revenue: 14500000,
            rating: 4.9,
            completionRate: 98
        },
        {
            id: 5,
            name: 'Vũ Minh Tâm',
            bookings: 25,
            revenue: 12500000,
            rating: 4.6,
            completionRate: 92
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const chartOptions = {
        responsive: true,
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
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="analytics">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Báo cáo & thống kê</h4>
                    <p className="text-muted mb-0">Tổng quan hiệu suất và số liệu kinh doanh</p>
                </div>
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="90days">90 ngày qua</option>
                        <option value="1year">1 năm qua</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-primary border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng người dùng</h6>
                                    <h3 className="mb-0 text-primary">{overviewStats.totalUsers.toLocaleString()}</h3>
                                    <div className="d-flex align-items-center mt-1">
                                        <FaArrowUp className="text-success me-1" />
                                        <span className="text-success small">+{overviewStats.growthRates.users}%</span>
                                    </div>
                                </div>
                                <div className="stats-icon bg-primary">
                                    <FaUsers />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-success border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng mentor</h6>
                                    <h3 className="mb-0 text-success">{overviewStats.totalMentors}</h3>
                                    <div className="d-flex align-items-center mt-1">
                                        <FaArrowUp className="text-success me-1" />
                                        <span className="text-success small">+{overviewStats.growthRates.mentors}%</span>
                                    </div>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaStar />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-info border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng booking</h6>
                                    <h3 className="mb-0 text-info">{overviewStats.totalBookings.toLocaleString()}</h3>
                                    <div className="d-flex align-items-center mt-1">
                                        <FaArrowUp className="text-success me-1" />
                                        <span className="text-success small">+{overviewStats.growthRates.bookings}%</span>
                                    </div>
                                </div>
                                <div className="stats-icon bg-info">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng doanh thu</h6>
                                    <h4 className="mb-0 text-warning">{formatCurrency(overviewStats.totalRevenue)}</h4>
                                    <div className="d-flex align-items-center mt-1">
                                        <FaArrowUp className="text-success me-1" />
                                        <span className="text-success small">+{overviewStats.growthRates.revenue}%</span>
                                    </div>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaMoneyBillWave />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="overview">
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            <FaChartLine className="me-2" />
                            Tổng quan
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="users">
                            <FaUsers className="me-2" />
                            Người dùng
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="revenue">
                            <FaMoneyBillWave className="me-2" />
                            Doanh thu
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="mentors">
                            <FaStar className="me-2" />
                            Mentor
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Overview Tab */}
                    <Tab.Pane eventKey="overview">
                        <Row>
                            <Col md={8}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6 className="mb-0">Tăng trưởng người dùng</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Line data={userGrowthData} options={chartOptions} />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6 className="mb-0">Trạng thái booking</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Doughnut data={bookingStatusData} options={doughnutOptions} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">Top mentor xuất sắc</h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Mentor</th>
                                            <th>Số booking</th>
                                            <th>Doanh thu</th>
                                            <th>Đánh giá</th>
                                            <th>Tỷ lệ hoàn thành</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topMentorsData.map((mentor, index) => (
                                            <tr key={mentor.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Badge bg="primary" className="me-2">#{index + 1}</Badge>
                                                        <span className="fw-medium">{mentor.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-medium">{mentor.bookings}</span>
                                                </td>
                                                <td>
                                                    <span className="text-success fw-medium">
                                                        {formatCurrency(mentor.revenue)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaStar className="text-warning me-1" />
                                                        <span>{mentor.rating}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={mentor.completionRate >= 95 ? 'success' : mentor.completionRate >= 90 ? 'warning' : 'danger'}>
                                                        {mentor.completionRate}%
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Users Tab */}
                    <Tab.Pane eventKey="users">
                        <Row>
                            <Col md={12}>
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0">Thống kê người dùng theo thời gian</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Line data={userGrowthData} options={chartOptions} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Revenue Tab */}
                    <Tab.Pane eventKey="revenue">
                        <Row>
                            <Col md={12}>
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0">Doanh thu theo tháng</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Bar data={revenueData} options={chartOptions} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Mentors Tab */}
                    <Tab.Pane eventKey="mentors">
                        <Row>
                            <Col md={8}>
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0">Chi tiết top mentor</h6>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <Table responsive hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Xếp hạng</th>
                                                    <th>Tên mentor</th>
                                                    <th>Số booking</th>
                                                    <th>Doanh thu</th>
                                                    <th>Đánh giá</th>
                                                    <th>Tỷ lệ hoàn thành</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topMentorsData.map((mentor, index) => (
                                                    <tr key={mentor.id}>
                                                        <td>
                                                            <Badge bg={
                                                                index === 0 ? 'warning' :
                                                                    index === 1 ? 'secondary' :
                                                                        index === 2 ? 'dark' : 'primary'
                                                            }>
                                                                #{index + 1}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <span className="fw-medium">{mentor.name}</span>
                                                        </td>
                                                        <td>
                                                            <span>{mentor.bookings}</span>
                                                        </td>
                                                        <td>
                                                            <span className="text-success">
                                                                {formatCurrency(mentor.revenue)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <FaStar className="text-warning me-1" />
                                                                <span>{mentor.rating}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                                                                    <div
                                                                        className="progress-bar bg-success"
                                                                        style={{ width: `${mentor.completionRate}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="small">{mentor.completionRate}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0">Thống kê mentor</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Mentor hoạt động</span>
                                                <span className="fw-medium">89%</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar bg-success" style={{ width: '89%' }}></div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Đánh giá trung bình</span>
                                                <span className="fw-medium">4.7/5</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar bg-warning" style={{ width: '94%' }}></div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Tỷ lệ hoàn thành</span>
                                                <span className="fw-medium">93%</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar bg-info" style={{ width: '93%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Mentor mới tháng này</span>
                                                <span className="fw-medium">12</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};

export default Analytics;