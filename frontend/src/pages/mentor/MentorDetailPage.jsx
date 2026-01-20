import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Spinner,
    Alert,
    Tab,
    Tabs,
    ListGroup,
    Image
} from 'react-bootstrap';
import {
    FaArrowLeft,
    FaStar,
    FaMapMarkerAlt,
    FaLinkedin,
    FaBookmark,
    FaGraduationCap,
    FaBriefcase,
    FaAward,
    FaCog,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaCheckCircle,
    FaExternalLinkAlt,
    FaGlobe
} from 'react-icons/fa';
import { Toast } from 'react-bootstrap';
import MentorService from '../../services/mentor/MentorService';
import ImageModal from '../../components/common/ImageModal';
import MentorSchedule from '../../components/mentor/MentorSchedule';
import { getCountryName, getCountryFlagUrl } from '../../utils/mentorUtils';
import '../../styles/components/MentorDetail.css'; const MentorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState({ src: '', title: '', description: '' });
    const [showBookingSuccess, setShowBookingSuccess] = useState(false);

    useEffect(() => {
        fetchMentorDetail();

        // Check if booking was successful and show toast
        const params = new URLSearchParams(location.search);
        if (params.get('bookingSuccess') === 'true') {
            setShowBookingSuccess(true);
            // Auto hide after 5 seconds
            const timer = setTimeout(() => setShowBookingSuccess(false), 5000);
            // Clean up URL param
            window.history.replaceState({}, document.title, window.location.pathname);
            return () => clearTimeout(timer);
        }
    }, [id, location.search]);

    const fetchMentorDetail = async () => {
        try {
            setLoading(true);
            const response = await MentorService.getMentorById(id);

            if (response.respCode === "0") {
                setMentor(response.data);
            } else {
                setError('Không thể tải thông tin mentor');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching mentor detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (src, title, description = '') => {
        setSelectedImage({ src, title, description });
        setShowImageModal(true);
    };

    // Utility functions to safely get arrays from mentor object
    const getExperiences = () => {
        return mentor?.experiences || mentor?.experience || mentor?.workExperiences || [];
    };

    const getServices = () => {
        return mentor?.services || mentor?.service || mentor?.mentorServices || [];
    };

    const getTests = () => {
        return mentor?.tests || mentor?.test || mentor?.certifications || mentor?.certificates || [];
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-warning" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStar key="half" className="text-warning opacity-50" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="text-muted" />);
        }

        return stars;
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải thông tin mentor...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                    <div>
                        <Button variant="outline-danger" onClick={fetchMentorDetail}>
                            Thử lại
                        </Button>
                        <Button variant="secondary" className="ms-2" onClick={() => navigate('/find-mentor')}>
                            Quay lại danh sách
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!mentor) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <Alert.Heading>Không tìm thấy mentor</Alert.Heading>
                    <p>Mentor với ID {id} không tồn tại.</p>
                    <Button variant="primary" onClick={() => navigate('/find-mentor')}>
                        Quay lại danh sách
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="mentor-detail-page">
            {/* Booking Success Toast */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999
            }}>
                <Toast
                    show={showBookingSuccess}
                    onClose={() => setShowBookingSuccess(false)}
                    delay={5000}
                    autohide
                    className="shadow"
                >
                    <Toast.Header className="bg-success text-white">
                        <strong className="me-auto">✅ Thành công</strong>
                    </Toast.Header>
                    <Toast.Body className="bg-light">
                        Đã đặt lịch thành công! Mentor sẽ xác nhận sớm.
                    </Toast.Body>
                </Toast>
            </div>

            <Container className="py-4">
                {/* Back Button */}
                <Button
                    variant="outline-primary"
                    className="mb-4 btn-friendly shadow"
                    onClick={() => navigate('/find-mentor')}
                >
                    <FaArrowLeft className="me-2" />
                    ← Quay lại danh sách mentor mentor
                </Button>

                {/* Header Profile */}
                <Card className="mb-4 shadow-sm border-0 mentor-profile-header">
                    <Card.Body className="p-4">
                        <Row className="align-items-center">
                            <Col lg={3} md={4} className="text-center">
                                <div className="mentor-avatar-large mx-auto mb-3">
                                    <Image
                                        src={mentor.avatarUrl || '/images/default-avatar.svg'}
                                        alt={mentor.fullname}
                                        className="mentor-avatar-img"
                                        fluid
                                    />
                                    <Badge
                                        bg={mentor.gender === 'M' ? 'primary' : 'pink'}
                                        className="mentor-gender-badge"
                                    >
                                        {mentor.gender === 'M' ? 'Nam' : 'Nữ'}
                                    </Badge>
                                </div>
                            </Col>

                            <Col lg={6} md={8}>
                                <h1 className="mentor-name mb-2">{mentor.fullname}</h1>

                                <div className="mentor-stats mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="me-3">
                                            {renderStars(mentor.rating)}
                                        </div>
                                        <span className="fw-bold fs-5 text-warning me-2">{mentor.rating}</span>
                                        <span className="text-muted">({mentor.numberOfBooking} lượt booking)</span>
                                    </div>

                                    <div className="mentor-contact-info">
                                        <div className="d-flex align-items-center mb-2">
                                            <FaMapMarkerAlt className="text-success me-2" />
                                            <span>{mentor.currentLocation}</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaEnvelope className="text-info me-2" />
                                            <span>{mentor.email}</span>
                                        </div>
                                        {mentor.phone && (
                                            <div className="d-flex align-items-center mb-2">
                                                <FaPhone className="text-warning me-2" />
                                                <span>{mentor.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Approved Countries Section */}
                                    {mentor.approvedCountries && mentor.approvedCountries.length > 0 && (
                                        <div className="mt-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FaGlobe className="text-primary me-2" />
                                                <span className="fw-semibold text-primary">Hỗ trợ du học:</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {mentor.approvedCountries.map((country, index) => (
                                                    <Badge
                                                        key={index}
                                                        bg="primary"
                                                        className="px-3 py-2 d-flex align-items-center"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {getCountryFlagUrl(country) ? (
                                                            <img
                                                                src={getCountryFlagUrl(country)}
                                                                alt={`${getCountryName(country)} flag`}
                                                                style={{
                                                                    width: '20px',
                                                                    height: '15px',
                                                                    marginRight: '8px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '2px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="me-2">🌍</span>
                                                        )}
                                                        {getCountryName(country)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mentor-actions d-flex gap-2 flex-wrap">
                                    {mentor.linkedinUrl && (
                                        <Button
                                            variant="outline-primary"
                                            href={mentor.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="sm"
                                        >
                                            <FaLinkedin className="me-1" />
                                            LinkedIn
                                        </Button>
                                    )}
                                    
                                </div>
                            </Col>

                            <Col lg={3} className="text-center">
                                
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Introduction */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body className="p-4">
                        <h5 className="mb-3">
                            <FaCheckCircle className="text-success me-2" />
                            Giới thiệu về mentor
                        </h5>
                        <p className="mentor-intro-text">{mentor.intro}</p>
                    </Card.Body>
                </Card>

                {/* Schedule Section - Moved above tabs */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body>
                        <MentorSchedule
                            mentorId={mentor.id}
                            mentorName={mentor.fullname}
                        />
                    </Card.Body>
                </Card>

                {/* Detailed Information Tabs */}
                <Card className="shadow border-0">
                    <Card.Body className="p-0">
                        <Tabs defaultActiveKey="education" className="custom-tabs">
                            {/* Education Tab */}
                            <Tab
                                eventKey="education"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaGraduationCap className="tab-icon" />
                                        <span>Học vấn</span>
                                        <span className="tab-count">{mentor.educations?.length || 0}</span>
                                    </span>
                                }
                            >
                                {mentor.educations && mentor.educations.length > 0 ? (
                                    <>
                                        <h5 className="content-section-header">
                                            <FaGraduationCap className="me-2" />
                                            Thông tin học vấn
                                        </h5>
                                        <Row>
                                            {mentor.educations.map((edu, index) => (
                                                <Col lg={6} key={index} className="mb-4">
                                                    <Card className="h-100 border-start border-primary border-4 shadow-sm">
                                                        <Card.Body>
                                                            <h6 className="text-primary fw-bold">{edu.schoolName}</h6>
                                                            <p className="mb-1"><strong>Chuyên ngành:</strong> {edu.major}</p>
                                                            <p className="text-muted mb-2">
                                                                <FaCalendarAlt className="me-1" />
                                                                {new Date(edu.startDate).toLocaleDateString('vi-VN')} - {' '}
                                                                {new Date(edu.endDate).toLocaleDateString('vi-VN')}
                                                            </p>
                                                            {edu.certificateImage && (
                                                                <div className="text-center">
                                                                    <Image
                                                                        src={edu.certificateImage}
                                                                        alt="Certificate"
                                                                        className="certificate-thumb"
                                                                        thumbnail
                                                                        style={{ maxHeight: '150px', cursor: 'pointer' }}
                                                                        onClick={() => handleImageClick(
                                                                            edu.certificateImage,
                                                                            `Bằng cấp - ${edu.schoolName}`,
                                                                            `Chuyên ngành: ${edu.major}`
                                                                        )}
                                                                    />
                                                                    
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaGraduationCap className="empty-state-icon" />
                                        <div className="empty-state-text">
                                            🎓 Thông tin học vấn đang được cập nhật
                                            <br />
                                            <small className="text-muted mt-2 d-block">
                                                Mentor sẽ sớm bổ sung thông tin này
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </Tab>

                            {/* Experience Tab */}
                            <Tab
                                eventKey="experience"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaBriefcase className="tab-icon" />
                                        <span>Kinh nghiệm</span>
                                        <span className="tab-count">{getExperiences().length}</span>
                                    </span>
                                }
                            >
                                {getExperiences().length > 0 ? (
                                    <>
                                        <h5 className="content-section-header">
                                            <FaBriefcase className="me-2" />
                                            Kinh nghiệm làm việc
                                        </h5>
                                        <div className="timeline">
                                            {getExperiences().map((exp, index) => (
                                                <Card key={index} className="mb-3 border-start border-success border-3">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col lg={8}>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <FaBriefcase className="text-success me-2 fs-5" />
                                                                    <h6 className="text-success fw-bold mb-0">{exp.companyName}</h6>
                                                                </div>
                                                                <p className="mb-2">
                                                                    <strong className="text-dark">Vị trí:</strong>
                                                                    <span className="ms-1 text-primary">{exp.position}</span>
                                                                </p>
                                                                <p className="text-muted mb-0">
                                                                    <FaCalendarAlt className="me-2 text-warning" />
                                                                    <strong>Thời gian:</strong> {' '}
                                                                    {new Date(exp.startDate).toLocaleDateString('vi-VN')} - {' '}
                                                                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                                                </p>
                                                            </Col>
                                                            <Col lg={4} className="text-center">
                                                                {exp.experienceImage && (
                                                                    <Image
                                                                        src={exp.experienceImage}
                                                                        alt="Experience"
                                                                        className="experience-thumb"
                                                                        thumbnail
                                                                        style={{ maxHeight: '100px', cursor: 'pointer' }}
                                                                        onClick={() => handleImageClick(
                                                                            exp.experienceImage,
                                                                            `Kinh nghiệm tại ${exp.companyName}`,
                                                                            `Vị trí: ${exp.position}`
                                                                        )}
                                                                    />
                                                                )}
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaBriefcase className="empty-state-icon" />
                                        <div className="empty-state-text">
                                            💼 Thông tin kinh nghiệm đang được cập nhật
                                            <br />
                                            <small className="text-muted mt-2 d-block">
                                                Mentor sẽ sớm chia sẻ kinh nghiệm làm việc
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </Tab>                            {/* Services Tab */}
                            <Tab
                                eventKey="services"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaCog className="tab-icon" />
                                        <span>Dịch vụ</span>
                                        <span className="tab-count">{getServices().length}</span>
                                    </span>
                                }
                            >
                                {getServices().length > 0 ? (
                                    <>
                                        <h5 className="content-section-header">
                                            <FaCog className="me-2" />
                                            Dịch vụ tư vấn
                                        </h5>
                                        <Row>
                                            {getServices().map((service, index) => (
                                                <Col lg={6} key={index} className="mb-3">
                                                    <Card className="h-100 border-start border-info border-4 shadow-sm service-card">
                                                        <Card.Body>
                                                            <div className="d-flex align-items-start">
                                                                <div className="service-icon me-3">
                                                                    <FaCog className="text-info fs-3" />
                                                                </div>
                                                                <div>
                                                                    <h6 className="text-info fw-bold mb-2">{service.serviceName}</h6>
                                                                    <p className="text-muted mb-0">{service.description}</p>
                                                                </div>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaCog className="empty-state-icon" />
                                        <div className="empty-state-text">
                                            ⚙️ Thông tin dịch vụ đang được cập nhật
                                            <br />
                                            <small className="text-muted mt-2 d-block">
                                                Mentor sẽ sớm giới thiệu các dịch vụ tư vấn
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </Tab>

                            {/* Tests/Certifications Tab */}
                            <Tab
                                eventKey="tests"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaAward className="tab-icon" />
                                        <span>Chứng chỉ</span>
                                        <span className="tab-count">{getTests().length}</span>
                                    </span>
                                }
                            >
                                {getTests().length > 0 ? (
                                    <>
                                        <h5 className="content-section-header">
                                            <FaAward className="me-2" />
                                            Chứng chỉ & Bằng cấp
                                        </h5>
                                        <Row>
                                            {getTests().map((test, index) => (
                                                <Col lg={4} md={6} key={index} className="mb-3">
                                                    <Card className="h-100 text-center border border-warning">
                                                        <Card.Body>
                                                            <FaAward className="text-warning fs-1 mb-3" />
                                                            <h6 className="text-warning fw-bold">{test.testName}</h6>
                                                            <h4 className="text-primary">{test.score}</h4>
                                                            {test.scoreImage && (
                                                                <div className="mt-3">
                                                                    <Image
                                                                        src={test.scoreImage}
                                                                        alt="Test Score"
                                                                        className="score-thumb"
                                                                        thumbnail
                                                                        style={{ maxHeight: '120px', cursor: 'pointer' }}
                                                                        onClick={() => handleImageClick(
                                                                            test.scoreImage,
                                                                            `Chứng chỉ ${test.testName}`,
                                                                            `Điểm số: ${test.score}`
                                                                        )}
                                                                    />
                                                                    <div className="mt-1">
                                                                        <small className="text-muted">
                                                                            <FaExternalLinkAlt className="me-1" />
                                                                            Xem chứng chỉ
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaAward className="empty-state-icon" />
                                        <div className="empty-state-text">
                                            🏆 Thông tin chứng chỉ đang được cập nhật
                                            <br />
                                            <small className="text-muted mt-2 d-block">
                                                Mentor sẽ sớm chia sẻ các chứng chỉ và bằng cấp
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>

                {/* Image Modal */}
                <ImageModal
                    show={showImageModal}
                    onHide={() => setShowImageModal(false)}
                    imageSrc={selectedImage.src}
                    imageTitle={selectedImage.title}
                    imageDescription={selectedImage.description}
                />
            </Container>
        </div>
    );
};

export default MentorDetailPage;
