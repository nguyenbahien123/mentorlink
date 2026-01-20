import React from 'react';
import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import '../../styles/components/BecomeACounselor.css';

const BecomeACounselorPage = () => {
    return (
        <Container className="py-5">
            

            {/* Overview */}
            <Row className="mb-5">
                <Col lg={12}>
                    <Card className="overview-card bg-light">
                        <Card.Body className="p-5">
                            <h2 className="mb-4">Tổng quan</h2>
                            <p className="fs-5 mb-4">
                                <strong>Mỗi mentor là một nhà thay đổi cuộc đời</strong>
                            </p>
                            <p className="fs-5 mb-4">
                                Bạn có kinh nghiệm. Bạn có kỹ năng. Bạn muốn chia sẻ và giúp đỡ những người trẻ khác. Đó là tất cả những gì bạn cần có – chúng tôi sẽ giúp đơn giản hoá những vấn đề còn lại.
                            </p>
                            <p className="fs-5 mb-4">
                                <strong>MentorLink là một nền tảng trung gian</strong> – platform/marketplace, nơi các mentor, chuyên gia, leader chia sẻ kinh nghiệm của mình cho những người trẻ muốn phát triển kỹ năng và định hướng sự nghiệp.
                            </p>
                            <p className="fs-5 mb-4">
                                Quá trình chia sẻ kiến thức và kinh nghiệm giúp làm sáng tỏ những lựa chọn trong tương lai của những người trẻ – điều mà họ rất cần. Đó chính là vai trò của một mentor: không chỉ giáo dục, mà còn dẫn dắt, khích lệ, và giúp họ tìm ra đường đi của riêng mình.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* What You Can Do */}
            <Row className="mb-5">
                <Col lg={12}>
                    <h2 className="text-center mb-5">
                        <i className="bi bi-lightning me-2 text-warning"></i>
                        Bạn có thể làm những gì?
                    </h2>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={12}>
                    <p className="fs-5 mb-4 text-center text-muted">
                        Hoạt động của MentorLink tương tự như các nền tảng Fiverr hay Upwork – bạn mang đến kinh nghiệm của mình và chúng tôi sẽ giúp xử lý về mặt vận hành. <strong>Bạn là người làm chủ: bạn quyết định mình sẽ làm gì.</strong>
                    </p>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={6} className="mb-4">
                    <Card className="service-card h-100">
                        <Card.Body>
                            <div className="service-icon mb-3">
                                <i className="bi bi-chat-dots-fill text-primary"></i>
                            </div>
                            <h5 className="mb-3">Trả lời câu hỏi</h5>
                            <p className="text-muted">
                                Trả lời những câu hỏi từ các mentee về kinh nghiệm, lĩnh vực chuyên môn của bạn. Chia sẻ những hiểu biết quý báu của bạn.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="service-card h-100">
                        <Card.Body>
                            <div className="service-icon mb-3">
                                <i className="bi bi-person-video3 text-success"></i>
                            </div>
                            <h5 className="mb-3">Tư vấn 1-1</h5>
                            <p className="text-muted">
                                Cung cấp các buổi tư vấn cá nhân hoá cho từng người. Giúp họ giải quyết những thách thức cụ thể của riêng mình.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="service-card h-100">
                        <Card.Body>
                            <div className="service-icon mb-3">
                                <i className="bi bi-diagram-3-fill text-info"></i>
                            </div>
                            <h5 className="mb-3">Hướng dẫn dự án</h5>
                            <p className="text-muted">
                                Giúp mentee làm việc trên một dự án cụ thể hoặc thử thách. Hướng dẫn từng bước, chia sẻ best practices.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="service-card h-100">
                        <Card.Body>
                            <div className="service-icon mb-3">
                                <i className="bi bi-book-fill text-danger"></i>
                            </div>
                            <h5 className="mb-3">Chia sẻ kỹ năng</h5>
                            <p className="text-muted">
                                Dạy những kỹ năng cụ thể mà bạn giỏi: technical skills, soft skills, ngôn ngữ, v.v. Tạo khóa học riêng.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={12} className="mb-4">
                    <Card className="service-card h-100">
                        <Card.Body>
                            <div className="service-icon mb-3">
                                <i className="bi bi-compass-fill text-warning"></i>
                            </div>
                            <h5 className="mb-3">Định hướng sự nghiệp</h5>
                            <p className="text-muted">
                                Giúp mentee lập kế hoạch sự nghiệp, chuẩn bị phỏng vấn, viết CV, hoặc bất kỳ điều gì liên quan đến sự nghiệp của họ.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={12} className="text-center">
                    <p className="fs-5 text-muted">
                        <strong>Tất cả phụ thuộc vào mong muốn và khả năng của bạn.</strong> Bạn kiểm soát hoàn toàn những gì bạn muốn cung cấp.
                    </p>
                </Col>
            </Row>

            {/* Why Join */}
            <Row className="mb-5">
                <Col lg={12}>
                    <h2 className="text-center mb-5">
                        <i className="bi bi-star-fill me-2 text-primary"></i>
                        Tại sao tham gia MentorLink?
                    </h2>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={6} className="mb-4">
                    <Card className="benefit-card h-100 border-primary">
                        <Card.Body>
                            <h5 className="mb-3 text-primary">
                                <i className="bi bi-coin me-2"></i>
                                Thêm doanh thu
                            </h5>
                            <p className="text-muted">
                                Kiếm được thu nhập thêm từ kinh nghiệm của bạn. Bạn đặt giá của riêng mình và kiểm soát số lượng mentee mà bạn muốn làm việc cùng. Linh hoạt về thời gian và tỷ lệ.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="benefit-card h-100 border-success">
                        <Card.Body>
                            <h5 className="mb-3 text-success">
                                <i className="bi bi-heart-fill me-2"></i>
                                Tạo tác động
                            </h5>
                            <p className="text-muted">
                                Giúp những người trẻ tránh những sai lầm mà bạn đã gặp phải. Dẫn dắt họ trên con đường phát triển sự nghiệp. Biết rằng bạn đã thay đổi cuộc đời của ai đó là cảm giác vô giá.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="benefit-card h-100 border-info">
                        <Card.Body>
                            <h5 className="mb-3 text-info">
                                <i className="bi bi-briefcase-fill me-2"></i>
                                Xây dựng thương hiệu cá nhân
                            </h5>
                            <p className="text-muted">
                                MentorLink là một sân khấu tuyệt vời để xây dựng thương hiệu cá nhân (personal brand) của bạn. Để mọi người biết bạn là ai, bạn giỏi gì, và tại sao họ nên tin tưởng bạn.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="benefit-card h-100 border-warning">
                        <Card.Body>
                            <h5 className="mb-3 text-warning">
                                <i className="bi bi-people-fill me-2"></i>
                                Mở rộng mạng lưới
                            </h5>
                            <p className="text-muted">
                                Kết nối với những người trẻ tài năng, những mentor khác, và những người có cùng đam mê. Xây dựng mạng lưới chuyên nghiệp (professional network) mạnh mẽ.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* How It Works */}
            <Row className="mb-5">
                <Col lg={12}>
                    <h2 className="text-center mb-5">
                        <i className="bi bi-gear-fill me-2 text-secondary"></i>
                        Phương thức hoạt động
                    </h2>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={12}>
                    <div className="process-timeline">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <h5>Đăng ký & Xác minh</h5>
                            <p className="text-muted">
                                Tạo profile mentor chi tiết. Chúng tôi sẽ kiểm duyệt thông tin của bạn để đảm bảo chất lượng.
                            </p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <h5>Thiết lập dịch vụ</h5>
                            <p className="text-muted">
                                Xác định các dịch vụ bạn muốn cung cấp, giá tiền, lịch trình sẵn có của bạn.
                            </p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <h5>Nhận booking</h5>
                            <p className="text-muted">
                                Mentee sẽ tìm kiếm và booking các dịch vụ của bạn thông qua nền tảng.
                            </p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <h5>Hoàn thành công việc</h5>
                            <p className="text-muted">
                                Làm việc cùng mentee (video call, chat, email, v.v.) và hoàn thành công việc chuyên nghiệp.
                            </p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">5</div>
                            <h5>Thanh toán & Đánh giá</h5>
                            <p className="text-muted">
                                Nhận thanh toán an toàn. Mentee đánh giá chất lượng dịch vụ của bạn.
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Share Your Story */}
            <Row className="mb-5">
                <Col lg={12}>
                    <Card className="story-card bg-light">
                        <Card.Body className="p-5">
                            <h2 className="mb-4">
                                <i className="bi bi-bookmark-heart me-2 text-danger"></i>
                                Chia sẻ câu chuyện của bạn
                            </h2>
                            <p className="fs-5 mb-4">
                                Hãy chia sẻ câu chuyện của bạn – quá trình bạn trở thành những gì bạn là hôm nay. Những thách thức bạn đã vượt qua, những bài học bạn đã học được, những sai lầm bạn muốn giúp người khác tránh.
                            </p>
                            <p className="fs-5 mb-4">
                                Những câu chuyện này không chỉ giúp mentee của bạn hiểu rõ hơn về bạn, mà còn:
                            </p>
                            <ul className="fs-5 mb-4">
                                <li className="mb-2">Truyền cảm hứng cho họ</li>
                                <li className="mb-2">Khích lệ họ vượt qua những khó khăn</li>
                                <li>Giúp họ tin tưởng rằng họ cũng có thể thành công</li>
                            </ul>
                            <p className="fs-5 text-muted">
                                <strong>Một mentor tốt không chỉ chia sẻ kiến thức, mà còn chia sẻ kinh nghiệm, bài học, và tâm huyết.</strong>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

    

            {/* CTA */}
            <Row>
                <Col lg={12} className="text-center">
                    <h2 className="mb-4">Bạn đã sẵn sàng trở thành cố vấn?</h2>
                    <Button href="/register-mentor" variant="primary" size="lg" className="me-3">
                        <i className="bi bi-person-plus me-2"></i>
                        Đăng ký ngay
                    </Button>                
                </Col>
            </Row>
        </Container>
    );
};

export default BecomeACounselorPage;
