import { authInstance } from '../../api/axios';

/**
 * Service này dùng để TẢI (fetch) các chính sách đã được active
 * (dành cho mentor/mentee xem, không phải trang admin).
 * * Giả định: 
 * Backend của bạn có một Controller CÔNG KHAI (public) tại '/api/policies'
 * và có một endpoint GET '/api/policies/active'
 * chấp nhận một query param là 'type' (VD: ?type=MENTOR)
 */
class PolicyService {

    /**
     * HÀM GỐC: Lấy danh sách chính sách đang active theo TỪNG LOẠI.
     * @param {string} type - "MENTOR", "MENTEE", hoặc "GENERAL"
     * @returns {Promise} - Promise chứa response data
     */
    async getActivePoliciesByType(type) {
        if (!type) {
            const error = new Error("Policy type is required (MENTOR, MENTEE, or GENERAL)");
            console.error(error.message);
            throw error;
        }
        
        try {
            // Gọi đến endpoint chung và truyền 'type' vào params
            const response = await authInstance.get('/api/policies/active', {
                params: {
                    type: type 
                }
            });
            console.log(`API Response for active ${type} policies:`, response);
            return response;
        } catch (error) {
            console.error(`Error fetching active ${type} policies:`, error);
            throw error;
        }
    }

    /**
     * HÀM TIỆN ÍCH (thay cho getActiveCustomerPolicies)
     * Lấy danh sách mentee policies đang active
     */
    async getActiveMenteePolicies() {
        // Chúng ta giả định "Customer" chính là "Mentee"
        return this.getActivePoliciesByType('MENTEE');
    }

    /**
     * HÀM TIỆN ÍCH (thay cho getActivePolicies)
     * Lấy danh sách mentor policies đang active
     */
    async getActiveMentorPolicies() {
        return this.getActivePoliciesByType('MENTOR');
    }

     /**
     * HÀM TIỆN ÍCH (Thêm mới)
     * Lấy danh sách chính sách chung đang active
     */
    async getActiveGeneralPolicies() {
        return this.getActivePoliciesByType('GENERAL');
    }
}

export default new PolicyService();