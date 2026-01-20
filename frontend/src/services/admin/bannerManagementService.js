import { instance as axios } from '../../api/axios';

/**
 * Admin Banner Management Service
 * Handles banner/advertisement management
 */

// Get all banners with filtering and pagination
export const getAllBanners = async (filters) => {
    const response = await axios.post('/api/admin/banners/list', {
        data: {
            keySearch: filters.keySearch && filters.keySearch.trim() !== '' ? filters.keySearch : null,
            status: filters.status && filters.status !== '' ? filters.status : null,
            isPublished: filters.isPublished !== undefined && filters.isPublished !== null ? filters.isPublished : null,
            dateFrom: filters.dateFrom || null,
            dateTo: filters.dateTo || null,
            page: filters.page || 1,
            size: filters.size || 10
        }
    });
    return response;
};

// Get banner details by ID
export const getBannerById = async (id) => {
    const response = await axios.get(`/api/admin/banners/${id}`);
    return response;
};

// Create new banner
export const createBanner = async (bannerData) => {
    const response = await axios.post('/api/admin/banners', {
        data: {
            title: bannerData.title,
            imageUrl: bannerData.imageUrl,
            linkUrl: bannerData.linkUrl,
            position: bannerData.position,
            startDate: bannerData.startDate,
            endDate: bannerData.endDate,
            isPublished: bannerData.isPublished
        }
    });
    return response;
};

// Update banner
export const updateBanner = async (id, bannerData) => {
    const response = await axios.put(`/api/admin/banners/${id}`, {
        data: bannerData
    });
    return response;
};

// Delete banner
export const deleteBanner = async (id) => {
    const response = await axios.delete(`/api/admin/banners/${id}`);
    return response;
};

// Publish banner
export const publishBanner = async (id) => {
    const response = await axios.put(`/api/admin/banners/${id}/publish`);
    return response;
};

// Unpublish banner
export const unpublishBanner = async (id) => {
    const response = await axios.put(`/api/admin/banners/${id}/unpublish`);
    return response;
};

// Update banner status
export const updateBannerStatus = async (id, status) => {
    const response = await axios.put(`/api/admin/banners/${id}/status`, null, {
        params: { status }
    });
    return response;
};

// Bulk delete banners
export const bulkDeleteBanners = async (ids) => {
    const response = await axios.delete('/api/admin/banners/bulk-delete', {
        data: ids
    });
    return response;
};

// Get banner statistics
export const getBannerStatistics = async () => {
    const response = await axios.get('/api/admin/banners/statistics');
    return response;
};

export default {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    publishBanner,
    unpublishBanner,
    updateBannerStatus,
    bulkDeleteBanners,
    getBannerStatistics
};
