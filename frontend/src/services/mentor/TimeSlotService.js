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
     * Check if time slot is in the past for today
     * @param {Object} timeSlot - Time slot object
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {boolean} True if time slot is in the past
     */
    static isTimeSlotInPast(timeSlot, date) {
        if (!timeSlot || !date) return false;
        
        const selectedDate = new Date(date);
        const today = new Date();
        
        // If date is not today, it's not in the past
        if (selectedDate.toDateString() !== today.toDateString()) {
            return false;
        }
        
        // Check if current time has passed the time slot
        const currentHour = today.getHours();
        return currentHour >= timeSlot.timeEnd;
    }
}

export default TimeSlotService;