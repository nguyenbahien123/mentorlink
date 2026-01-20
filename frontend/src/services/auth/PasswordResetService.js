import { authInstance } from '../../api/axios';

/**
 * Service xử lý quên mật khẩu và đặt lại mật khẩu
 */
class PasswordResetService {
    /**
     * Gửi yêu cầu reset password
     * @param {string} email - Email người dùng
     * @returns {Promise<Object>} Response từ API
     */
    async sendResetPasswordEmail(email) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: { email }
            };

            const response = await authInstance.post('/api/auth/password/forgot', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Email đặt lại mật khẩu đã được gửi',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'Gửi email thất bại'
                };
            }
        } catch (error) {
            console.error('Send reset password email error:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi gửi email đặt lại mật khẩu';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.data && typeof errorData.data === 'string') {
                    errorMessage = errorData.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Validate token reset password
     * @param {string} token - Token từ URL
     * @returns {Promise<Object>} Response từ API
     */
    async validateResetToken(token) {
        try {
            const response = await authInstance.get(`/api/auth/password/validate-token?token=${encodeURIComponent(token)}`);

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Token hợp lệ',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'Token không hợp lệ'
                };
            }
        } catch (error) {
            console.error('Validate reset token error:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi kiểm tra token';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.data && typeof errorData.data === 'string') {
                    errorMessage = errorData.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Reset password với token
     * @param {string} token - Token từ URL
     * @param {string} newPassword - Mật khẩu mới
     * @param {string} confirmPassword - Xác nhận mật khẩu
     * @returns {Promise<Object>} Response từ API
     */
    async resetPassword(token, newPassword, confirmPassword) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: {
                    token,
                    newPassword,
                    confirmPassword
                }
            };

            const response = await authInstance.post('/api/auth/password/reset', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Đặt lại mật khẩu thành công',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'Đặt lại mật khẩu thất bại'
                };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.data && typeof errorData.data === 'string') {
                    errorMessage = errorData.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Kiểm tra email có tồn tại không
     * @param {string} email - Email cần kiểm tra
     * @returns {Promise<Object>} Response từ API
     */
    async checkEmailExists(email) {
        try {
            const response = await authInstance.get(`/api/auth/password/check-email?email=${encodeURIComponent(email)}`);

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    exists: response.data,
                    message: response.description || 'Kiểm tra email thành công'
                };
            } else {
                return {
                    success: false,
                    exists: false,
                    error: response.description || 'Kiểm tra email thất bại'
                };
            }
        } catch (error) {
            console.error('Check email exists error:', error);
            
            return {
                success: false,
                exists: false,
                error: 'Có lỗi xảy ra khi kiểm tra email'
            };
        }
    }
}

// Export singleton instance
const passwordResetService = new PasswordResetService();
export default passwordResetService;