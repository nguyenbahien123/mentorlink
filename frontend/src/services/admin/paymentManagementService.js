import { instance as axios } from '../../api/axios';

const BASE_URL = '/api/admin/payments';

// Get all payments with filters and pagination
export const getAllPayments = async (filterData) => {
    const response = await axios.post(`${BASE_URL}/list`, {
        data: {
            keySearch: filterData.keySearch || null,
            status: filterData.status || null,
            paymentMethod: filterData.paymentMethod || null,
            dateFrom: filterData.dateFrom || null,
            dateTo: filterData.dateTo || null,
            page: filterData.page || 1,
            size: filterData.size || 10
        }
    });
    return response;
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
    const response = await axios.get(`${BASE_URL}/${paymentId}`);
    return response;
};

// Get payment by transaction code
export const getPaymentByTransactionCode = async (transactionCode) => {
    const response = await axios.get(`${BASE_URL}/transaction/${transactionCode}`);
    return response;
};

// Mark payment as completed
export const markPaymentAsCompleted = async (paymentId) => {
    const response = await axios.put(`${BASE_URL}/${paymentId}/complete`);
    return response;
};

// Mark payment as failed
export const markPaymentAsFailed = async (paymentId, reason) => {
    const response = await axios.put(`${BASE_URL}/${paymentId}/fail`, null, {
        params: { reason }
    });
    return response;
};

// Process refund
export const processRefund = async (paymentId, reason) => {
    const response = await axios.put(`${BASE_URL}/${paymentId}/refund`, null, {
        params: { reason }
    });
    return response;
};

// Get payment statistics
export const getPaymentStatistics = async () => {
    const response = await axios.get(`${BASE_URL}/statistics`);
    return response;
};
