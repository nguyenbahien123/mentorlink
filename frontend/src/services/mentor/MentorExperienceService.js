import { instance as axios } from '../../api/axios';

const API_BASE_URL = '/api/mentor/experiences';

const unwrap = (response) => {
    if (response.data && response.data.data !== undefined) {
        return response.data.data;
    }
    return response.data;
};

const MentorExperienceService = {
    /**
     * Create a new mentor experience
     * @param {number} mentorId - The ID of the mentor
     * @param {FormData|Object} experienceData - Experience data (can be FormData or plain object)
     * @returns {Promise} The created experience response
     */
    create: async (mentorId, experienceData) => {
        const config = {};
        if (experienceData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        
        const response = await axios.post(`${API_BASE_URL}/${mentorId}`, experienceData, config);
        return unwrap(response);
    },

    /**
     * Get an experience by ID
     * @param {number} experienceId - The ID of the experience
     * @returns {Promise} The experience details
     */
    getById: async (experienceId) => {
        const response = await axios.get(`${API_BASE_URL}/${experienceId}`);
        return unwrap(response);
    },

    /**
     * Get all experiences for a specific mentor
     * @param {number} mentorId - The ID of the mentor
     * @returns {Promise} List of experiences
     */
    listByMentor: async (mentorId) => {
        const response = await axios.get(`${API_BASE_URL}/mentor/${mentorId}`);
        return unwrap(response);
    },

    /**
     * Get paginated experiences for a specific mentor
     * @param {number} mentorId - The ID of the mentor
     * @param {number} page - Page number (1-indexed)
     * @param {number} size - Page size
     * @returns {Promise} Paginated experiences
     */
    listByMentorPaginated: async (mentorId, page = 1, size = 10) => {
        const response = await axios.get(`${API_BASE_URL}/mentor/${mentorId}/paginated`, {
            params: { page, size }
        });
        return unwrap(response);
    },

    /**
     * Update an existing experience
     * @param {number} experienceId - The ID of the experience
     * @param {number} mentorId - The ID of the mentor
     * @param {FormData|Object} experienceData - Updated experience data
     * @returns {Promise} The updated experience response
     */
    update: async (experienceId, mentorId, experienceData) => {
        const config = {};
        if (experienceData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        
        const response = await axios.put(`${API_BASE_URL}/${experienceId}/mentor/${mentorId}`, experienceData, config);
        return unwrap(response);
    },

    /**
     * Delete an experience
     * @param {number} experienceId - The ID of the experience
     * @param {number} mentorId - The ID of the mentor
     * @returns {Promise}
     */
    remove: async (experienceId, mentorId) => {
        const response = await axios.delete(`${API_BASE_URL}/${experienceId}/mentor/${mentorId}`);
        return unwrap(response);
    },

    /**
     * Get experiences by mentor and status
     * @param {number} mentorId - The ID of the mentor
     * @param {string} statusCode - Status code (PENDING, APPROVED, REJECTED)
     * @returns {Promise} List of experiences with specified status
     */
    byMentorAndStatus: async (mentorId, statusCode) => {
        const response = await axios.get(`${API_BASE_URL}/mentor/${mentorId}/status/${statusCode}`);
        return unwrap(response);
    },

    /**
     * Get all approved experiences (public)
     * @returns {Promise} List of all approved experiences
     */
    approvedAll: async () => {
        const response = await axios.get(`${API_BASE_URL}/approved`);
        return unwrap(response);
    },

    /**
     * Get approved experiences for a specific mentor
     * @param {number} mentorId - The ID of the mentor
     * @returns {Promise} List of approved experiences
     */
    approvedByMentor: async (mentorId) => {
        const response = await axios.get(`${API_BASE_URL}/mentor/${mentorId}/approved`);
        return unwrap(response);
    },

    /**
     * Admin: Approve an experience
     * @param {number} experienceId - The ID of the experience
     * @returns {Promise} The approved experience
     */
    adminApprove: async (experienceId) => {
        const response = await axios.put(`${API_BASE_URL}/admin/${experienceId}/approve`);
        return unwrap(response);
    },

    /**
     * Admin: Reject an experience
     * @param {number} experienceId - The ID of the experience
     * @returns {Promise} The rejected experience
     */
    adminReject: async (experienceId) => {
        const response = await axios.put(`${API_BASE_URL}/admin/${experienceId}/reject`);
        return unwrap(response);
    },
};

export default MentorExperienceService;
