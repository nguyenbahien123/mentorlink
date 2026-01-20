import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/mentor-management';

/**
 * Admin Mentor Management Service
 * Handles mentor approval, rejection, and management operations
 */

// Get all mentors with filtering and pagination
export const getAllMentors = async (params = {}) => {
    const payload = {
        data: {
            keySearch: params.keySearch || '',
            status: params.status || null,
            page: params.page || 1,
            size: params.size || 10
        }
    };
    return instance.post(`${BASE_URL}/get-all-mentors`, payload);
};

// Get mentor details by ID
export const getMentorById = async (id) => {
    return instance.get(`${BASE_URL}/${id}`);
};

// Approve a mentor
export const approveMentor = async (id) => {
    return instance.put(`${BASE_URL}/${id}/approve`);
};

// Reject a mentor
export const rejectMentor = async (id) => {
    return instance.put(`${BASE_URL}/${id}/reject`);
};

// Bulk approve mentors
export const bulkApproveMentors = async (mentorIds) => {
    return instance.put(`${BASE_URL}/bulk-approve`, mentorIds);
};

// Bulk reject mentors
export const bulkRejectMentors = async (mentorIds) => {
    return instance.put(`${BASE_URL}/bulk-reject`, mentorIds);
};

// Delete a mentor
export const deleteMentor = async (id) => {
    return instance.delete(`${BASE_URL}/${id}`);
};

// Get mentor statistics (pending, approved, rejected, total)
export const getMentorStatistics = async () => {
    return instance.get(`${BASE_URL}/statistics`);
};

// ========== Education Management ==========
// Approve a specific education record
export const approveEducation = async (educationId) => {
    return instance.put(`/api/mentor/educations/admin/${educationId}/approve`);
};

// Reject a specific education record
export const rejectEducation = async (educationId) => {
    return instance.put(`/api/mentor/educations/admin/${educationId}/reject`);
};

// ========== Experience Management ==========
// Approve a specific experience record
export const approveExperience = async (experienceId) => {
    return instance.put(`/api/mentor/experiences/admin/${experienceId}/approve`);
};

// Reject a specific experience record
export const rejectExperience = async (experienceId) => {
    return instance.put(`/api/mentor/experiences/admin/${experienceId}/reject`);
};

// ========== Certificate/Test Management ==========
// Approve a specific certificate/test record
export const approveCertificate = async (certificateId) => {
    return instance.put(`/api/mentor/tests/admin/${certificateId}/approve`);
};

// Reject a specific certificate/test record
export const rejectCertificate = async (certificateId) => {
    return instance.put(`/api/mentor/tests/admin/${certificateId}/reject`);
};

// ========== Service Management ==========
// Approve a specific service record
export const approveService = async (serviceId) => {
    return instance.put(`/api/mentor/services/admin/${serviceId}/approve`);
};

// Reject a specific service record
export const rejectService = async (serviceId) => {
    return instance.put(`/api/mentor/services/admin/${serviceId}/reject`);
};

export default {
    getAllMentors,
    getMentorById,
    approveMentor,
    rejectMentor,
    bulkApproveMentors,
    bulkRejectMentors,
    deleteMentor,
    getMentorStatistics,
    // Individual item management
    approveEducation,
    rejectEducation,
    approveExperience,
    rejectExperience,
    approveCertificate,
    rejectCertificate,
    approveService,
    rejectService
};
