import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../../styles/components/About.css';

const AboutPage = () => {
    return (
        <Container className="py-5">
            

            {/* Vision and Mission */}
            <Row className="mb-5">
                <Col lg={6} className="mb-4">
                    <Card className="vision-mission-card h-100">
                        <Card.Body>
                            <h3 className="text-primary mb-3">
                                <i className="bi bi-binoculars me-2"></i>
                                Tầm nhìn
                            </h3>
                            <p className="lead fw-bold mb-3">
                                Trở thành nền tảng hàng đầu kết nối mentor và mentee, giúp mọi người dễ dàng tiếp cận kiến thức chuyên sâu và định hướng sự nghiệp.
                            </p>
                            <p className="text-muted">
                                Chúng tôi tin rằng mỗi người đều xứng đáng có được sự hướng dẫn từ những người đi trước, những người hiểu rõ con đường mà họ sắp bước vào.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="vision-mission-card h-100">
                        <Card.Body>
                            <h3 className="text-success mb-3">
                                <i className="bi bi-target me-2"></i>
                                Sứ mệnh
                            </h3>
                            <p className="lead fw-bold mb-3">
                                Giúp các bạn trẻ khai phá tiềm năng toàn diện thông qua việc kết nối với những mentor giàu kinh nghiệm và tâm huyết.
                            </p>
                            <p className="text-muted">
                                Chúng tôi tin rằng công nghệ có thể xoá bỏ mọi khoảng cách địa lý, giúp bạn kết nối với những mentor và chuyên gia hàng đầu không chỉ trong nước mà trên khắp thế giới.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Core Values */}
            <Row className="mb-5">
                <Col lg={12}>
                    <h2 className="text-center mb-5">
                        <i className="bi bi-gem me-2 text-warning"></i>
                        Giá trị cốt lõi
                    </h2>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="value-card text-center h-100">
                        <Card.Body>
                            <div className="value-icon mb-3">
                                <i className="bi bi-eye-fill text-primary"></i>
                            </div>
                            <h5 className="mb-3">Minh bạch</h5>
                            <p className="text-muted small">
                                Hãy hiểu rõ về những người sẽ giúp đỡ bạn. Xem profile chi tiết của mentor: học vấn, kinh nghiệm, dịch vụ, giá tiền và đánh giá từ những học sinh khác.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="value-card text-center h-100">
                        <Card.Body>
                            <div className="value-icon mb-3">
                                <i className="bi bi-lightning-fill text-success"></i>
                            </div>
                            <h5 className="mb-3">Tiện lợi</h5>
                            <p className="text-muted small">
                                Kết nối với mentor hàng đầu dễ dàng hơn bao giờ hết. Tìm kiếm, lọc, chọn mentor và làm việc online mà không bị giới hạn bởi khoảng cách địa lý.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="value-card text-center h-100">
                        <Card.Body>
                            <div className="value-icon mb-3">
                                <i className="bi bi-palette-fill text-info"></i>
                            </div>
                            <h5 className="mb-3">Đa dạng</h5>
                            <p className="text-muted small">
                                Mentor đến từ những ngành nghề đa dạng, có kinh nghiệm trong nhiều lĩnh vực khác nhau. Cho dù bạn tìm gì, bạn đều có thể tìm được.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="value-card text-center h-100">
                        <Card.Body>
                            <div className="value-icon mb-3">
                                <i className="bi bi-shield-lock-fill text-danger"></i>
                            </div>
                            <h5 className="mb-3">Bảo mật & Tín cậy</h5>
                            <p className="text-muted small">
                                Kiểm soát chặt chẽ tiến độ, chất lượng công việc, thanh toán an toàn và bảo mật thông tin. Yên tâm làm việc với mentor.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Philosophy */}
            <Row className="mb-5">
                <Col lg={12}>
                    <Card className="philosophy-card">
                        <Card.Body className="p-5">
                            <h2 className="mb-4">
                                <i className="bi bi-lightbulb me-2 text-warning"></i>
                                Triết lý của MentorLink
                            </h2>
                            <p className="fs-5 mb-4">
                                Ngày nay, việc phát triển kỹ năng và định hướng sự nghiệp không chỉ đơn thuần là tìm kiếm một khóa học hay một cuốn sách. Đây là một quá trình trải nghiệm dài hạn, nơi bạn cần được định hướng từ những người đã trải qua con đường mà bạn sắp bước vào.
                            </p>
                            <p className="fs-5 mb-4">
                                Chúng tôi tin rằng hướng dẫn tốt nhất đến từ chính những người đã thành công trong lĩnh vực mà bạn theo đuổi – những mentor đã vượt qua những thử thách mà bạn sắp phải đối mặt.
                            </p>
                            <p className="fs-5 mb-4">
                                Vì vậy, chúng tôi kết nối bạn với những mentor có kinh nghiệm này, để họ giúp bạn:
                            </p>
                            <ul className="fs-5">
                                <li className="mb-3">Xây dựng kế hoạch phát triển được cá nhân hoá phù hợp với mục tiêu và tính cách của bạn</li>
                                <li className="mb-3">Học hỏi từ các trường hợp thực tế và kinh nghiệm thực tiễn</li>
                                <li className="mb-3">Quản lý hiệu quả thời gian, tiến độ và các mục tiêu của mình</li>
                                <li>Tránh những sai lầm mà mentor đã từng gặp phải</li>
                            </ul>
                            <p className="fs-5 mt-4 text-primary fw-bold">
                                Chúng tôi mong muốn với sự hướng dẫn của những mentor tâm huyết, bạn sẽ tự tin làm chủ vận mệnh sự nghiệp của mình và đạt được những mục tiêu vượt xa sự mong đợi.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Our Story */}
            <Row className="mb-5">
                <Col lg={12}>
                    <Card className="story-card">
                        <Card.Body className="p-5">
                            <h2 className="mb-4">
                                <i className="bi bi-bookmark-heart me-2 text-danger"></i>
                                Câu chuyện của MentorLink
                            </h2>
                            <p className="fs-5 mb-4">
                                MentorLink được thành lập với mục tiêu giải quyết một bài toán đơn giản nhưng quan trọng: <strong>làm sao để những người muốn phát triển kỹ năng dễ dàng tìm được mentor phù hợp?</strong>
                            </p>
                            <p className="fs-5 mb-4">
                                Chúng tôi nhận ra rằng có rất nhiều người có kỹ năng, kinh nghiệm và đam mê muốn giúp đỡ thế hệ trẻ, nhưng không có kênh hoặc nền tảng hiệu quả để họ chia sẻ. Đồng thời, có rất nhiều bạn trẻ đang tìm kiếm sự hỗ trợ, hướng dẫn từ những người có kinh nghiệm, nhưng lại gặp khó khăn trong việc tìm kiếm.
                            </p>
                            <p className="fs-5 mb-4">
                                Chúng tôi tin rằng sự kết nối này không chỉ sẽ giúp bạn trẻ phát triển nhanh hơn, mà còn mang lại giá trị lớn cho cả mentor – họ có cơ hội chia sẻ kinh nghiệm quý báu và tạo tác động tích cực đến cộng đồng.
                            </p>
                            <p className="fs-5 mb-4">
                                Thông qua MentorLink, bạn được kết nối với các mentor đã được chúng tôi kiểm duyệt cẩn thận. Bạn được xem chi tiết về mentor – nơi họ học, làm việc, ngành nghề, expertise – và từ đó, bạn có thể chọn những người phù hợp với nhu cầu của mình.
                            </p>
                            <p className="fs-5 mb-4">
                                Với sự hỗ trợ của công nghệ, MentorLink giúp bạn kết nối và làm việc với các mentor ở bất kỳ nơi đâu. Ngoài ra, hệ thống của chúng tôi cũng cho phép bạn theo dõi tiến độ công việc, quản lý lịch trình booking, và đảm bảo chất lượng dịch vụ.
                            </p>
                            <p className="fs-5 text-primary fw-bold">
                                Cho dù bạn đang ở đâu trên con đường phát triển sự nghiệp của mình, hãy để MentorLink kết nối bạn với những người đồng hành đáng tin cậy.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

    
        </Container>
    );
};

export default AboutPage;
