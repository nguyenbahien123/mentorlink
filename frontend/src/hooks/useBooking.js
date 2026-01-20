import { useState, useCallback } from 'react';
import { createBookingAndGetPaymentUrl } from '../services/booking/bookingApi';

export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // createBooking now accepts an optional `service` parameter (matching backend enum)
    const createBooking = useCallback(async (scheduleId, description, service = 'OTHERS') => {
        setLoading(true);
        setError('');

        try {
            const response = await createBookingAndGetPaymentUrl(scheduleId, description, service);

            if (response.respCode === '0' && response.data) {
                return {
                    success: true,
                    paymentUrl: response.data,
                };
            } else {
                setError(response.description || 'Tạo đơn đặt lịch thất bại');
                return {
                    success: false,
                    error: response.description,
                };
            }
        } catch (err) {
            const errorMessage = err.description || 'Lỗi khi tạo đơn đặt lịch';
            setError(errorMessage);
            console.error('Booking error:', err);
            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createBooking,
    };
};
