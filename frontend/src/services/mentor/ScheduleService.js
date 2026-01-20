import { instance } from '../../api/axios';

/**
 * Schedule Service - CRUD operations for mentor schedules
 * All endpoints have /api prefix
 */
class ScheduleService {
    
    // ==================== READ OPERATIONS ====================
    
    /**
     * Get upcoming schedules for a specific mentor (next 3 days)
     * @param {number} mentorId - Mentor ID
     * @returns {Promise} Response with schedule data
     */
    static async getUpcomingSchedules(mentorId) {
        try {
            const response = await instance.get(`/api/schedules/mentor/${mentorId}/upcoming`);
            return response;
        } catch (error) {
            console.error('Error fetching upcoming schedules:', error);
            throw error;
        }
    }

    /**
     * Get all schedules for a mentor
     * @param {number} mentorId - Mentor ID
     * @returns {Promise} Response with all schedules data
     */
    static async getAllSchedules(mentorId) {
        try {
            const response = await instance.get(`/api/schedules/mentor/${mentorId}`);
            return response;
        } catch (error) {
            console.error('Error fetching all schedules:', error);
            throw error;
        }
    }

    /**
     * Get schedule by ID
     * @param {number} scheduleId - Schedule ID
     * @returns {Promise} Response with schedule data
     */
    static async getScheduleById(scheduleId) {
        try {
            const response = await instance.get(`/api/schedules/${scheduleId}`);
            return response;
        } catch (error) {
            console.error('Error fetching schedule by ID:', error);
            throw error;
        }
    }

    // ==================== CREATE OPERATIONS ====================
    
    /**
     * Create new schedule for mentor
     * @param {number} mentorId - Mentor ID
     * @param {Object} scheduleData - Schedule data
     * @param {string} scheduleData.date - Date in YYYY-MM-DD format
     * @param {number[]} scheduleData.timeSlotIds - Array of time slot IDs
     * @param {number} scheduleData.price - Price for the schedule
     * @returns {Promise} Response with created schedule data
     */
    static async createSchedule(mentorId, scheduleData) {
        try {
            const response = await instance.post(`/api/schedules/mentor/${mentorId}`, scheduleData);
            return response;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    }

    // ==================== UPDATE OPERATIONS ====================
    
    /**
     * Update existing schedule
     * @param {number} scheduleId - Schedule ID
     * @param {number} mentorId - Mentor ID
     * @param {Object} scheduleData - Updated schedule data
     * @param {string} scheduleData.date - Date in YYYY-MM-DD format
     * @param {number[]} scheduleData.timeSlotIds - Array of time slot IDs
     * @param {number} scheduleData.price - Price for the schedule
     * @returns {Promise} Response with updated schedule data
     */
    static async updateSchedule(scheduleId, mentorId, scheduleData) {
        try {
            const response = await instance.put(`/api/schedules/${scheduleId}/mentor/${mentorId}`, scheduleData);
            return response;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    }

    // ==================== DELETE OPERATIONS ====================
    
    /**
     * Delete schedule
     * @param {number} scheduleId - Schedule ID
     * @param {number} mentorId - Mentor ID
     * @returns {Promise} Response confirmation
     */
    static async deleteSchedule(scheduleId, mentorId) {
        try {
            const response = await instance.delete(`/api/schedules/${scheduleId}/mentor/${mentorId}`);
            return response;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }

    // ==================== UTILITY METHODS ====================
    
    /**
     * Format schedule data for display
     * @param {Object} schedule - Schedule object
     * @returns {Object} Formatted schedule
     */
    static formatScheduleForDisplay(schedule) {
        if (!schedule) return null;
        
        return {
            ...schedule,
            formattedDate: new Date(schedule.date).toLocaleDateString('vi-VN'),
            formattedPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(schedule.price),
            sortedTimeSlots: schedule.timeSlots?.sort((a, b) => a.timeStart - b.timeStart) || []
        };
    }

    /**
     * Group schedules by date
     * @param {Array} schedules - Array of schedules
     * @returns {Object} Schedules grouped by date
     */
    static groupSchedulesByDate(schedules) {
        if (!schedules || !Array.isArray(schedules)) return {};
        
        return schedules.reduce((grouped, schedule) => {
            const date = schedule.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(this.formatScheduleForDisplay(schedule));
            return grouped;
        }, {});
    }

    /**
     * Check if schedule can be edited/deleted
     * @param {Object} schedule - Schedule object
     * @returns {boolean} True if schedule can be modified
     */
    static canModifySchedule(schedule) {
        if (!schedule) return false;
        
        // Cannot modify if already booked
        if (schedule.isBooked) return false;
        
        // Cannot modify if date is in the past
        const scheduleDate = new Date(schedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return scheduleDate >= today;
    }

    /**
     * Validate schedule data before creating/updating
     * @param {Object} scheduleData - Schedule data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    static validateScheduleData(scheduleData) {
        const errors = [];
        
        if (!scheduleData.date) {
            errors.push('Vui lòng chọn ngày');
        } else {
            const selectedDate = new Date(scheduleData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.push('Không thể tạo lịch cho ngày trong quá khứ');
            }
        }
        
        if (!scheduleData.timeSlotIds || !Array.isArray(scheduleData.timeSlotIds) || scheduleData.timeSlotIds.length === 0) {
            errors.push('Vui lòng chọn ít nhất một khung giờ');
        }
        
        if (!scheduleData.price || scheduleData.price <= 0) {
            errors.push('Vui lòng nhập giá hợp lệ');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default ScheduleService;
