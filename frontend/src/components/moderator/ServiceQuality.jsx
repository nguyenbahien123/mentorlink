import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { FiBarChart2, FiDownload, FiChevronRight } from 'react-icons/fi';

const ServiceQuality = () => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);

    const handleViewReport = (reportName) => {
        setCurrentReport(reportName);
        setShowReportModal(true);
    };

    // Sample data for the charts
    const ratingData = {
        labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'],
        datasets: [
            {
                label: 'Đánh giá trung bình',
                data: [4.5, 4.6, 4.5, 4.7, 4.6, 4.7],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const responseData = {
        labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'],
        datasets: [
            {
                label: 'Tỷ lệ phản hồi',
                data: [95, 96, 97, 96, 98, 98],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const bookingData = {
        labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'],
        datasets: [
            {
                label: 'Thành công',
                data: [150, 180, 200, 220, 250, 270],
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
            },
            {
                label: 'Thất bại',
                data: [20, 18, 15, 17, 14, 12],
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            }
        }
    };

    const bookingOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    return (
        <>
            <Card className="quality-panel">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Giám sát chất lượng dịch vụ</h5>
                    <div>
                        <Button variant="outline-primary" size="sm">
                            <FiDownload className="me-1" /> Xuất báo cáo
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="quality-stats">
                        <Row>
                            <Col md={4}>
                                <div className="stat-card">
                                    <h2>4.7/5</h2>
                                    <p>Đánh giá trung bình</p>
                                    <div className="progress">
                                        <div className="progress-bar bg-success" style={{ width: '94%' }}></div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="stat-card">
                                    <h2>98%</h2>
                                    <p>Tỷ lệ phản hồi</p>
                                    <div className="progress">
                                        <div className="progress-bar bg-primary" style={{ width: '98%' }}></div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="stat-card">
                                    <h2>92%</h2>
                                    <p>Tỷ lệ đặt lịch thành công</p>
                                    <div className="progress">
                                        <div className="progress-bar bg-info" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="chart-section mt-4">
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h6 className="mb-0">Xu hướng đánh giá</h6>
                                </Card.Header>
                                <Card.Body className="text-center py-5">
                                    <p className="mb-0 text-muted">Biểu đồ xu hướng đánh giá sẽ hiển thị ở đây</p>
                                </Card.Body>
                            </Card>

                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header className="bg-light">
                                            <h6 className="mb-0">Tỷ lệ phản hồi</h6>
                                        </Card.Header>
                                        <Card.Body className="text-center py-5">
                                            <p className="mb-0 text-muted">Biểu đồ tỷ lệ phản hồi sẽ hiển thị ở đây</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header className="bg-light">
                                            <h6 className="mb-0">Thống kê đặt lịch</h6>
                                        </Card.Header>
                                        <Card.Body className="text-center py-5">
                                            <p className="mb-0 text-muted">Biểu đồ thống kê đặt lịch sẽ hiển thị ở đây</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        <div className="recent-reports mt-4">
                            <h6 className="border-bottom pb-2">Báo cáo gần đây</h6>
                            <div className="report-item">
                                <div className="d-flex justify-content-between">
                                    <h6>Đánh giá hiệu quả buổi mentoring</h6>
                                    <span className="text-muted">30/09/2025</span>
                                </div>
                                <p className="small">20 mentor có đánh giá dưới 4 sao trong tháng qua</p>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewReport('mentoring')}
                                    >
                                        Xem chi tiết <FiChevronRight />
                                    </Button>
                                </div>
                            </div>
                            <div className="report-item">
                                <div className="d-flex justify-content-between">
                                    <h6>Thống kê phản hồi khách hàng</h6>
                                    <span className="text-muted">25/09/2025</span>
                                </div>
                                <p className="small">85% khách hàng hài lòng với trải nghiệm mentoring</p>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewReport('feedback')}
                                    >
                                        Xem chi tiết <FiChevronRight />
                                    </Button>
                                </div>
                            </div>
                            <div className="report-item">
                                <div className="d-flex justify-content-between">
                                    <h6>Báo cáo chuyên ngành được quan tâm</h6>
                                    <span className="text-muted">20/09/2025</span>
                                </div>
                                <p className="small">CNTT, Marketing, và Kinh doanh là 3 lĩnh vực được tìm kiếm nhiều nhất</p>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewReport('fields')}
                                    >
                                        Xem chi tiết <FiChevronRight />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card.Body>
                <Card.Footer className="bg-light">
                    <Button variant="link" className="text-decoration-none p-0">
                        Xem tất cả báo cáo <FiChevronRight />
                    </Button>
                </Card.Footer>
            </Card>

            {/* Report Modal */}
            <Modal
                show={showReportModal}
                onHide={() => setShowReportModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentReport === 'mentoring' && 'Đánh giá hiệu quả buổi mentoring'}
                        {currentReport === 'feedback' && 'Thống kê phản hồi khách hàng'}
                        {currentReport === 'fields' && 'Báo cáo chuyên ngành được quan tâm'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentReport === 'mentoring' && (
                        <div>
                            <p>Chi tiết về 20 mentor có đánh giá dưới 4 sao trong tháng qua:</p>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Mentor ID</th>
                                        <th>Tên</th>
                                        <th>Chuyên ngành</th>
                                        <th>Đánh giá TB</th>
                                        <th>Số buổi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>MT1023</td>
                                        <td>Nguyễn Văn A</td>
                                        <td>CNTT</td>
                                        <td>3.5</td>
                                        <td>12</td>
                                    </tr>
                                    <tr>
                                        <td>MT1045</td>
                                        <td>Trần Thị B</td>
                                        <td>Marketing</td>
                                        <td>3.7</td>
                                        <td>8</td>
                                    </tr>
                                    <tr>
                                        <td>MT1078</td>
                                        <td>Lê Văn C</td>
                                        <td>Tài chính</td>
                                        <td>3.8</td>
                                        <td>15</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p>Đề xuất biện pháp cải thiện:</p>
                            <ul>
                                <li>Tổ chức buổi đào tạo kỹ năng mentoring cho các mentor có đánh giá thấp</li>
                                <li>Xem xét lại quy trình phân bổ mentee cho mentor</li>
                                <li>Thu thập phản hồi chi tiết từ mentee để hiểu rõ nguyên nhân</li>
                            </ul>
                        </div>
                    )}

                    {currentReport === 'feedback' && (
                        <div>
                            <p>Thống kê chi tiết phản hồi từ khách hàng:</p>
                            <div className="mb-4 text-center py-5 bg-light" style={{ height: '300px' }}>
                                <p className="mb-0 text-muted">Biểu đồ phản hồi khách hàng sẽ hiển thị ở đây</p>
                            </div>
                            <p>Các điểm được đánh giá cao:</p>
                            <ul>
                                <li>Chất lượng mentor (92%)</li>
                                <li>Sự linh hoạt trong lịch học (88%)</li>
                                <li>Nền tảng trực tuyến dễ sử dụng (85%)</li>
                            </ul>
                            <p>Các điểm cần cải thiện:</p>
                            <ul>
                                <li>Quy trình thanh toán (25%)</li>
                                <li>Hệ thống hỗ trợ trực tuyến (18%)</li>
                                <li>Khả năng tìm kiếm mentor phù hợp (15%)</li>
                            </ul>
                        </div>
                    )}

                    {currentReport === 'fields' && (
                        <div>
                            <p>Thống kê các chuyên ngành được quan tâm nhiều nhất:</p>
                            <div className="mb-4 text-center py-5 bg-light">
                                <p className="mb-0 text-muted">Biểu đồ chuyên ngành được quan tâm sẽ hiển thị ở đây</p>
                            </div>
                            <p>Phân tích xu hướng:</p>
                            <ul>
                                <li>CNTT: Tăng 15% so với tháng trước, tập trung vào AI và Phát triển Web</li>
                                <li>Marketing: Tăng 8%, chủ yếu là Digital Marketing và Content Strategy</li>
                                <li>Kinh doanh: Ổn định, tập trung vào kỹ năng đàm phán và quản lý dự án</li>
                            </ul>
                            <p>Đề xuất:</p>
                            <ul>
                                <li>Bổ sung thêm mentor cho các lĩnh vực có nhu cầu cao</li>
                                <li>Phát triển các khóa học ngắn cho các chủ đề được quan tâm nhiều</li>
                                <li>Tạo các chương trình mentoring theo nhóm cho các chuyên ngành phổ biến</li>
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary">
                        <FiDownload className="me-1" /> Tải báo cáo
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ServiceQuality;