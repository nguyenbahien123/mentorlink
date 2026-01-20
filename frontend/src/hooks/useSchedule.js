import { useState, useEffect } from 'react';
import ScheduleService from '../services/mentor/ScheduleService';

/**
 * Custom hook for managing mentor schedules
 * @param {number} mentorId - Mentor ID
 * @returns {Object} Schedule state and methods
 */
const useSchedule = (mentorId) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupedSchedules, setGroupedSchedules] = useState({});

    /**
     * Fetch upcoming schedules (next 3 days)
     */
    const fetchUpcomingSchedules = async () => {
        if (!mentorId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await ScheduleService.getUpcomingSchedules(mentorId);

            if (response.respCode === "0" && Array.isArray(response.data)) {
                // Filter and sort schedules - only next 3 days
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const threeDaysLater = new Date(today);
                threeDaysLater.setDate(threeDaysLater.getDate() + 3);

                const filteredSchedules = response.data.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    scheduleDate.setHours(0, 0, 0, 0);
                    return scheduleDate >= today && scheduleDate < threeDaysLater;
                });

                // Sort by date
                const sorted = filteredSchedules.sort((a, b) =>
                    new Date(a.date) - new Date(b.date)
                );

                setSchedules(sorted);
                groupSchedulesByDate(sorted);
            } else {
                setSchedules([]);
                setGroupedSchedules({});
            }
        } catch (err) {
            setError(err.message || 'Không thể tải lịch công tác');
            console.error('Error fetching schedules:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Group schedules by date for easier rendering
     */
    const groupSchedulesByDate = (scheduleList) => {
        const grouped = scheduleList.reduce((acc, schedule) => {
            const date = schedule.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(schedule);
            return acc;
        }, {});

        setGroupedSchedules(grouped);
    };

    /**
     * Sort time slots within a schedule
     */
    const getSortedTimeSlots = (schedule) => {
        if (!schedule.timeSlots || !Array.isArray(schedule.timeSlots)) {
            return [];
        }
        return [...schedule.timeSlots].sort((a, b) => a.timeStart - b.timeStart);
    };

    /**
     * Format time display (e.g., "09:00 - 10:00")
     */
    const formatTimeSlot = (timeStart, timeEnd) => {
        const formatHour = (hour) => {
            return `${String(hour).padStart(2, '0')}:00`;
        };
        return `${formatHour(timeStart)} - ${formatHour(timeEnd)}:00`;
    };

    /**
     * Format date display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Ho_Chi_Minh'
        };
        return new Intl.DateTimeFormat('vi-VN', options).format(date);
    };

    /**
     * Get date label (Today, Tomorrow, etc.)
     */
    const getDateLabel = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const scheduleDate = new Date(dateString);
        scheduleDate.setHours(0, 0, 0, 0);

        const diffTime = scheduleDate - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Ngày mai';
        if (diffDays === 2) return 'Ngày kia';

        return formatDate(dateString);
    };

    /**
     * Format price in VND
     */
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    /**
     * Book a schedule slot
     */
    const bookSlot = async (scheduleId, timeSlotId, bookingData = {}) => {
        try {
            const response = await ScheduleService.bookScheduleSlot(
                scheduleId,
                timeSlotId,
                bookingData
            );

            if (response.respCode === "0") {
                // Refresh schedules after booking
                await fetchUpcomingSchedules();
                return response;
            } else {
                throw new Error(response.description || 'Đặt lịch thất bại');
            }
        } catch (err) {
            throw err;
        }
    };

    // Fetch schedules on component mount or when mentorId changes
    useEffect(() => {
        fetchUpcomingSchedules();
    }, [mentorId]);

    return {
        schedules,
        groupedSchedules,
        loading,
        error,
        fetchUpcomingSchedules,
        getSortedTimeSlots,
        formatTimeSlot,
        formatDate,
        getDateLabel,
        formatPrice,
        bookSlot
    };
};

export default useSchedule;
