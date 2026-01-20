import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/feedback-management';

/**
 * Admin Feedback Management Service
 * Handles feedback, reports, and complaints management
 */

// Get all feedbacks with filtering and pagination
export const getAllFeedbacks = async (params = {}) => {
    const payload = {
        data: {
            keySearch: params.keySearch || '',
            type: params.type || null,
            status: params.status || null,
            priority: params.priority || null,
            page: params.page || 1,
            size: params.size || 10
        }
    };
    return instance.post(`${BASE_URL}/get-all-feedbacks`, payload);
};

// Get feedback details by ID
export const getFeedbackById = async (id) => {
    return instance.get(`${BASE_URL}/${id}`);
};

// Respond to feedback
export const respondToFeedback = async (id, response, markAsResolved = false) => {
    return instance.put(`${BASE_URL}/${id}/respond`, {
        response,
        markAsResolved
    });
};

// Mark feedback as in progress
export const markFeedbackInProgress = async (id) => {
    return instance.put(`${BASE_URL}/${id}/mark-in-progress`);
};

// Mark feedback as resolved
export const markFeedbackResolved = async (id) => {
    return instance.put(`${BASE_URL}/${id}/mark-resolved`);
};

// Reject feedback
export const rejectFeedback = async (id) => {
    return instance.put(`${BASE_URL}/${id}/reject`);
};

// Delete feedback
export const deleteFeedback = async (id) => {
    return instance.delete(`${BASE_URL}/${id}`);
};

// Bulk resolve feedbacks
export const bulkResolveFeedbacks = async (feedbackIds) => {
    return instance.put(`${BASE_URL}/bulk-resolve`, feedbackIds);
};

// Get feedback statistics
export const getFeedbackStatistics = async () => {
    return instance.get(`${BASE_URL}/statistics`);
};

export default {
    getAllFeedbacks,
    getFeedbackById,
    respondToFeedback,
    markFeedbackInProgress,
    markFeedbackResolved,
    rejectFeedback,
    deleteFeedback,
    bulkResolveFeedbacks,
    getFeedbackStatistics
};
