package vn.fpt.se18.MentorLinking_BackEnd.service;

public interface OtpService {

    /**
     * Tạo và gửi OTP qua email
     * @param email email người dùng
     * @return true nếu thành công
     */
    boolean generateAndSendOtp(String email);

    /**
     * Xác thực OTP
     * @param email email người dùng
     * @param otpCode mã OTP
     * @return true nếu OTP hợp lệ
     */
    boolean verifyOtp(String email, String otpCode);

    /**
     * Gửi lại OTP (hủy OTP cũ và tạo OTP mới)
     * @param email email người dùng
     * @return true nếu thành công
     */
    boolean resendOtp(String email);

    /**
     * Hủy tất cả OTP đang hoạt động của email
     * @param email email người dùng
     */
    void cancelActiveOtp(String email);
}
