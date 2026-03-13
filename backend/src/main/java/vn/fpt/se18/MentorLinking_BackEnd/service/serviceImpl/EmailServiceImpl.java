package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import sendinblue.ApiClient;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final SpringTemplateEngine templateEngine;
    private final TransactionalEmailsApi brevoApi;
    private final String senderEmail;
    private final String senderName;

    public EmailServiceImpl(
            SpringTemplateEngine templateEngine,
            @Value("${brevo.api-key}") String brevoApiKey,
            @Value("${brevo.sender.email:nguyenbahien170604@gmail.com}") String senderEmail,
            @Value("${brevo.sender.name:MentorLink}") String senderName) {
        this.templateEngine = templateEngine;
        this.senderEmail = senderEmail;
        this.senderName = senderName;

        // Khởi tạo Brevo API Client
        log.info("🔧 Initializing Brevo Email Service...");
        log.info("   Sender Email: {}", senderEmail);
        log.info("   Sender Name: {}", senderName);
        
        if (brevoApiKey == null || brevoApiKey.isEmpty() || brevoApiKey.equals("${BREVO_API_KEY}")) {
            log.error("❌ BREVO_API_KEY không được cấu hình đúng! Giá trị hiện tại: {}", 
                brevoApiKey == null ? "null" : (brevoApiKey.isEmpty() ? "empty" : "không phân giải được"));
            throw new IllegalStateException("BREVO_API_KEY chưa được cấu hình trong environment variables");
        }
        
        log.info("   API Key: {}...{}", brevoApiKey.substring(0, 15), brevoApiKey.substring(brevoApiKey.length() - 10));
        
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
        apiKey.setApiKey(brevoApiKey);
        this.brevoApi = new TransactionalEmailsApi();
        
        log.info("✅ Brevo Email Service initialized successfully");
    }

    /**
     * Helper method để gửi email qua Brevo API
     */
    private void sendBrevoEmail(String to, String subject, String htmlContent) {
        try {
            log.info("📧 Chuẩn bị gửi email đến: {}", to);
            log.info("   Subject: {}", subject);
            log.info("   Sender: {} <{}>", senderName, senderEmail);
            
            SendSmtpEmail email = new SendSmtpEmail();
            
            // Thiết lập người gửi
            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail(senderEmail);
            sender.setName(senderName);
            email.setSender(sender);
            
            // Thiết lập người nhận
            SendSmtpEmailTo recipient = new SendSmtpEmailTo();
            recipient.setEmail(to);
            email.setTo(List.of(recipient));
            
            // Thiết lập nội dung
            email.setSubject(subject);
            email.setHtmlContent(htmlContent);
            
            // Gửi email
            log.info("🚀 Đang gửi email qua Brevo API...");
            brevoApi.sendTransacEmail(email);
            log.info("✅ Email gửi thành công đến {} qua Brevo", to);
            
        } catch (sendinblue.ApiException e) {
            log.error("❌ Lỗi gửi email qua Brevo API:");
            log.error("   Response Code: {}", e.getCode());
            log.error("   Response Body: {}", e.getResponseBody());
            log.error("   Error Message: {}", e.getMessage());
            
            if (e.getCode() == 401) {
                log.error("💡 Lỗi 401 Unauthorized - Các nguyên nhân có thể:");
                log.error("   1. API Key không hợp lệ hoặc đã hết hạn");
                log.error("   2. Sender email '{}' chưa được verify trong Brevo", senderEmail);
                log.error("   3. Tài khoản Brevo chưa được kích hoạt");
                log.error("💡 Hướng dẫn fix:");
                log.error("   - Truy cập https://app.brevo.com/settings/keys/api");
                log.error("   - Verify API key còn hoạt động");
                log.error("   - Verify sender email tại https://app.brevo.com/senders");
            }
            
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        } catch (Exception e) {
            log.error("❌ Lỗi không xác định khi gửi email: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendConfirmBooking(String to, String subject, String studentName, String mentorName, String service,
        LocalDate date, List<Long[]> bookingTimes, String linkMeeting) {

        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("studentName", studentName);
            model.put("date", date);
            model.put("bookingTimes", bookingTimes);
            model.put("googleMeetLink", linkMeeting);
            model.put("serviceName", service);
            model.put("mentorName", mentorName);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `lesson-email.html`
            String htmlContent = templateEngine.process("lesson-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email xác nhận: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendRejectBooking(String to, String subject, String studentName,  String reason) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("studentName", studentName);
            model.put("reason", reason);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `booking-reject-email.html`
            String htmlContent = templateEngine.process("booking-reject-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email từ chối: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void send(String to, String subject, String text) {
        try {
            // Gửi plain text qua Brevo (wrap trong HTML đơn giản)
            String htmlContent = "<html><body><p>" + text.replace("\n", "<br>") + "</p></body></html>";
            sendBrevoEmail(to, subject, htmlContent);
            
        } catch (Exception e) {
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendRequestFeedback(String to, String subject, String text) {
        // TODO: Có thể thêm template riêng cho feedback
    }

    @Override
    public void sendRejectBooking1(String to, String subject, String studentName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String reason) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("studentName", studentName);
            model.put("reason", reason);
            model.put("date", date);
            model.put("bookingTimes", bookingTimes);
            model.put("serviceName", service);
            model.put("mentorName", mentorName);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `booking-reject-email.html`
            String htmlContent = templateEngine.process("booking-reject-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email từ chối: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendOtp(String to, String subject, String otpCode) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("otpCode", otpCode);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `otp-email.html`
            String htmlContent = templateEngine.process("otp-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email OTP: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendMentorBookingNotification(String to, String subject, String menteeName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String linkMeeting) {
        try {
            Map<String, Object> model = new HashMap<>();
            model.put("menteeName", menteeName != null ? menteeName : "Học viên");
            model.put("mentorName", mentorName != null ? mentorName : "Mentor");
            model.put("serviceName", service);
            model.put("date", date);
            model.put("bookingTimes", bookingTimes);
            model.put("googleMeetLink", linkMeeting);

            Context context = new Context();
            context.setVariables(model);

            String htmlContent = templateEngine.process("booking-confirm-mentor.html", context);

            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email thông báo mentor có booking: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendBookingSuccessToMentee(String to, String subject, String menteeName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String linkMeeting) {
        try {
            Map<String, Object> model = new HashMap<>();
            model.put("menteeName", menteeName != null ? menteeName : "bạn");
            model.put("mentorName", mentorName != null ? mentorName : "Mentor");
            model.put("serviceName", service);
            model.put("date", date);
            model.put("bookingTimes", bookingTimes);
            model.put("googleMeetLink", linkMeeting);

            Context context = new Context();
            context.setVariables(model);

            String htmlContent = templateEngine.process("booking-success-mentee.html", context);
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email đặt lịch thành công cho mentee: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendMentorRejection(String to, String mentorName, String reason) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("mentorName", mentorName != null ? mentorName : "bạn");
            model.put("reason", reason);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `mentor-rejection-email.html`
            String htmlContent = templateEngine.process("mentor-rejection-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, "Thông báo từ chối đăng ký Mentor - MentorLink", htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email từ chối Mentor: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendMentorCreated(String to, String subject, String mentorName) {
        try {
            log.info("Preparing mentor-created email: to={}, subject={}, mentorName={}", to, subject, mentorName);
            Map<String, Object> model = new HashMap<>();
            model.put("mentorName", mentorName != null ? mentorName : "bạn");

            Context context = new Context();
            context.setVariables(model);

            String htmlContent = templateEngine.process("mentor-created-email.html", context);
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email thông báo tạo Mentor: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendMentorActivated(String to, String subject, String mentorName) {
        try {
            log.info("Preparing mentor-activated email: to={}, subject={}, mentorName={}", to, subject, mentorName);
            Map<String, Object> model = new HashMap<>();
            model.put("mentorName", mentorName != null ? mentorName : "bạn");

            Context context = new Context();
            context.setVariables(model);

            String htmlContent = templateEngine.process("mentor-activated-email.html", context);
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email thông báo kích hoạt Mentor: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String subject, String userName, String resetLink, int expiryMinutes) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("userName", userName != null ? userName : "bạn");
            model.put("resetLink", resetLink);
            model.put("expiryMinutes", expiryMinutes);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `password-reset-email.html`
            String htmlContent = templateEngine.process("password-reset-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email reset password: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void sendReviewEmail(String to, String subject, String menteeName, String mentorName, String reviewLink, int expiryHours) {
        try {
            // ✅ 1. Chuẩn bị dữ liệu để inject vào template
            Map<String, Object> model = new HashMap<>();
            model.put("menteeName", menteeName != null ? menteeName : "bạn");
            model.put("mentorName", mentorName);
            model.put("reviewLink", reviewLink);
            model.put("expiryHours", expiryHours);

            Context context = new Context();
            context.setVariables(model);

            // ✅ 2. Render HTML từ template `booking-review-email.html`
            String htmlContent = templateEngine.process("booking-review-email.html", context);

            // ✅ 3. Gửi email HTML qua Brevo
            sendBrevoEmail(to, subject, htmlContent);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email đánh giá booking: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

}
