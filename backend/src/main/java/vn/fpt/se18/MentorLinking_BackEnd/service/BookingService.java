package vn.fpt.se18.MentorLinking_BackEnd.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBookingRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    /**
     * Create a booking and return VNPay payment URL
     * 
     * @param customerId  customer id (user booking)
     * @param request     create booking request with schedule and description
     * @param httpRequest HTTP request
     * @return VNPay payment URL
     */
    String createBookingAndGetPaymentUrl(Long customerId, CreateBookingRequest request, HttpServletRequest httpRequest)
            throws Exception;

    /**
     * Handle VNPay payment callback
     * 
     * @param vnp_TxnRef        transaction reference (booking id)
     * @param vnp_ResponseCode  response code from VNPay
     * @param vnp_TransactionNo transaction number from VNPay
     * @return mentor id for redirect to mentor page
     */
    Long handlePaymentCallback(String vnp_TxnRef, String vnp_ResponseCode, String vnp_TransactionNo) throws Exception;

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
