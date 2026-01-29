import { authInstance, instance } from '../../api/axios';
import { tokenManager } from '../../api/tokenManager';

// Danh sách các API không cần token (permit all)
export const PUBLIC_ENDPOINTS = [
    '/api/auth/access-token',
    '/api/auth/refresh-token',
    '/api/auth/register',
];

class AuthService {
    // Đăng nhập
    async login(email, password) {
        try {
            const response = await authInstance.post('/api/auth/access-token', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true // Enable cookies
            });

            if (response.accessToken) {
                // Giải mã token để lấy thông tin user
                const userInfo = this.decodeToken(response.accessToken);

                return {
                    success: true,
                    user: userInfo,
                    accessToken: response.accessToken // Return accessToken to store in memory
                };
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.description || 'Đăng nhập thất bại'
            };
        }
    }

    // Refresh token - được gọi tự động bởi axios interceptor
    async refreshToken() {
        try {
            const response = await authInstance.post('/api/auth/refresh-token', {}, {
                withCredentials: true // Send cookie with refreshToken
            });

            if (response.accessToken) {
                return {
                    success: true,
                    accessToken: response.accessToken
                };
            } else {
                throw new Error('Invalid refresh response');
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            return {
                success: false,
                error: error.response?.data?.description || 'Refresh token thất bại'
            };
        }
    }

    // Silent refresh - try to get new accessToken on app load
    async silentRefresh() {
        try {
            const response = await authInstance.post('/api/auth/refresh-token', {}, {
                withCredentials: true
            });

            if (response.accessToken) {
                return {
                    success: true,
                    accessToken: response.accessToken
                };
            }
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    }

    // Giải mã JWT token
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);
            return {
                email: payload.sub, // email thường nằm trong 'sub' field
                role: payload.role || payload.authorities?.[0] || 'CUSTOMER', // role có thể nằm trong 'role' hoặc 'authorities'
                userId: payload.userId || payload.id,
                exp: payload.exp,
                iat: payload.iat
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Kiểm tra token có hết hạn không
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;

            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    // Return accessToken stored in memory
    getAccessToken() {
        return tokenManager.getAccessToken();
    }

    // Return decoded current user from accessToken or null
    getCurrentUser() {
        const token = this.getAccessToken();
        if (!token || this.isTokenExpired(token)) return null;
        return this.decodeToken(token);
    }

    // Check if user is authenticated (accessToken exists and not expired)
    isAuthenticated() {
        const token = this.getAccessToken();
        return !!token && !this.isTokenExpired(token);
    }

    // Logout - clear cookie on server
    // Logout - clear cookie on server
    async logout() {
        try {
            // Use authenticated instance so Authorization header is included
            await instance.post('/api/auth/remove-token', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getRouteByRole(role) {
        const routes = {
            'CUSTOMER': '/',
            'ADMIN': '/admin',
            'MENTOR': '/mentor/dashboard',
            'MODERATOR': '/moderator'
        };

        return routes[role.toUpperCase()] || '/';
    }

    // Đăng ký mentor
    async registerMentor(formDataFromPage) {
        try {
            // Check if data is FormData or regular object
            const isFormData = formDataFromPage instanceof FormData;
            
            if (isFormData) {
                // ✅ GỬI TRỰC TIẾP FormData từ component (không tạo mới)
                console.log('=== Sending FormData directly to backend ===');
                for (let [key, value] of formDataFromPage.entries()) {
                    console.log(key, ':', value instanceof File ? `[File: ${value.name}]` : value);
                }
                
                // ✅ Axios sẽ tự động set Content-Type: multipart/form-data khi detect FormData
                // KHÔNG set header manually để tránh bị thiếu boundary parameter
                const response = await authInstance.post('/api/auth/mentor-signup', formDataFromPage, {
                    withCredentials: true // Enable cookies
                });
                
                console.log('Mentor signup response:', response);
                
                // Handle response
                return this.handleAuthResponse(response);
                
            } else {
                // Old format - regular object (fallback)
                let requestData = {
                    fullName: formDataFromPage.personalInfo.name,
                    email: formDataFromPage.personalInfo.email,
                    password: formDataFromPage.personalInfo.password,
                    confirmPassword: formDataFromPage.personalInfo.confirmPassword,
                    dob: formDataFromPage.personalInfo.birthDate || null,
                    address: formDataFromPage.personalInfo.location || '',
                    phone: formDataFromPage.personalInfo.phone || '',
                    title: formDataFromPage.personalInfo.title || '',
                    levelOfEducation: formDataFromPage.personalInfo.education || '',
                    linkedUrl: formDataFromPage.personalInfo.linkedinUrl || '', 
                    introduceYourself: formDataFromPage.personalInfo.bio || '',
                    
                    mentorEducations: (formDataFromPage.educations || []).map(edu => ({
                        schoolName: edu.school,
                        major: edu.major,
                        startDate: edu.startDate || null,
                        endDate: edu.endDate || null
                    })),
                    
                    experiences: (formDataFromPage.experiences || []).map(exp => ({
                        company: exp.company,
                        position: exp.position,
                        startDate: exp.startDate || null,
                        endDate: exp.endDate || null
                    })),
                    
                    certificates: (formDataFromPage.testScores || []).map(test => ({
                        certificateName: test.testName,
                        score: test.score
                    })),
                    
                    mentorCountries: (formDataFromPage.approvedCountries || []).map(country => {
                        if (typeof country === 'object' && country.id) {
                            return {
                                countryId: country.id,
                                description: country.description || ''
                            };
                        } else {
                            const countryName = typeof country === 'string' ? country : country.name;
                            return {
                                countryName: countryName,
                                countryCode: country.code || null,
                                description: country.description || ''
                            };
                        }
                    })
                };
                
                const baseRequest = {
                    requestDateTime: new Date().toISOString(),
                    data: requestData
                };
                
                const response = await authInstance.post('/api/auth/mentor-signup', baseRequest, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
                
                // Handle response for non-FormData
                return this.handleAuthResponse(response);
            }
        } catch (error) {
            console.error('Register mentor error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.message ||'OTP không hợp lệ'
            };
        }
    }
    
    // Helper method to handle authentication response
    handleAuthResponse(response) {
        // authInstance interceptor already returns response.data
        // response = { respCode, description, data: { accessToken, userId } } - NO refreshToken in body
        if (response && response.respCode === '0') {
            const tokenResponse = response.data;
            
            // Return accessToken (refreshToken is in cookie)
            return {
                success: true,
                message: response.description || 'Đăng ký thành công!',
                accessToken: tokenResponse.accessToken,
                data: tokenResponse
            };
        } else {
            // Return error object instead of throwing
            return {
                success: false,
                error: response.description || response.message || 'Đăng ký thất bại',
                respCode: response.respCode
            };
        }
    }
}

export default new AuthService();