import { instance } from '../../api/axios';

// ============ PUBLIC ENDPOINTS ============
// Lấy danh sách FAQ đã xuất bản (public)
export const getPublishedFaqs = async (params = {}) => {
    // params: { page, size, sort }
    return instance.get('/api/faqs/published', { params });
};

// Lấy chi tiết FAQ theo ID (public)
export const getFaqById = async (id) => {
    return instance.get(`/faqs/${id}`);
};

// ============ ADMIN ENDPOINTS ============
// Lấy danh sách tất cả FAQ cho admin (có filter, search, pagination)
export const getAllFaqsForAdmin = async (params = {}) => {
    // params: { page, size, sort, keyword, published, urgency }
    return instance.get('/api/admin/faqs', { params });
};

// Lấy chi tiết FAQ cho admin
export const getFaqByIdForAdmin = async (id) => {
    return instance.get(`/api/admin/faqs/${id}`);
};

// Tạo FAQ mới (admin)
export const createFaq = async (payload) => {
    // payload: { question, answer, urgency, isPublished }
    return instance.post('/api/admin/faqs', payload);
};

// Cập nhật FAQ (admin)
export const updateFaq = async (id, payload) => {
    // payload: { question, answer, urgency, isPublished }
    return instance.put(`/api/admin/faqs/${id}`, payload);
};

// Xóa FAQ (admin)
export const deleteFaq = async (id) => {
    return instance.delete(`/api/admin/faqs/${id}`);
};

// Publish/Unpublish FAQ (admin)
export const togglePublishFaq = async (id, published = true) => {
    return instance.patch(`/api/admin/faqs/${id}/publish`, null, {
        params: { published }
    });
};

// Trả lời FAQ (admin)
export const answerFaq = async (id, answer) => {
    return instance.patch(`/api/admin/faqs/${id}/answer`, null, {
        params: { answer }
    });
};

export default {
    // Public
    getPublishedFaqs,
    getFaqById,
    
    // Admin
    getAllFaqsForAdmin,
    getFaqByIdForAdmin,
    createFaq,
    updateFaq,
    deleteFaq,
    togglePublishFaq,
    answerFaq,
};
