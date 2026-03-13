package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PaymentDataResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.PayOsService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsServiceImpl implements PayOsService {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.api-base:https://api-merchant.payos.vn}")
    private String apiBaseUrl;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url:https://mentorlink.io.vn/find-mentor?bookingSuccess=false}")
    private String cancelUrl;

    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    @Override
    public String createPaymentUrl(Long orderId, BigDecimal amount, String description) throws Exception {
        // Reuse createPaymentData and extract checkoutUrl
        PaymentDataResponse paymentData = createPaymentData(orderId, amount, description);
        if (paymentData == null || paymentData.getCheckoutUrl() == null || paymentData.getCheckoutUrl().isBlank()) {
            throw new RuntimeException("Không tạo được URL thanh toán PayOS");
        }
        return paymentData.getCheckoutUrl();
    }

    @Override
    public PaymentDataResponse createPaymentData(Long orderId, BigDecimal amount, String description) throws Exception {
        long orderCode = orderId;
        int amountValue = amount.setScale(0, RoundingMode.HALF_UP).intValueExact();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", amountValue);

        // PayOS limits description to 25 characters. Ensure we never send longer values.
        String safeDescription = Optional.ofNullable(description).orElse("");
        if (safeDescription.length() > 25) {
            log.warn("Description too long for PayOS ({} chars). Truncating to 25 for order {}", safeDescription.length(), orderCode);
            safeDescription = safeDescription.substring(0, 25);
        }

        body.put("description", safeDescription);
        body.put("cancelUrl", cancelUrl);
        body.put("returnUrl", returnUrl);
        body.put("signature", createPaymentRequestSignature(amountValue, cancelUrl, safeDescription, orderCode, returnUrl));

        log.info("Calling PayOS to create payment data for order {}", orderCode);

        Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri(apiBaseUrl + "/v2/payment-requests")
                .header("x-client-id", clientId)
                .header("x-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .onErrorResume(ex -> {
                    log.error("PayOS create payment failed", ex);
                    return Mono.empty();
                })
                .block();

        if (response == null || response.isEmpty()) {
            throw new RuntimeException("Không tạo được dữ liệu thanh toán PayOS");
        }

        String code = (String) response.get("code");
        if (!"00".equals(code)) {
            throw new RuntimeException("PayOS trả về lỗi: " + response.getOrDefault("desc", "Unknown error"));
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) response.get("data");
        if (data == null || data.isEmpty()) {
            throw new RuntimeException("PayOS không trả về dữ liệu thanh toán");
        }

        // Extract all payment data from PayOS response
        return PaymentDataResponse.builder()
                .bookingId(orderId)
                .orderCode(orderCode)
                .amount(amount)
                .currency("VND")
                .description(safeDescription)
                .bin((String) data.get("bin"))
                .accountNumber((String) data.get("accountNumber"))
                .accountName((String) data.get("accountName"))
                .qrCode((String) data.get("qrCode"))
                .checkoutUrl((String) data.get("checkoutUrl"))
                .paymentLinkId((String) data.get("paymentLinkId"))
                .status((String) data.get("status"))
                .build();
    }

    @Override
    public boolean verifyWebhookSignature(Map<String, Object> payload) throws Exception {
        if (payload == null) {
            return false;
        }
        Object dataObj = payload.get("data");
        Object signatureObj = payload.get("signature");
        if (dataObj == null || signatureObj == null) {
            return false;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> data = objectMapper.convertValue(dataObj, new TypeReference<Map<String, Object>>() {});
        String signature = String.valueOf(signatureObj);
        String computed = generateSignatureFromData(data);
        boolean match = signature.equalsIgnoreCase(computed);
        log.info("PayOS webhook signature valid: {}", match);
        return match;
    }

    @Override
    public boolean isPaymentSucceeded(Long orderCode) {
        try {
            Map<String, Object> response = webClientBuilder.build()
                    .get()
                    .uri(apiBaseUrl + "/v2/payment-requests/" + orderCode)
                    .header("x-client-id", clientId)
                    .header("x-api-key", apiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || !"00".equals(response.get("code"))) {
                log.warn("PayOS status query failed for order {}: {}", orderCode, response);
                return false;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data == null) {
                return false;
            }

            Object statusObj = data.get("status");
            String status = statusObj != null ? statusObj.toString().toUpperCase(Locale.ROOT) : "";
            if ("PAID".equals(status) || "SUCCEEDED".equals(status) || "COMPLETED".equals(status)) {
                return true;
            }

            Object remaining = data.get("amountRemaining");
            if (remaining != null) {
                try {
                    long remainValue = Long.parseLong(remaining.toString());
                    return remainValue == 0;
                } catch (NumberFormatException ignored) {
                    // Ignore parse error and fall through
                }
            }
            return false;
        } catch (Exception ex) {
            log.error("Error while checking PayOS payment status for order {}", orderCode, ex);
            return false;
        }
    }

    private String createPaymentRequestSignature(int amount, String cancelUrl, String description, long orderCode, String returnUrl) throws Exception {
        // PayOS signature format: DO NOT URL encode for payment request signature
        // Only use plain values sorted alphabetically
        String data = "amount=" + amount
                + "&cancelUrl=" + cancelUrl
                + "&description=" + description
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;
        log.debug("PayOS signature data: {}", data);
        return hmacSha256(checksumKey, data);
    }

    private String generateSignatureFromData(Map<String, Object> data) throws Exception {
        if (data == null || data.isEmpty()) {
            return "";
        }
        List<String> keys = new ArrayList<>(data.keySet());
        Collections.sort(keys);

        List<String> pairs = new ArrayList<>();
        for (String key : keys) {
            Object valueObj = data.get(key);
            String value;
            if (valueObj == null || "null".equalsIgnoreCase(String.valueOf(valueObj)) || "undefined".equalsIgnoreCase(String.valueOf(valueObj))) {
                value = "";
            } else if (valueObj instanceof Map || valueObj instanceof Collection) {
                // Sort nested maps for deterministic signature
                Object normalized = normalizeNested(valueObj);
                value = objectMapper.writeValueAsString(normalized);
            } else {
                value = String.valueOf(valueObj);
            }
            pairs.add(key + "=" + urlEncode(value));
        }

        String dataStr = String.join("&", pairs);
        return hmacSha256(checksumKey, dataStr);
    }

    private Object normalizeNested(Object valueObj) {
        if (valueObj instanceof Map<?, ?> map) {
            Map<String, Object> sorted = new TreeMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                sorted.put(String.valueOf(entry.getKey()), normalizeNested(entry.getValue()));
            }
            return sorted;
        }
        if (valueObj instanceof Collection<?> col) {
            List<Object> list = new ArrayList<>();
            for (Object item : col) {
                list.add(normalizeNested(item));
            }
            return list;
        }
        return valueObj;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(Optional.ofNullable(value).orElse(""), StandardCharsets.UTF_8);
    }

    private String hmacSha256(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(result);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
