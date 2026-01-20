import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import passwordResetService from '../../services/auth/PasswordResetService';
import './ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isResetSuccess, setIsResetSuccess] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            validateToken(tokenFromUrl);
        } else {
            showToast('Token không hợp lệ', 'error');
            navigate('/login');
        }
    }, [searchParams, navigate, showToast]);

    const validateToken = async (tokenToValidate) => {
        setIsValidatingToken(true);
        try {
            const result = await passwordResetService.validateResetToken(tokenToValidate);
            if (result.success) {
                setIsTokenValid(true);
            } else {
                showToast(result.error, 'error');
                setIsTokenValid(false);
                setTimeout(() => navigate('/forgot-password'), 3000);
            }
        } catch (error) {
            console.error('Token validation error:', error);
            showToast('Có lỗi xảy ra khi kiểm tra token', 'error');
            setIsTokenValid(false);
        } finally {
            setIsValidatingToken(false);
        }
    };

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        
        return {
            minLength,
            isValid: minLength
        };
    };

    const passwordValidation = validatePassword(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword.trim()) {
            showToast('Vui lòng nhập mật khẩu mới', 'error');
            return;
        }

        if (!passwordValidation.isValid) {
            showToast('Mật khẩu phải có ít nhất 8 ký tự', 'error');
            return;
        }

        if (!confirmPassword.trim()) {
            showToast('Vui lòng xác nhận mật khẩu', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await passwordResetService.resetPassword(token, newPassword, confirmPassword);

            if (result.success) {
                showToast(result.message, 'success');
                // Tự động chuyển về trang login sau 2 giây
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showToast('Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidatingToken) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <div className="reset-password-header">
                        <div className="logo">⏳</div>
                        <h2>Đang kiểm tra...</h2>
                        <p>Vui lòng chờ trong giây lát</p>
                    </div>
                    <div className="reset-password-content">
                        <div className="loading-spinner-large"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isTokenValid) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <div className="reset-password-header error">
                        <div className="logo">❌</div>
                        <h2>Link không hợp lệ</h2>
                        <p>Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ</p>
                    </div>
                    <div className="reset-password-content">
                        <div className="error-message">
                            <p>Có thể link đã hết hạn hoặc đã được sử dụng.</p>
                            <p>Vui lòng thực hiện lại quy trình đặt lại mật khẩu.</p>
                        </div>
                        <Link to="/forgot-password" className="retry-button">
                            Yêu cầu link mới
                        </Link>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <div className="reset-password-header">
                    <div className="logo">🔑</div>
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Nhập mật khẩu mới của bạn</p>
                </div>
                
                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        
                        {newPassword && !passwordValidation.isValid && (
                            <div className="password-requirements">
                                <p className="requirements-title">❌ Mật khẩu phải có ít nhất 8 ký tự</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        
                        {confirmPassword && newPassword !== confirmPassword && (
                            <div className="password-mismatch">
                                ❌ Mật khẩu xác nhận không khớp
                            </div>
                        )}
                        
                        {confirmPassword && newPassword === confirmPassword && (
                            <div className="password-match">
                                ✅ Mật khẩu khớp
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
                        className="submit-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            'Đặt lại mật khẩu'
                        )}
                    </button>
                </form>
                
                <div className="reset-password-footer">
                    <p>Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;