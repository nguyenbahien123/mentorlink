package vn.fpt.se18.MentorLinking_BackEnd.service;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Map;

public interface VNPayService {
    /**
     * Create a VNPay payment URL
     * 
     * @param orderId booking id
     * @param amount  amount to pay in VND
     * @param request HTTP request to get client IP
     * @return payment URL
     */
    String createPaymentUrl(Long orderId, BigDecimal amount, HttpServletRequest request) throws Exception;

    /**
     * Verify VNPay payment response
     * 
     * @param params all parameters from VNPay callback
     * @return true if signature is valid
     */
    boolean verifyPaymentResponse(Map<String, String> params) throws Exception;
}
