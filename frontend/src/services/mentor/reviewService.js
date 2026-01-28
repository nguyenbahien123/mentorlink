import { instance as axios } from '../../api/axios';
import authService from '../auth/AuthService';

// Get published reviews for a mentor. If `mentorId` not provided,
// try to get current user id from stored access token.
export const getMentorReviews = async ({ mentorId = null, rating = null, page = 1, size = 20 } = {}) => {
    if (!mentorId) {
        const current = authService.getCurrentUser();
        mentorId = current && current.userId ? current.userId : null;
    }

    // Fallback: if token didn't include userId, call backend profile endpoint
    if (!mentorId) {
        try {
            const profileResp = await axios.get('/api/profile');
            const profileData = profileResp && profileResp.data ? profileResp.data : profileResp;
            mentorId = profileData && profileData.id ? profileData.id : null;
            console.log('Got mentorId from profile endpoint:', mentorId);
        } catch (e) {
            console.error('Failed to fetch profile:', e);
        }
    }

    if (!mentorId) {
        throw new Error('Mentor id not provided and no authenticated user found');
    }

    const params = { page, size };
    if (rating != null) params.rating = rating;

    const resp = await axios.get(`/api/mentor/${mentorId}/reviews`, { params });
    return resp;
};

export default {
    getMentorReviews
};
