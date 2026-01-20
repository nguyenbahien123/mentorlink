import { Container, Form, Button, Card, InputGroup, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts';
import { clearAllStorage } from '../../utils/storageUtils';
import CustomerPolicyModal from '../../components/common/CustomerPolicyModal';
import OtpVerification from '../../components/auth/OtpVerification';
import { OtpService } from '../../services/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/components/Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Clear localStorage khi component mount
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                if (isMounted) {
                    // Clear tất cả localStorage data
                    clearAllStorage();

                    // Logout để clear context state
                    logout();
                }
            } catch (error) {
                console.error('Error during auth initialization:', error);
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [logout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTermsLabelClick = () => {
        setShowPolicyModal(true);
    };

    const handlePolicyAgree = () => {
        setAgreedToTerms(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.fullName || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            setLoading(false);
            return;
        }

        if (!agreedToTerms) {
            setError('Vui lòng đọc và đồng ý với điều khoản sử dụng');
            setLoading(false);
            return;
        }

        try {
            // Gửi OTP đến email
            const result = await OtpService.sendOtp(formData.email);
            
            if (result.success) {
                // Chuyển sang bước nhập OTP
                setShowOtpStep(true);
                setError('');
            } else {
                // Hiển thị lỗi cụ thể từ backend
                setError(result.error || 'Không thể gửi mã OTP. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            setError('Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xác thực OTP
    const handleOtpVerify = async (otpCode) => {
        setOtpError('');
        setOtpLoading(true);

        try {
            // Đăng ký với OTP
            const result = await OtpService.signUpWithOtp({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                otpCode: otpCode
            });

            if (result.success) {
                // Clear localStorage sau khi đăng ký thành công
                clearAllStorage();

                // Redirect to login page
                navigate('/login', {
                    state: {
                        message: 'Đăng ký thành công! Vui lòng đăng nhập.'
                    }
                });
            } else {
                // Hiển thị lỗi cụ thể từ backend
                setOtpError(result.error || 'Xác thực OTP thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            setOtpError('Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Xử lý gửi lại OTP
    const handleOtpResend = async () => {
        setOtpError('');
        setOtpLoading(true);

        try {
            const result = await OtpService.resendOtp(formData.email);
            
            if (!result.success) {
                setOtpError(result.error || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setOtpError('Có lỗi xảy ra khi gửi lại mã OTP. Vui lòng thử lại.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Quay lại bước nhập thông tin
    const handleBackToForm = () => {
        setShowOtpStep(false);
        setOtpError('');
    };
    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #a0e7e5 0%, #b4f8c8 50%, #a0e7e5 100%)',
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
                        <Card className="border-0 shadow-lg rounded-4 w-100 login-card" style={{ maxWidth: '600px' }}>
                            <Card.Body className="p-4 p-md-5">
                                {!showOtpStep ? (
                                    <>
                                        <h3 className="text-center text-secondary fw-normal mb-4">Đăng ký tài khoản</h3>

                                        {error && (
                                            <Alert variant="danger" className="mb-3">
                                                {error}
                                            </Alert>
                                        )}

                                        <Form onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="text-secondary small">Họ và tên</Form.Label>
                                                        <InputGroup className="auth-input-group">
                                                            <InputGroup.Text className="bg-light border-0">
                                                                <i className="bi bi-person text-secondary"></i>
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                type="text"
                                                                name="fullName"
                                                                placeholder="Nguyễn Văn A"
                                                                className="auth-input"
                                                                value={formData.fullName}
                                                                onChange={handleInputChange}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="text-secondary small">Số điện thoại</Form.Label>
                                                        <InputGroup className="auth-input-group">
                                                            <InputGroup.Text className="bg-light border-0">
                                                                <i className="bi bi-telephone text-secondary"></i>
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                type="tel"
                                                                name="phone"
                                                                placeholder="0912345678"
                                                                className="auth-input"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-secondary small">Email</Form.Label>
                                                <InputGroup className="auth-input-group">
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-envelope text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        placeholder="example@email.com"
                                                        className="auth-input"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                    />
                                                </InputGroup>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-secondary small">Mật khẩu</Form.Label>
                                                <InputGroup className="auth-input-group">
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-lock text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        placeholder="Tối thiểu 8 ký tự"
                                                        className="auth-input"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                    />
                                                </InputGroup>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-secondary small">Xác nhận mật khẩu</Form.Label>
                                                <InputGroup className="auth-input-group">
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-lock-fill text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        placeholder="Nhập lại mật khẩu"
                                                        className="auth-input"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                    />
                                                </InputGroup>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="terms"
                                                    className="text-secondary small"
                                                    checked={agreedToTerms}
                                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                    label={
                                                        <span>
                                                            Tôi đồng ý với{' '}
                                                            <span
                                                                className="policy-link"
                                                                onClick={handleTermsLabelClick}
                                                            >
                                                                điều khoản sử dụng và chính sách bảo mật
                                                            </span>
                                                        </span>
                                                    }
                                                />
                                            </Form.Group>

                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100 py-2 mb-3 fw-medium login-btn"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Đang gửi OTP...
                                                    </>
                                                ) : (
                                                    'ĐĂNG KÝ'
                                                )}
                                            </Button>

                                            <div className="text-center text-secondary small mt-3">
                                                Đã có tài khoản?{' '}
                                                <Link to="/login" className="text-primary text-decoration-none">
                                                    Đăng nhập ngay
                                                </Link>
                                            </div>
                                        </Form>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-3">
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none"
                                                onClick={handleBackToForm}
                                            >
                                                <i className="bi bi-arrow-left me-2"></i>
                                                Quay lại
                                            </Button>
                                        </div>
                                        <OtpVerification
                                            email={formData.email}
                                            onVerifySuccess={handleOtpVerify}
                                            onResend={handleOtpResend}
                                            loading={otpLoading}
                                            error={otpError}
                                        />
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="d-none d-lg-block right-panel" style={{ background: 'linear-gradient(135deg, #71c9ce 0%, #a6e3e9 100%)' }}>
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
                            <h2 className="text-dark mb-4 display-4">Bắt đầu hành trình</h2>
                            <p className="text-dark mb-5 lead">
                                Tạo tài khoản để kết nối với các mentor hàng đầu trong lĩnh vực của bạn
                            </p>
                            <div className="bg-white bg-opacity-25 p-4 rounded-3">
                                <h5 className="text-dark mb-3">Tại sao nên đăng ký MentorLink?</h5>
                                <ul className="text-start text-dark list-unstyled">
                                    <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Kết nối với mentor chuyên ngành</li>
                                    <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Đặt lịch dễ dàng và linh hoạt</li>
                                    <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Học hỏi kinh nghiệm thực tiễn</li>
                                </ul>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Customer Policy Modal */}
            <CustomerPolicyModal
                show={showPolicyModal}
                onHide={() => setShowPolicyModal(false)}
                onAgree={handlePolicyAgree}
            />
        </div>
    );
};

export default RegisterPage;
