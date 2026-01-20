import { instance } from '../../api/axios';

const BASE_URL = '/api/payment-history';

/**
 * Get earnings for the current logged-in mentor
 * Returns total earnings, platform commission (10%), and net earnings (90%)
 */
export const getMyEarnings = async () => {
    try {
        const response = await instance.get(`${BASE_URL}/my-earnings`);
        return response;
    } catch (error) {
        console.error('Error fetching mentor earnings:', error);
        throw error;
    }
};

/**
 * Get earnings for a specific mentor by ID
 * @param {number} mentorId - The ID of the mentor
 */
export const getMentorEarnings = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/mentor/${mentorId}/earnings`);
        return response;
    } catch (error) {
        console.error('Error fetching mentor earnings by ID:', error);
        throw error;
    }
};

const PaymentHistoryService = {
    getMyEarnings,
    getMentorEarnings
};

export default PaymentHistoryService;
