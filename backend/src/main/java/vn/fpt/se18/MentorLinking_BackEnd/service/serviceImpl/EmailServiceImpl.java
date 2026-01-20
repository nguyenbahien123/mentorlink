package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final SpringTemplateEngine templateEngine;

    private final JavaMailSender mailSender;

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

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(message);
            log.info("✅ Email xác nhận gửi thành công đến {}", to);

        } catch (MessagingException e) {
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

            // ✅ 2. Render HTML từ template `reject-email.html`
            String htmlContent = templateEngine.process("booking-reject-email.html", context);

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email từ chối gửi thành công đến {}", to);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi email từ chối: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

    @Override
    public void send(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // plain text

            mailSender.send(message);
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

            // ✅ 2. Render HTML từ template `reject-email.html`
            String htmlContent = templateEngine.process("booking-reject-email.html", context);

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email từ chối gửi thành công đến {}", to);

        } catch (MessagingException e) {
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

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(message);
            log.info("✅ Email OTP gửi thành công đến {}", to);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi email OTP: {}", e.getMessage());
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

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject("Thông báo từ chối đăng ký Mentor - MentorLink");
            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(message);
            log.info("✅ Email từ chối Mentor gửi thành công đến {}", to);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi email từ chối Mentor: {}", e.getMessage());
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

            // ✅ 3. Gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nguyenbahien170604@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(message);
            log.info("✅ Email reset password gửi thành công đến {}", to);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi email reset password: {}", e.getMessage());
            throw new AppException(ErrorCode.SEND_MAIL_FAILED);
        }
    }

}
