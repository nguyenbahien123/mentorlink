package vn.fpt.se18.MentorLinking_BackEnd.util;

public enum OtpStatus {
    ACTIVE,    // OTP đang hoạt động
    EXPIRED,   // OTP đã hết hạn
    USED,      // OTP đã được sử dụng
    CANCELLED  // OTP đã bị hủy bỏ (khi người dùng yêu cầu gửi lại)
}
