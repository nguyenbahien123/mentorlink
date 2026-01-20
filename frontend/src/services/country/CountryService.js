import { instance } from '../../api/axios';

class CountryService {
    // Get all approved countries
    static async getApprovedCountries() {
        try {
            const response = await instance.get('/api/countries');
            return response;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    }

    // Get pending country suggestions
    static async getPendingCountries() {
        try {
            const response = await instance.get('/api/countries/pending');
            return response;
        } catch (error) {
            console.error('Error fetching pending countries:', error);
            throw error;
        }
    }

    // Submit country suggestion
    static async suggestCountry(countryData) {
        try {
            const response = await instance.post('/api/countries/suggest', {
                name: countryData.name,
                code: countryData.code,
                description: countryData.description,
                suggestedBy: countryData.suggestedBy // mentor ID
            });
            return response;
        } catch (error) {
            console.error('Error suggesting country:', error);
            throw error;
        }
    }

    // Admin: Approve country suggestion
    static async approveCountry(countryId, approvalData) {
        try {
            const response = await instance.put(`/api/countries/${countryId}/approve`, {
                flagUrl: approvalData.flagUrl,
                description: approvalData.description,
                isApproved: true
            });
            return response;
        } catch (error) {
            console.error('Error approving country:', error);
            throw error;
        }
    }

    // Admin: Reject country suggestion
    static async rejectCountry(countryId, reason) {
        try {
            const response = await instance.delete(`/api/countries/${countryId}/reject`, {
                data: { reason }
            });
            return response;
        } catch (error) {
            console.error('Error rejecting country:', error);
            throw error;
        }
    }

    // Admin: Unapprove country (revert to pending)
    static async unapproveCountry(countryId) {
        try {
            const response = await instance.put(`/api/countries/${countryId}/unapprove`);
            return response;
        } catch (error) {
            console.error('Error unapproving country:', error);
            throw error;
        }
    }

    // Admin: Delete country
    static async deleteCountry(countryId) {
        try {
            const response = await instance.delete(`/api/countries/${countryId}`);
            return response;
        } catch (error) {
            console.error('Error deleting country:', error);
            throw error;
        }
    }

    // Get countries by mentor
    static async getMentorCountries(mentorId) {
        try {
            const response = await instance.get(`/api/mentors/${mentorId}/countries`);
            return response;
        } catch (error) {
            console.error('Error fetching mentor countries:', error);
            throw error;
        }
    }

    // Update mentor countries
    static async updateMentorCountries(mentorId, countryIds) {
        try {
            const response = await instance.put(`/api/mentors/${mentorId}/countries`, {
                countryIds
            });
            return response;
        } catch (error) {
            console.error('Error updating mentor countries:', error);
            throw error;
        }
    }

    // Search countries
    static async searchCountries(keyword) {
        try {
            const response = await instance.get(`/api/countries/search`, {
                params: { keyword }
            });
            return response;
        } catch (error) {
            console.error('Error searching countries:', error);
            throw error;
        }
    }

    // Get country statistics
    static async getCountryStats() {
        try {
            const response = await instance.get('/api/countries/stats');
            return response;
        } catch (error) {
            console.error('Error fetching country stats:', error);
            throw error;
        }
    }

    // Get popular countries (most mentors)
    static async getPopularCountries(limit = 10) {
        try {
            const response = await instance.get('/api/countries/popular', {
                params: { limit }
            });
            return response;
        } catch (error) {
            console.error('Error fetching popular countries:', error);
            throw error;
        }
    }

    /**
     * Get approved countries for a specific continent
     * @param {string} continent - The continent code (ASIA, EUROPE, AFRICA, NORTH_AMERICA, SOUTH_AMERICA, AUSTRALIA, ANTARCTICA)
     * @returns {Promise} Response with list of countries
     */
    static async getCountriesByContinent(continent) {
        try {
            const response = await instance.get(`/api/countries/continent/${continent}/approved`);
            if (response.respCode === '0') {
                return response.data || [];
            }
            return [];
        } catch (error) {
            console.error(`Error fetching countries for ${continent}:`, error);
            return [];
        }
    }
}

export default CountryService;