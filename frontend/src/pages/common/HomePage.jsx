import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../styles/components/HomePage.css';
import BannerCarousel from '../../components/common/BannerCarousel';
import SidebarAds from '../../components/common/SidebarAds'; 

const HomePage = () => {
    return (
        <div className="home-page">
            <section className="hero-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <h1 className="display-4 fw-bold text-dark mb-4">Kết nối với cố vấn chuyên môn</h1>
                            <p className="lead text-dark mb-4">
                                Nền tảng kết nối mentor và mentee hàng đầu Việt Nam với những chuyên gia đầu ngành.
                            </p>
                            <div className="d-grid gap-3 d-md-flex">
                                <Button as={Link} to="/find-mentor" size="lg" className="primary-button">
                                    Tìm Cố vấn
                                </Button>
                                <Button as={Link} to="/register-mentor" variant="outline-primary" size="lg" className="secondary-button">
                                    Trở thành Cố vấn
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center">
                            <img
                                src="/logo.svg"
                                alt="Mentor and Mentee"
                                className="img-fluid rounded hero-image"
                                style={{ maxHeight: '500px' }}
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Banner carousel (của Admin) vẫn giữ nguyên full-width */}
            <BannerCarousel />

            {/* ===== 2. BẮT ĐẦU LAYOUT MỚI (CÓ SIDEBAR) ===== */}
            <Container className="py-5">
                <Row>
                    {/* Sidebar Trái (Chỉ hiển thị trên màn hình lớn) */}
                    <Col lg={2} className="d-none d-lg-block">
                        <SidebarAds />
                    </Col>

                    {/* Nội dung chính */}
                    <Col lg={8} md={12}>
                        <section className="features-section">
                            {/* Không cần <Container> lồng bên trong nữa */}
                            <h2 className="text-center fw-bold mb-5">Tại sao chọn MentorLink?</h2>
                            <Row className="g-4">
                                <Col md={4}>
                                    <div className="feature-card">
                                        <div className="icon-wrapper mb-4">
                                            <i className="bi bi-person-check-fill"></i>
                                        </div>
                                    <h3 className="fw-bold mb-3">Cố vấn chất lượng</h3>
                                    <p>
                                        Đội ngũ cố vấn được kiểm duyệt kỹ càng với kinh nghiệm chuyên môn và học vấn từ các trường đại học hàng đầu.
                                    </p>
                                </div>
                            </Col>
                                <Col md={4}>
                                    <div className="feature-card">
                                        <div className="icon-wrapper mb-4">
                                            <i className="bi bi-calendar-check"></i>
                                        </div>
                                    <h3 className="fw-bold mb-3">Lịch hẹn linh hoạt</h3>
                                    <p>
                                        Đặt lịch dễ dàng, phù hợp với thời gian của bạn và cố vấn, với nhiều hình thức kết nối trực tuyến và trực tiếp.
                                    </p>
                                </div>
                            </Col>
                                <Col md={4}>
                                    <div className="feature-card">
                                        <div className="icon-wrapper mb-4">
                                            <i className="bi bi-graph-up"></i>
                                        </div>
                                    <h3 className="fw-bold mb-3">Phát triển kỹ năng</h3>
                                    <p>
                                        Nhận hướng dẫn cá nhân hóa để phát triển kỹ năng, sự nghiệp và đạt được mục tiêu học tập và nghề nghiệp.
                                    </p>
                                </div>
                          _ </Col>
                        </Row>
                    </section>

                    <section className="cta-section py-5">
                        <div className="text-center"> {/* Đã xóa <Container> lồng */}
                            <h2 className="fw-bold mb-4">Sẵn sàng bắt đầu hành trình của bạn?</h2>
                            <p className="lead mb-4">
                                Đăng ký ngay hôm nay để kết nối với cố vấn chuyên môn hoặc trở thành cố vấn để chia sẻ kinh nghiệm của bạn.
                            </p>
                            <Button as={Link} to="/register" size="lg" className="primary-button">
                                Đăng ký ngay
                  _       </Button>
                        </div>
                    </section>
                </Col>

                    {/* Sidebar Phải (Chỉ hiển thị trên màn hình lớn) */}
                    <Col lg={2} className="d-none d-lg-block">
                        <SidebarAds />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HomePage;