import React, { useState } from 'react';
import { Container, Form, Button, Card, InputGroup, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import passwordResetService from '../../services/auth/PasswordResetService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/components/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { showToast } = useToast();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showToast('Email không hợp lệ', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await passwordResetService.sendResetPasswordEmail(email);

            if (result.success) {
                setIsEmailSent(true);
                showToast(result.message, 'success');
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error sending reset email:', error);
            showToast('Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!email.trim()) return;
        
        setIsLoading(true);
        try {
            const result = await passwordResetService.sendResetPasswordEmail(email);
            if (result.success) {
                showToast('Email đã được gửi lại', 'success');
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            showToast('Có lỗi xảy ra khi gửi lại email', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div
                style={{
                    minHeight: '80vh',
                    width: '100%',
                    display: 'flex',
                    fontFamily: 'Inter, sans-serif',
                    padding: '0'
                }}
            >
                <Container fluid className="p-0 m-0">
                    <Row className="g-0 h-100 auth-container">
                        <Col lg={6} className="d-flex align-items-center justify-content-center p-4">
                            <Card className="border-0 shadow-lg rounded-4 w-100 login-card" style={{ maxWidth: '500px' }}>
                                <Card.Body className="p-4 p-md-5">
                                    <div className="text-center mb-4">
                                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
                                        <h3 className="text-secondary fw-normal">Kiểm tra email của bạn</h3>
                                    </div>

                                    <Alert variant="success" className="mb-3">
                                        <p className="mb-2">Chúng tôi đã gửi link đặt lại mật khẩu đến:</p>
                                        <div className="fw-bold text-primary">{email}</div>
                                    </Alert>
                                    
                                    <Alert variant="warning" className="mb-3">
                                        <small>
                                            <strong>Lưu ý:</strong> Link sẽ hết hạn sau 15 phút. 
                                            Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).
                                        </small>
                                    </Alert>
                                    
                                    <Button 
                                        variant="outline-primary"
                                        onClick={handleResendEmail}
                                        disabled={isLoading}
                                        className="w-100 mb-3"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            'Gửi lại email'
                                        )}
                                    </Button>
                                    
                                    <div className="text-center">
                                        <Link to="/login" className="text-primary text-decoration-none">
                                            Quay lại đăng nhập
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} className="d-none d-lg-block right-panel">
                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center p-5">
                                <div className="logo-container mb-4">
                                    <img
                                        src="/logo.svg"
                                        alt="MentorLink"
                                        className="img-fluid mentor-logo"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150x150/71c9ce/ffffff?text=MentorLink';
                                        }}
                                    />
                                </div>
                                <h2 className="mb-4 display-4">Chào mừng đến với <br /> MentorLink</h2>
                                <p className="mb-5 lead">
                                    Nền tảng kết nối mentee và mentor hiệu quả nhất dành cho bạn
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '80vh',
                width: '100%',
                display: 'flex',
                fontFamily: 'Inter, sans-serif',
                padding: '0'
            }}
        >
            <Container fluid className="p-0 m-0">
                <Row className="g-0 h-100 auth-container">
                    <Col lg={6} className="d-flex align-items-center justify-content-center p-4">
                        <Card className="border-0 shadow-lg rounded-4 w-100 login-card" style={{ maxWidth: '500px' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h3 className="text-secondary fw-normal">Quên mật khẩu</h3>
                                    <p className="text-muted small">Nhập email để nhận link đặt lại mật khẩu</p>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    <InputGroup className="mb-3 auth-input-group">
                                        <InputGroup.Text className="bg-light border-0">
                                            <i className="bi bi-envelope text-secondary"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email của bạn"
                                            className="auth-input"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </InputGroup>
                                    
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-2 mb-3 fw-medium login-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            'Gửi link đặt lại mật khẩu'
                                        )}
                                    </Button>

                                    <div className="text-center text-secondary small">
                                        Đã nhớ mật khẩu?{' '}
                                        <Link to="/login" className="text-primary text-decoration-none">
                                            Đăng nhập
                                        </Link>
                                    </div>
                                    
                                    <div className="text-center text-secondary small mt-2">
                                        Chưa có tài khoản?{' '}
                                        <Link to="/register" className="text-primary text-decoration-none">
                                            Đăng ký ngay
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="d-none d-lg-block right-panel">
                        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center p-5">
                            <div className="logo-container mb-4">
                                <img
                                    src="/logo.svg"
                                    alt="MentorLink"
                                    className="img-fluid mentor-logo"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/150x150/71c9ce/ffffff?text=MentorLink';
                                    }}
                                />
                            </div>
                            <h2 className="mb-4 display-4">Chào mừng đến với <br /> MentorLink</h2>
                            <p className="mb-5 lead">
                                Nền tảng kết nối mentee và mentor hiệu quả nhất dành cho bạn
                            </p>
                            <div className="stats-container d-flex justify-content-center gap-5 mt-5">
                                <div className="text-center">
                                    <h3 className="fw-bold">500+</h3>
                                    <p>Mentor</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="fw-bold">1000+</h3>
                                    <p>Học viên</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="fw-bold">50+</h3>
                                    <p>Chuyên ngành</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ForgotPassword;