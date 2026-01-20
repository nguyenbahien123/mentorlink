import { authInstance } from '../../api/axios';

class OtpService {
    /**
     * Kiểm tra email đã tồn tại chưa
     * @param {string} email - Email người dùng
     * @returns {Promise<Object>} Response
     */
    async checkEmailExists(email) {
        try {
            // Gọi API đăng ký với thông tin tạm để check email
            // Hoặc tạo API riêng ở backend: /api/auth/check-email
            // Tạm thời return false, bạn có thể implement API backend riêng
            return {
                exists: false,
                error: null
            };
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }

    /**
     * Gửi OTP đến email
     * @param {string} email - Email người dùng
     * @returns {Promise<Object>} Response từ API
     */
    async sendOtp(email) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: { email }
            };

            const response = await authInstance.post('/api/auth/otp/send', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Mã OTP đã được gửi đến email của bạn',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'Gửi OTP thất bại'
                };
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            
            // Parse error message từ backend
            let errorMessage = 'Có lỗi xảy ra khi gửi OTP';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                // Check for specific error messages
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.message) {
                    if (errorData.message.includes('Email already exists')) {
                        errorMessage = 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.';
                    } else {
                        errorMessage = errorData.message;
                    }
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
     * Xác thực OTP
     * @param {string} email - Email người dùng
     * @param {string} otpCode - Mã OTP
     * @returns {Promise<Object>} Response từ API
     */
    async verifyOtp(email, otpCode) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: {
                    email,
                    otpCode
                }
            };

            const response = await authInstance.post('/api/auth/otp/verify', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Xác thực OTP thành công',
                    data: response.data
                };
            } else {
                // Parse error message chi tiết
                let errorMsg = 'Mã OTP không hợp lệ';
                if (response.description) {
                    errorMsg = response.description;
                } else if (response.data && typeof response.data === 'string') {
                    errorMsg = response.data;
                }
                
                return {
                    success: false,
                    error: errorMsg
                };
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            
            // Parse detailed error
            let errorMessage = 'Xác thực OTP thất bại';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.data && typeof errorData.data === 'string') {
                    errorMessage = errorData.data;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
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
     * Gửi lại OTP
     * @param {string} email - Email người dùng
     * @returns {Promise<Object>} Response từ API
     */
    async resendOtp(email) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: { email }
            };

            const response = await authInstance.post('/api/auth/otp/resend', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Mã OTP mới đã được gửi đến email của bạn',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || 'Gửi lại OTP thất bại'
                };
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.message || 'Có lỗi xảy ra khi gửi lại OTP'
            };
        }
    }

    /**
     * Đăng ký với OTP
     * @param {Object} registerData - Dữ liệu đăng ký
     * @returns {Promise<Object>} Response từ API
     */
    async signUpWithOtp(registerData) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: {
                    fullName: registerData.fullName,
                    email: registerData.email,
                    password: registerData.password,
                    confirmPassword: registerData.confirmPassword,
                    otpCode: registerData.otpCode
                }
            };

            const response = await authInstance.post('/api/auth/signup-with-otp', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                const tokenResponse = response.data;
                
                // Lưu tokens vào localStorage
                if (tokenResponse && tokenResponse.accessToken && tokenResponse.refreshToken) {
                    localStorage.setItem('accessToken', tokenResponse.accessToken);
                    localStorage.setItem('refreshToken', tokenResponse.refreshToken);
                }

                return {
                    success: true,
                    message: response.description || 'Đăng ký thành công!',
                    data: tokenResponse
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'OTP không hợp lệ'
                };
            }
        } catch (error) {
            console.error('Sign up with OTP error:', error);
            console.log('Error response:', error.response);
            
            // Parse detailed error message
            let errorMessage = 'OTP không hợp lệ';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('Error data:', errorData);
                
                // Try different fields for error message
                const rawMessage = errorData.description || errorData.message || errorData.data;
                console.log('Raw message:', rawMessage);
                
                if (rawMessage) {
                    const msg = String(rawMessage);
                    
                    // Specific error cases with exact matching
                    if (msg.includes('Email already exists')) {
                        errorMessage = '❌ Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.';
                    } 
                    else if (msg.includes('Invalid or expired OTP')) {
                        errorMessage = '❌ Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc bấm "Gửi lại" để nhận mã mới.';
                    }
                    else if (msg.toLowerCase().includes('expired')) {
                        errorMessage = '⏰ Mã OTP đã hết hạn (quá 2 phút). Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    } 
                    else if (msg.toLowerCase().includes('used') || msg.includes('đã được sử dụng')) {
                        errorMessage = '🔒 Mã OTP này đã được sử dụng. Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    } 
                    else if (msg.toLowerCase().includes('invalid') || msg.includes('không hợp lệ')) {
                        errorMessage = '❌ Mã OTP không đúng. Vui lòng kiểm tra lại email và nhập đúng 6 chữ số.';
                    } 
                    else if (msg.toLowerCase().includes('not found') || msg.includes('không tồn tại')) {
                        errorMessage = '❓ Không tìm thấy mã OTP. Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    }
                    else if (msg.includes('Password') || msg.includes('password')) {
                        errorMessage = '🔑 Mật khẩu và xác nhận mật khẩu không khớp.';
                    } 
                    else {
                        // Use raw message if no specific match
                        errorMessage = msg;
                    }
                } else {
                    errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('Final error message:', errorMessage);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Đăng ký mentor với OTP (multipart/form-data)
     * @param {FormData} formData - FormData chứa tất cả thông tin mentor + otpCode
     * @returns {Promise<Object>} Response từ API
     */
    async signUpMentorWithOtp(formData) {
        try {
            console.log('=== 🔐 Sending Mentor Registration with OTP ===');
            
            // Verify required fields
            let otpCodeFound = false;
            let emailFound = false;
            
            for (let [key, value] of formData.entries()) {
                if (key === 'otpCode') {
                    otpCodeFound = true;
                    console.log('✅ OTP:', value);
                } else if (key === 'email') {
                    emailFound = true;
                    console.log('✅ Email:', value);
                } else if (value instanceof File) {
                    console.log(`📎 ${key}: [File: ${value.name}]`);
                }
            }
            
            if (!otpCodeFound) {
                console.error('❌ OTP CODE MISSING!');
                return {
                    success: false,
                    error: 'Lỗi kỹ thuật: Mã OTP không được gửi. Vui lòng thử lại.'
                };
            }
            
            if (!emailFound) {
                console.error('❌ EMAIL MISSING!');
                return {
                    success: false,
                    error: 'Lỗi kỹ thuật: Email không được gửi. Vui lòng thử lại.'
                };
            }

            // Gửi trực tiếp FormData, axios sẽ tự động set Content-Type: multipart/form-data
            const response = await authInstance.post('/api/auth/mentor-signup-with-otp', formData);

            if (response && response.respCode === '0') {
                const tokenResponse = response.data;
                
                // Lưu tokens vào localStorage
                if (tokenResponse && tokenResponse.accessToken && tokenResponse.refreshToken) {
                    localStorage.setItem('accessToken', tokenResponse.accessToken);
                    localStorage.setItem('refreshToken', tokenResponse.refreshToken);
                }

                return {
                    success: true,
                    message: response.description || 'Đăng ký mentor thành công!',
                    data: tokenResponse
                };
            } else {
                return {
                    success: false,
                    error: response.description || response.data || 'Đăng ký mentor thất bại'
                };
            }
        } catch (error) {
            console.error('Sign up mentor with OTP error:', error);
            console.log('Error response:', error.response);
            
            // Parse detailed error message
            let errorMessage = 'Đăng ký thất bại';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('Error data:', errorData);
                
                // Try different fields for error message
                const rawMessage = errorData.description || errorData.message || errorData.data;
                console.log('Raw message:', rawMessage);
                
                if (rawMessage) {
                    const msg = String(rawMessage);
                    
                    // Specific error cases with exact matching
                    if (msg.includes('Email already exists') || msg.includes('Email này đã tồn tại')) {
                        errorMessage = '❌ Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.';
                    } 
                    else if (msg.includes('Invalid or expired OTP')) {
                        errorMessage = '❌ Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc bấm "Gửi lại" để nhận mã mới.';
                    }
                    else if (msg.toLowerCase().includes('expired')) {
                        errorMessage = '⏰ Mã OTP đã hết hạn (quá 2 phút). Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    } 
                    else if (msg.toLowerCase().includes('used') || msg.includes('đã được sử dụng')) {
                        errorMessage = '🔒 Mã OTP này đã được sử dụng. Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    } 
                    else if (msg.toLowerCase().includes('invalid') || msg.includes('không hợp lệ')) {
                        errorMessage = '❌ Mã OTP không đúng. Vui lòng kiểm tra lại email và nhập đúng 6 chữ số.';
                    } 
                    else if (msg.toLowerCase().includes('not found') || msg.includes('không tồn tại')) {
                        errorMessage = '❓ Không tìm thấy mã OTP. Vui lòng bấm "Gửi lại" để nhận mã mới.';
                    }
                    else if (msg.includes('Password') || msg.includes('password') || msg.includes('Mật khẩu')) {
                        errorMessage = '🔑 Mật khẩu và xác nhận mật khẩu không khớp.';
                    } 
                    else {
                        // Use raw message if no specific match
                        errorMessage = msg;
                    }
                } else {
                    errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('Final error message:', errorMessage);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export default new OtpService();
