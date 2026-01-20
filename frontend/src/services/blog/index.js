import { instance } from '../../api/axios';

// params: { keyword, sort, page, size }
export const getBlogs = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.append('keyword', params.keyword);
    if (params.status) qs.append('status', params.status);
    if (params.sort) qs.append('sort', params.sort);
    if (params.page !== undefined) qs.append('page', params.page);
    if (params.size !== undefined) qs.append('size', params.size);

    return instance.get(`/api/blogs/approved?${qs.toString()}`);
};

export const getBlogById = async (id) => {
    return instance.get(`/api/blogs/${id}`);
};

// Admin APIs
export const getAllBlogs = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.append('keyword', params.keyword);
    if (params.status) qs.append('status', params.status);
    if (params.sort) qs.append('sort', params.sort);
    if (params.page !== undefined) qs.append('page', params.page);
    if (params.size !== undefined) qs.append('size', params.size);

    return instance.get(`/api/admin/blogs?${qs.toString()}`);
};

// Moderate blog - change status (APPROVED, REJECTED, PENDING)
export const moderateBlog = async (id, request) => {
    // request: { status: 'APPROVED' | 'REJECTED' | 'PENDING', reason?: string }
    return instance.post(`/api/admin/blogs/${id}/moderate`, request);
};

export const deleteBlog = async (id) => {
    return instance.delete(`/api/admin/blogs/${id}`);
};

export const togglePublishStatus = async (id) => {
    return instance.post(`/api/admin/blogs/${id}/toggle-publish`);
};

export const getBlogByIdAdmin = async (id) => {
    return instance.get(`/api/admin/blogs/${id}`);
};

// Mentor APIs - for creating and managing their own blogs
export const createBlog = async (request, authorId) => {
    return instance.post(`/api/blogs?authorId=${authorId}`, request);
};

export const updateBlog = async (blogId, request, authorId) => {
    return instance.put(`/api/blogs/${blogId}?authorId=${authorId}`, request);
};

export const getBlogsByMentor = async (authorId, params = {}) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.append('keyword', params.keyword);
    if (params.sort) qs.append('sort', params.sort);
    if (params.page !== undefined) qs.append('page', params.page);
    if (params.size !== undefined) qs.append('size', params.size);

    return instance.get(`/api/blogs/mentor/${authorId}?${qs.toString()}`);
};

export const deleteBlogByMentor = async (id) => {
    return instance.delete(`/api/blogs/${id}`);
};

export default {
    getBlogs,
    getBlogById,
    getAllBlogs,
    moderateBlog,
    deleteBlog,
    togglePublishStatus,
    getBlogByIdAdmin,
    // Mentor APIs
    createBlog,
    updateBlog,
    getBlogsByMentor,
    deleteBlogByMentor,
};

