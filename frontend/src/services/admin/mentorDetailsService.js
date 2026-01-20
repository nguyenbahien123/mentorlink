import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/mentor-management';

/**
 * Admin Mentor Details Service
 * 
 * All endpoints use admin API only: /api/admin/mentor-management/*
 * 
 * These endpoints return admin-specific DTOs with status information:
 * - MentorEducationAdminResponse (includes id, statusCode, statusName)
 * - MentorExperienceAdminResponse (includes id, statusCode, statusName)
 * - MentorTestAdminResponse (includes id, statusCode, statusName)
 * - MentorServiceAdminResponse (includes id, statusCode, statusName)
 * 
 * Note: Admin sees ALL items (not filtered by APPROVED status)
 */

// Get mentor's education
export const getMentorEducation = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/${mentorId}/education`);
        return response;
    } catch (error) {
        console.warn(`Admin education endpoint not implemented: ${BASE_URL}/${mentorId}/education`);
        return { respCode: "0", success: true, data: [] };
    }
};

// Get mentor's experience
export const getMentorExperience = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/${mentorId}/experience`);
        return response;
    } catch (error) {
        console.warn(`Admin experience endpoint not implemented: ${BASE_URL}/${mentorId}/experience`);
        return { respCode: "0", success: true, data: [] };
    }
};

// Get mentor's certificates/tests
export const getMentorCertificates = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/${mentorId}/certificates`);
        return response;
    } catch (error) {
        console.warn(`Admin certificates endpoint not implemented: ${BASE_URL}/${mentorId}/certificates`);
        return { respCode: "0", success: true, data: [] };
    }
};

// Get mentor's services
export const getMentorServices = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/${mentorId}/services`);
        return response;
    } catch (error) {
        console.warn(`Admin services endpoint not implemented: ${BASE_URL}/${mentorId}/services`);
        return { respCode: "0", success: true, data: [] };
    }
};

// Get mentor's countries
export const getMentorCountries = async (mentorId) => {
    try {
        const response = await instance.get(`${BASE_URL}/${mentorId}/countries`);
        return response;
    } catch (error) {
        console.warn(`Admin countries endpoint not implemented: ${BASE_URL}/${mentorId}/countries`);
        return { respCode: "0", success: true, data: [] };
    }
};

export default {
    getMentorEducation,
    getMentorExperience,
    getMentorCertificates,
    getMentorServices,
    getMentorCountries
};
