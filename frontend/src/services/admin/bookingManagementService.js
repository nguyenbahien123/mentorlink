import { instance as axios } from '../../api/axios';

const BASE_URL = '/api/admin/bookings';

// Get all bookings with filters and pagination
export const getAllBookings = async (filterData) => {
    const response = await axios.post(`${BASE_URL}/list`, {
        data: {
            keySearch: filterData.keySearch || null,
            status: filterData.status || null,
            paymentStatus: filterData.paymentStatus || null,
            date: filterData.date || null,
            dateFrom: filterData.dateFrom || null,
            dateTo: filterData.dateTo || null,
            page: filterData.page || 1,
            size: filterData.size || 10
        }
    });
    return response; // axios interceptor already returns response.data
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
    const response = await axios.get(`${BASE_URL}/${bookingId}`);
    return response; // axios interceptor already returns response.data
};

// Confirm a booking
export const confirmBooking = async (bookingId) => {
    const response = await axios.put(`${BASE_URL}/${bookingId}/confirm`);
    return response; // axios interceptor already returns response.data
};

// Cancel a booking
export const cancelBooking = async (bookingId, reason) => {
    const response = await axios.put(`${BASE_URL}/${bookingId}/cancel`, null, {
        params: { reason }
    });
    return response; // axios interceptor already returns response.data
};

// Mark booking as completed
export const completeBooking = async (bookingId) => {
    const response = await axios.put(`${BASE_URL}/${bookingId}/complete`);
    return response; // axios interceptor already returns response.data
};

// Bulk confirm bookings
export const bulkConfirmBookings = async (bookingIds) => {
    const response = await axios.put(`${BASE_URL}/bulk-confirm`, bookingIds);
    return response; // axios interceptor already returns response.data
};

// Bulk cancel bookings
export const bulkCancelBookings = async (bookingIds, reason) => {
    const response = await axios.put(`${BASE_URL}/bulk-cancel`, bookingIds, {
        params: { reason }
    });
    return response; // axios interceptor already returns response.data
};

// Get booking statistics
export const getBookingStatistics = async () => {
    const response = await axios.get(`${BASE_URL}/statistics`);
    return response; // axios interceptor already returns response.data
};

// Get all schedules with pagination
export const getAllSchedules = async (filterData) => {
    const response = await axios.post(`${BASE_URL}/schedules/list`, {
        data: {
            page: filterData.page || 1,
            size: filterData.size || 10
        }
    });
    return response; // axios interceptor already returns response.data
};

// Get schedules by mentor
export const getSchedulesByMentor = async (mentorId) => {
    const response = await axios.get(`${BASE_URL}/schedules/mentor/${mentorId}`);
    return response; // axios interceptor already returns response.data
};
