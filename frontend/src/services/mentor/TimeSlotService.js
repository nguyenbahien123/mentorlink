import { instance, authInstance } from '../../api/axios';

/**
 * Time Slot Service - Operations for time slots
 */
class TimeSlotService {
    
    /**
     * Get all available time slots
     * @returns {Promise} Response with time slots data
     */
    static async getTimeSlots() {
        try {
            const response = await instance.get(`/api/time-slots`);
            return response;
        } catch (error) {
            console.error('Error fetching time slots:', error);
            throw error;
        }
    }

    /**
     * Format time slot for display
     * @param {Object} timeSlot - Time slot object
     * @returns {Object} Formatted time slot
     */
    static formatTimeSlot(timeSlot) {
        if (!timeSlot) return null;
        
        const formatTime = (hour) => {
            return hour.toString().padStart(2, '0') + ':00';
        };
        
        return {
            ...timeSlot,
            displayText: `${formatTime(timeSlot.timeStart)} - ${formatTime(timeSlot.timeEnd)}`,
            label: `${formatTime(timeSlot.timeStart)} - ${formatTime(timeSlot.timeEnd)}`
        };
    }

    /**
     * Format multiple time slots for display
     * @param {Array} timeSlots - Array of time slot objects
     * @returns {Array} Array of formatted time slots
     */
    static formatTimeSlots(timeSlots) {
        if (!timeSlots || !Array.isArray(timeSlots)) return [];
        
        return timeSlots
            .map(slot => this.formatTimeSlot(slot))
            .sort((a, b) => a.timeStart - b.timeStart);
    }

    /**
     * Get time slots grouped by categories (morning, afternoon, evening)
     * @param {Array} timeSlots - Array of time slot objects
     * @returns {Object} Time slots grouped by categories
     */
    static groupTimeSlotsByCategory(timeSlots) {
        if (!timeSlots || !Array.isArray(timeSlots)) return {};
        
        const formattedSlots = this.formatTimeSlots(timeSlots);
        
        return formattedSlots.reduce((grouped, slot) => {
            let category;
            if (slot.timeStart < 12) {
                category = 'morning';
            } else if (slot.timeStart < 18) {
                category = 'afternoon';
            } else {
                category = 'evening';
            }
            
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(slot);
            return grouped;
        }, {});
    }

    /**
     * Get category label in Vietnamese
     * @param {string} category - Category key
     * @returns {string} Vietnamese label
     */
    static getCategoryLabel(category) {
        const labels = {
            morning: 'Buổi sáng (8h-12h)',
            afternoon: 'Buổi chiều (12h-18h)', 
            evening: 'Buổi tối (18h-22h)'
        };
        return labels[category] || category;
    }

    /**
     * Get category color for UI
     * @param {string} category - Category key
     * @returns {string} Color class or hex color
     */
    static getCategoryColor(category) {
        const colors = {
            morning: 'success',
            afternoon: 'primary',
            evening: 'warning'
        };
        return colors[category] || 'secondary';
    }

    /**
     * Check if time slot is in the past or less than 3 hours from now
     * @param {Object} timeSlot - Time slot object
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {boolean} True if time slot cannot be selected (past or < 3 hours away)
     */
    static isTimeSlotInPast(timeSlot, date) {
        if (!timeSlot || !date) return false;
        
        const now = new Date();
        
        // Parse date string (format: YYYY-MM-DD)
        const [year, month, day] = date.split('-').map(Number);
        
        // Tạo datetime với date và timeStart của slot
        const slotDateTime = new Date(year, month - 1, day, timeSlot.timeStart, 0, 0, 0);
        
        // Tính số giờ chênh lệch
        const hoursDiff = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Disable nếu slot cách hiện tại < 3 giờ
        // (bao gồm cả slot đã qua và slot sắp tới trong vòng 3 giờ)
        return hoursDiff < 3;
    }
}

export default TimeSlotService;