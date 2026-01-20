package vn.fpt.se18.MentorLinking_BackEnd.service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface EmailService {
    public void sendConfirmBooking(String to, String subject, String studentName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String linkMeeting);

    public void sendRequestFeedback(String to, String subject, String body);

    public void sendRejectBooking(String to, String subject, String studentName, String reason);

    public void sendRejectBooking1(String to, String subject, String studentName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String reason);

    public void send(String to, String subject, String text);

    public void sendOtp(String to, String subject, String otpCode);

    public void sendMentorRejection(String to, String mentorName, String reason);

    public void sendPasswordResetEmail(String to, String subject, String userName, String resetLink, int expiryMinutes);
}
