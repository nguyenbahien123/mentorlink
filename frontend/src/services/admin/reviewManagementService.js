import { instance as axios } from '../../api/axios';

/**
 * Admin Review Management Service
 * Handles reviews/ratings management from bookings
 */

// Get all reviews with filtering and pagination
export const getAllReviews = async (filters) => {
    const response = await axios.post('/api/admin/reviews/list', {
        data: {
            keySearch: filters.keySearch || null,
            rating: filters.rating || null,
            status: filters.status || null,
            dateFrom: filters.dateFrom || null,
            dateTo: filters.dateTo || null,
            page: filters.page || 1,
            size: filters.size || 10
        }
    });
    return response;
};

// Get review details by ID
export const getReviewById = async (id) => {
    const response = await axios.get(`/api/admin/reviews/${id}`);
    return response;
};

// Publish review
export const publishReview = async (id) => {
    const response = await axios.put(`/api/admin/reviews/${id}/publish`);
    return response;
};

// Unpublish/Hide review
export const unpublishReview = async (id) => {
    const response = await axios.put(`/api/admin/reviews/${id}/unpublish`);
    return response;
};

// Delete review
export const deleteReview = async (id) => {
    const response = await axios.delete(`/api/admin/reviews/${id}`);
    return response;
};

// Update moderation note
export const updateModerationNote = async (id, note) => {
    const response = await axios.put(`/api/admin/reviews/${id}/moderation-note`, null, {
        params: { note }
    });
    return response;
};

// Bulk publish reviews
export const bulkPublishReviews = async (ids) => {
    const response = await axios.put('/api/admin/reviews/bulk-publish', ids);
    return response;
};

// Bulk delete reviews
export const bulkDeleteReviews = async (ids) => {
    const response = await axios.delete('/api/admin/reviews/bulk-delete', {
        data: ids
    });
    return response;
};

// Get review statistics
export const getReviewStatistics = async () => {
    const response = await axios.get('/api/admin/reviews/statistics');
    return response;
};

export default {
    getAllReviews,
    getReviewById,
    publishReview,
    unpublishReview,
    deleteReview,
    updateModerationNote,
    bulkPublishReviews,
    bulkDeleteReviews,
    getReviewStatistics
};
