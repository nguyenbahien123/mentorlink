import { instance } from '../../api/axios';
import AuthService from '../auth/AuthService';
import { API_ENDPOINTS } from '../../utils';

class MentorService {
    // Get all mentors with filters and pagination
    static async getMentors(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.keyword) queryParams.append('keyword', params.keyword);
            if (params.country) queryParams.append('country', params.country);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size) queryParams.append('size', params.size);
            if (params.gender) queryParams.append('gender', params.gender);
            if (params.location) queryParams.append('location', params.location);
            if (params.minRating) queryParams.append('minRating', params.minRating);
            if (params.approvedCountry) queryParams.append('approvedCountry', params.approvedCountry);

            // BE exposes /api/mentors
            const url = `/api/mentors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await instance.get(url);

            return response;
        } catch (error) {
            console.error('Error fetching mentors:', error);
            throw error;
        }
    }

    // Get mentor by ID
    static async getMentorById(id) {
        try {
            const response = await instance.get(`/api/mentors/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching mentor detail:', error);
            throw error;
        }
    }

    // Get mentor by email. Uses the search endpoint and attempts to find exact email match.
    static async getMentorByEmail(email) {
        try {
            // search by keyword (email) - backend may return paged results
            const response = await this.getMentors({ keyword: email, size: 50, page: 0 });
            // response may be in different shapes depending on backend (wrapper or raw array)
            const payload = response?.data || response;
            // try common shapes
            let items = [];
            if (Array.isArray(payload)) items = payload;
            else if (Array.isArray(payload?.data)) items = payload.data;
            else if (Array.isArray(payload?.content)) items = payload.content;

            // fallback: if payload itself looks like a single mentor object
            if (!items.length && payload && (payload.email === email || payload.data?.email === email)) {
                const candidate = payload.data || payload;
                return candidate;
            }

            const found = items.find(m => (m.email && m.email.toLowerCase() === email.toLowerCase()) || (m.user && m.user.email && m.user.email.toLowerCase() === email.toLowerCase()));
            return found || null;
        } catch (error) {
            console.error('Error fetching mentor by email:', error);
            throw error;
        }
    }

    // Search mentors by keyword
    static async searchMentors(keyword, options = {}) {
        try {
            const params = {
                keyword,
                ...options
            };
            return await this.getMentors(params);
        } catch (error) {
            console.error('Error searching mentors:', error);
            throw error;
        }
    }



    // Get featured mentors (high rating, many bookings)
    static async getFeaturedMentors(limit = 6) {
        try {
            const params = {
                sort: 'rating:desc',
                size: limit,
                page: 0
            };
            return await this.getMentors(params);
        } catch (error) {
            console.error('Error fetching featured mentors:', error);
            throw error;
        }
    }

    // Get mentors by location
    static async getMentorsByLocation(location, options = {}) {
        try {
            const params = {
                location,
                ...options
            };
            return await this.getMentors(params);
        } catch (error) {
            console.error('Error fetching mentors by location:', error);
            throw error;
        }
    }

    // Get mentors by rating range
    static async getMentorsByRating(minRating, options = {}) {
        try {
            const params = {
                minRating,
                ...options
            };
            return await this.getMentors(params);
        } catch (error) {
            console.error('Error fetching mentors by rating:', error);
            throw error;
        }
    }

    // Book a mentor (placeholder for future implementation)
    static async bookMentor(mentorId, bookingData) {
        try {
            const response = await instance.post(`/api/mentors/${mentorId}/book`, bookingData);
            return response;
        } catch (error) {
            console.error('Error booking mentor:', error);
            throw error;
        }
    }

    // Add mentor to favorites (placeholder for future implementation)
    static async addToFavorites(mentorId) {
        try {
            const response = await instance.post(`/api/mentors/${mentorId}/favorite`);
            return response;
        } catch (error) {
            console.error('Error adding mentor to favorites:', error);
            throw error;
        }
    }

    // Remove mentor from favorites (placeholder for future implementation)
    static async removeFromFavorites(mentorId) {
        try {
            const response = await instance.delete(`/api/mentors/${mentorId}/favorite`);
            return response;
        } catch (error) {
            console.error('Error removing mentor from favorites:', error);
            throw error;
        }
    }

    static async getMentorActivity() {
        try {
            const userInfo = AuthService.getCurrentUser();
            console.log('Current user info:', userInfo);
            const mentorEmail = userInfo?.email;
            if (!mentorEmail) {
                throw new Error('No mentor ID found for current user');
            }
            const response = await instance.get(`/api/mentors/activity/${mentorEmail}`);
            return response;
        } catch (error) {
            console.error('Error fetching mentor activity:', error);
            throw error;
        }
    }

    // Get current logged-in user's profile (works for mentor)
    static async getCurrentMentorProfile() {
        try {
            const response = await instance.get(API_ENDPOINTS.USERS.PROFILE);
            return response; // interceptor returns response.data already
        } catch (error) {
            console.error('Error fetching current mentor profile:', error);
            throw error;
        }
    }

    // Get all approved countries for filter dropdown
    static async getAllCountries() {
        try {
            const response = await instance.get('/api/countries');
            return response;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    }

    // Search mentors by country
    static async getMentorsByCountry(country, options = {}) {
        try {
            const params = {
                country,
                ...options
            };
            return await this.getMentors(params);
        } catch (error) {
            console.error('Error fetching mentors by country:', error);
            throw error;
        }
    }


}

export default MentorService;
