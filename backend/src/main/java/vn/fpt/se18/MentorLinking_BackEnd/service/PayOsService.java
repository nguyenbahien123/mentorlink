package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PaymentDataResponse;

import java.math.BigDecimal;
import java.util.Map;

public interface PayOsService {
    /**
     * Create payment and get checkout URL for redirect.
     *
     * @param orderId   booking id used as orderCode
     * @param amount    amount in VND (integer value expected)
     * @param description description shown on PayOS (max 25 chars)
     * @return checkout URL to redirect user to PayOS payment page
     */
    String createPaymentUrl(Long orderId, BigDecimal amount, String description) throws Exception;

    /**
     * Create payment data with QR code for embedded payment.
     *
     * @param orderId   booking id used as orderCode
     * @param amount    amount in VND (integer value expected)
     * @param description description shown on PayOS (max 25 chars)
     * @return PaymentDataResponse with QR code, account info, and checkout URL
     */
    PaymentDataResponse createPaymentData(Long orderId, BigDecimal amount, String description) throws Exception;

    /**
     * Verify webhook payload from PayOS using checksum key.
     *
     * @param payload full webhook payload (code, desc, success, data, signature)
     * @return true when signature matches checksum key
     */
    boolean verifyWebhookSignature(Map<String, Object> payload) throws Exception;

    /**
     * Query PayOS for the latest payment status of an order.
     *
     * @param orderCode booking id / order code
     * @return true if PayOS reports the link is paid/succeeded
     */
    boolean isPaymentSucceeded(Long orderCode);
}
