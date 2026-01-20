import { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../styles/components/OtpVerification.css';

const OtpVerification = ({ 
    email, 
    onVerifySuccess, 
    onResend, 
    loading = false,
    error = ''
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(120); // 2 phút = 120 giây
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle input change
    const handleChange = (index, value) => {
        // Chỉ cho phép nhập số
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Chỉ lấy ký tự cuối cùng
        setOtp(newOtp);

        // Tự động chuyển sang ô tiếp theo
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle key down (Backspace, Arrow keys)
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6);
        
        if (digits.length === 6) {
            const newOtp = digits.split('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
        }
    };

    // Handle verify
    const handleVerify = () => {
        const otpCode = otp.join('');
        if (otpCode.length === 6) {
            onVerifySuccess(otpCode);
        }
    };

    // Handle resend
    const handleResend = () => {
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(120);
        setCanResend(false);
        inputRefs.current[0].focus();
        onResend();
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <div className="otp-verification-container">
            <div className="otp-header">
                <i className="bi bi-envelope-check text-primary" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 mb-2">Xác thực Email</h4>
                <p className="text-muted small">
                    Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
                </p>
                <p className="text-primary fw-medium">{email}</p>
            </div>

            {error && (
                <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
            )}

            <Form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                <div className="otp-input-group mb-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="otp-input"
                            disabled={loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className="otp-timer mb-3">
                    {timeLeft > 0 ? (
                        <p className="text-muted small">
                            <i className="bi bi-clock me-2"></i>
                            Mã sẽ hết hạn sau: <span className="text-danger fw-bold">{formatTime(timeLeft)}</span>
                        </p>
                    ) : (
                        <p className="text-danger small">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            Mã OTP đã hết hạn
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3"
                    disabled={!isOtpComplete || loading || timeLeft === 0}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Đang xác thực...
                        </>
                    ) : (
                        'Xác thực'
                    )}
                </Button>

                <div className="text-center">
                    <span className="text-muted small">Không nhận được mã? </span>
                    {canResend ? (
                        <Button
                            variant="link"
                            className="p-0 text-decoration-none"
                            onClick={handleResend}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Gửi lại
                        </Button>
                    ) : (
                        <span className="text-muted small">
                            Gửi lại sau {formatTime(timeLeft)}
                        </span>
                    )}
                </div>
            </Form>
        </div>
    );
};

OtpVerification.propTypes = {
    email: PropTypes.string.isRequired,
    onVerifySuccess: PropTypes.func.isRequired,
    onResend: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string
};

export default OtpVerification;
