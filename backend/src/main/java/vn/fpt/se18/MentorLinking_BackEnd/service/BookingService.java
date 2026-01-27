package vn.fpt.se18.MentorLinking_BackEnd.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBookingRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
        /**
         * Create a booking and return PayOS checkout URL
         *
         * @param customerId  customer id (user booking)
         * @param request     create booking request with schedule and description
         * @param httpRequest HTTP request
         * @return PayOS checkout URL
         */
        String createBookingAndGetPaymentUrl(Long customerId, CreateBookingRequest request, HttpServletRequest httpRequest)
            throws Exception;

        /**
         * Handle PayOS payment result (webhook or return URL)
         *
         * @param orderCode       booking id used as PayOS orderCode
         * @param success         whether PayOS reports success
         * @param transactionCode transaction reference from PayOS (reference/paymentLinkId)
         * @return mentor id for redirect to mentor page
         */
        Long handlePaymentCallback(Long orderCode, boolean success, String transactionCode) throws Exception;

    /**
     * Clean up unpaid bookings - delete bookings without payment history older than 15 minutes
     */
    void cleanupUnpaidBookings() throws Exception;

    /**
     * Get bookings for a customer filtered by provided payment processes
     *
     * @param customerId id of the customer
     * @return list of BookingResponse
     */
    List<BookingResponse> getBookingsByCustomerAndPaymentProcesses(Long customerId) throws Exception;

    /**
     * Cancel a booking by customer. Rules:
     * - Only the owner (customer) can cancel
     * - Only allowed when paymentProcess is COMPLETED
     * - Only allowed at least 3 hours before the earliest time slot of the schedule
     * On success: booking.status -> CANCELLED, booking.paymentProcess -> WAIT_REFUND
     *
     * @param customerId id of the customer requesting cancel
     * @param bookingId  id of the booking to cancel
     */
    void cancelBooking(Long customerId, Long bookingId) throws Exception;

    void handleBookingAction(Long bookingId, String action, String cancelReason) throws Exception;
}
