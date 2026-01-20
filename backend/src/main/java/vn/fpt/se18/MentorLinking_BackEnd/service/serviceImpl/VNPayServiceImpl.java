package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.service.VNPayService;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.apiUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @Override
    public String createPaymentUrl(Long orderId, BigDecimal amount, HttpServletRequest request) throws Exception {
        log.info("Creating payment URL for order: {}, amount: {}", orderId, amount);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        String orderType = "billpayment";
        String vnp_TxnRef = String.valueOf(orderId);
        String vnp_IpAddr = request.getRemoteAddr();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).intValue()));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // Sort parameters
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8))
                        .append('&');
                query.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8))
                        .append('&');
            }
        }

        String queryUrl = query.substring(0, query.length() - 1);
        String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString().substring(0, hashData.length() - 1));
        String paymentUrl = vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + secureHash;

        log.info("Payment URL created successfully");
        return paymentUrl;
    }

    @Override
    public boolean verifyPaymentResponse(Map<String, String> params) throws Exception {
        log.info("Verifying payment response");
        log.info("Received parameters: {}", params.keySet());

        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
            log.warn("Missing vnp_SecureHash in response");
            return false;
        }

        // Create a copy to avoid modifying original params
        Map<String, String> paramsCopy = new HashMap<>(params);
        
        // Remove vnp_SecureHash and vnp_SecureHashType from params copy
        paramsCopy.remove("vnp_SecureHash");
        paramsCopy.remove("vnp_SecureHashType");

        // Sort parameters
        List<String> fieldNames = new ArrayList<>(paramsCopy.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = paramsCopy.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                log.debug("Parameter: {} = {}", fieldName, fieldValue);
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8))
                        .append('&');
            }
        }

        String hashDataStr = hashData.length() > 0 ? hashData.substring(0, hashData.length() - 1) : "";
        String checkSum = hmacSHA512(vnp_HashSecret, hashDataStr);
        
        log.info("=== VNPay Signature Verification ===");
        log.info("Secret Key: {}", vnp_HashSecret);
        log.info("Received hash: {}", vnp_SecureHash);
        log.info("Computed hash: {}", checkSum);
        
        // Case-insensitive comparison (VNPay sends lowercase, we compute uppercase)
        boolean isValid = checkSum.equalsIgnoreCase(vnp_SecureHash);
        log.info("Hash match: {}", isValid);
        log.info("Hash data (first 200 chars): {}", hashDataStr.length() > 200 ? hashDataStr.substring(0, 200) + "..." : hashDataStr);
        log.info("Payment signature valid: {}", isValid);
        return isValid;
    }    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hmacData).toUpperCase();
    }
}
